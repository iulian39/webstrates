
const coreJsonML = require('./coreJsonML');
const PathTree = require('./corePathTree');
const coreUtils = require('./coreUtils');
const base64utils = require('./base64utils');

const ATTRIBUTE_INDEX = 1;

const observerOptions = {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeOldValue: true,
        characterDataOldValue: true
};

let docObserver;
let docElement;


function observe(documentElement) {

    docElement = documentElement;

    let mutationsHandler = (mutations) => {
        console.log(mutations);
        for (mutation of mutations) {
            const targetPathNode = PathTree.getPathNode(mutation.target);

            const elementTarget = mutation.target.nodeType === document.ELEMENT_NODE
                ? mutation.target
                : mutation.target.parentElement;
            const elementPathNode = PathTree.getPathNode(elementTarget);

            switch (mutation.type) {
                case 'attributes':
                    attributeMutation(mutation, targetPathNode); break;
                case 'characterData':
                    characterDataMutation(mutation, targetPathNode); break;
                case 'childList':
                    childListMutation(mutation, targetPathNode); break;
            }
        }
    }

    function childListMutation(mutation, targetPathNode) {
        
        Array.from(mutation.addedNodes).forEach(function(addedNode) {
            // Sanitizes all nodes (i.e. ensures valid tag names and attributes) and set wids on all nodes.
            const parentNode = mutation.target;

            let addedPathNode = PathTree.getPathNode(addedNode, parentNode);

            // If an element already has a pathNode, it means it's already in the DOM. This could still
            // generate an op if the element is being moved. However, if the element is already in the DOM,
            // and it has the same parent as before, then it hasn't moved, so there's no reason to generate
            // an op.
            //
            // NOTE: I think there might be a bug here: If moving a text node around, it could have a
            // pathNode, but also have the same parent, in which case the move wouldn't create an op.
            // I am, however, unable to reproduce this...
            if (addedPathNode && targetPathNode.id === addedPathNode.parent.id) {
                return;
            }

            coreUtils.recursiveForEach(addedNode, (childNode, parentNode) => {
                if (childNode.nodeType === document.ELEMENT_NODE) {
                    let sanitizedTagName = coreUtils.sanitizeString(childNode.tagName);
                    // If the name is unsanitized, we remove the element and replace it with an identical
                    // element with a sanitized tag name.
                    if (sanitizedTagName !== childNode.tagName) {
                        let replacementNode = document.createElementNS(childNode.tagName.namespaceURI,
                            sanitizedTagName);

                        // Move all children.
                        while (childNode.firstChild) {
                            coreUtils.appendChildWithoutScriptExecution(replacementNode, childNode.firstChild);
                        }

                        // Copy all attributes and sanitize them as well.
                        for (let i = 0; i < childNode.attributes.length; i++) {
                            let attr = childNode.attributes[i];
                            replacementNode.setAttribute(coreUtils.sanitizeString(attr.nodeName),
                                attr.nodeValue);
                        }

                        // Insert the element before childNode.
                        coreUtils.appendChildWithoutScriptExecution(childNode.parentElement,
                            replacementNode, childNode);
                        childNode.remove();
                        childNode = replacementNode;
                    } else {
                        // If we haven't replaced the element, we still have to sanitize the attributes.
                        for (let i = 0; i < childNode.attributes.length; i++) {
                            let attr = childNode.attributes[i];
                            let sanitizedNodeName = coreUtils.sanitizeString(attr.nodeName);
                            if (sanitizedNodeName !== attr.nodeName) {
                                childNode.removeAttribute(attr.nodeName);
                                childNode.setAttribute(sanitizedNodeName, attr.nodeValue);
                            }
                        }
                    }

                    // The element may being moved, and thus already is in the DOM and has a wid. We don't want
                    // to redefine this. Also, the element can't be transient, i.e. its parent has to be in
                    // the JsonML (targetPathNode must exist) and the element itself can't be transient.
                    //if (!childNode.__wid && targetPathNode && !config.isTransientElement(childNode)) {
                    //	const wid = coreUtils.randomString();
                    //	coreUtils.setWidOnElement(childNode, wid);
                    //}
                }
            }, parentNode);

            // The above wid/sanitization, we do recursively on each node, so one might naturally wonder why
            // we don't need to do the same here: Creating a PathTree (as below) happens recursively on all
            // child nodes automatically. When it comes to inserting the newly created PathTree afterwards,
            // that shouldn't happen recursively; we just need to add the newly created PathTree one place
            // in the existing tree.

            // If we can't create path node, it can't been registered in the JsonML at all, so creating
            // an op for it doesn't make sense. This happens for instance with transient elements.
            const newPathNode = PathTree.create(addedNode, targetPathNode);
            //if (!newPathNode) {
            //	coreEvents.triggerEvent('DOMNodeInserted', addedNode, mutation.target, true);
            //	return;
            //}

            // We use the previous sibling to insert the new element in the correct position in the path
            // tree. However, if the previous sibling doesn't have a webstrate object, it won't be in the
            // path tree, so it will appear that the element has no previous element. Therefore, we
            // traverse the list of previous siblings until we find one that does have a webstrate object.
            // Transient elements (outside of template tags) will righfully be absent from the pathtree,
            // and thus not have webstrate objects.
            // We have to use addedNode.previousSibling and not mutation.previousSibling, as this will
            // refer to the previousSibling when the element was inserted. If multiple elements (B, C) have
            // been inserted after element A, one after the each other, in one tick,
            // mutation.previousSibling will refer to A for both mutations, but mutation.previousSibling
            // will refer to A and B, respectively.
            let previousSibling = addedNode.previousSibling;
            let previousSiblingPathNode = PathTree.getPathNode(previousSibling, parentNode);
            while (previousSibling && !previousSiblingPathNode) {
                previousSibling = previousSibling.previousSibling;
                previousSiblingPathNode = PathTree.getPathNode(previousSibling, parentNode);
            }

            if (previousSibling) {
                const previousSiblingIndex = targetPathNode.children.indexOf(previousSiblingPathNode);
                targetPathNode.children.splice(previousSiblingIndex + 1, 0, newPathNode);
            } else if (addedNode.nextSibling) {
                targetPathNode.children.unshift(newPathNode);
            } else {
                targetPathNode.children.push(newPathNode);
            }
            const path = PathTree.getPathNode(addedNode, parentNode).toPath();
            newDoc = Automerge.change(window.amDoc, doc => {
                let parent = elementAtPath(doc, path.slice(0,-1));
                parent.splice(path[path.length - 1], 0, coreJsonML.fromHTML(addedNode))
            });

            let changes  = Automerge.getChanges(window.amDoc, newDoc)
            window.amDoc = newDoc;

            webstrate.signal({changes: base64utils.bytesToString(changes)});
        });

        Array.from(mutation.removedNodes).forEach(function(removedNode) {
            var removedPathNode = PathTree.getPathNode(removedNode, mutation.target);

            // If an element has no path node, it hasn't been registered in the JsonML at all, so it won't
            // exist on other clients, and therefore creating an op to delete it wouldn't make sense.
            if (!removedPathNode) {
                return;
            }

            const path = removedPathNode.toPath();
            removedPathNode.remove();
            newDoc = Automerge.change(window.amDoc, doc => {
                let parent = elementAtPath(doc, path.slice(0,-1));
                parent.splice(path[path.length - 1], 1)
            });
            let changes  = Automerge.getChanges(window.amDoc, newDoc)
            window.amDoc = newDoc;
            webstrate.signal({changes: base64utils.bytesToString(changes)});
        });

    }

    function characterDataMutation(mutation, targetPathNode) {
        const path = targetPathNode.toPath();

        const newValue = mutation.target.data.replace(/ /g, ' ');

        newDoc = Automerge.change(window.amDoc, doc => {
            let parent = elementAtPath(doc, path.slice(0,-1));
            parent[path[path.length - 1]] = newValue;
        });
        let changes  = Automerge.getChanges(window.amDoc, newDoc)
        window.amDoc = newDoc;
        webstrate.signal({changes: base64utils.bytesToString(changes)});
    }

    function attributeMutation(mutation, targetPathNode) {
        let attributeName = mutation.attributeName;
        const targetPathNodeJsonML = targetPathNode.toPath();

        newDoc = Automerge.change(window.amDoc, doc => {
            let node = elementAtPath(doc, targetPathNodeJsonML);
            node[ATTRIBUTE_INDEX][attributeName] = mutation.target.getAttribute(attributeName);
        });
        let changes  = Automerge.getChanges(window.amDoc, newDoc)
        window.amDoc = newDoc;
        webstrate.signal({changes: base64utils.bytesToString(changes)});
    }

    function elementAtPath(snapshot, path) {
        if (!path) {
            path = snapshot;
            snapshot = window.amDoc;
        }

        if (path.length > 0 && typeof path[path.length-1] === 'string') {
            return null;
        }

        var [head, ...tail] = path;
        if (!head || !snapshot[head]) {
            return snapshot;
        }

        return elementAtPath(snapshot[head], tail);
    };

    docObserver = new MutationObserver(mutationsHandler);
    docObserver.observe(documentElement, observerOptions);
}

function pause() {
    if (docObserver) docObserver.disconnect();
}

function resume() {
    if (docObserver) docObserver.observe(docElement, observerOptions);
}

exports.observe = observe;
exports.pause = pause;
exports.resume = resume;

