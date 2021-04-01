const PathTree = require('./corePathTree');

function applyPatch(patch, documentElement) {
    let diffs = patch.diffs;
    applyDiff(diffs, documentElement);
}

function applyDiff(diff, documentElement) {
    if (diff.objectId !== "00000000-0000-0000-0000-000000000000" && diff.type === "map") { //attribute change
        handleAttributeChange(diff, documentElement);
    } else if (!diff.edits) { 
        for (let key in diff.props) {
            if (Object.keys(diff.props[key]).length > 1) {
                console.log("There's a conflict!");
            } else {
                applyDiff(getPropAtKey(diff.props, key));
            }
        }
    } else {
        handleEdits(diff, documentElement, 0);
    }
}

function handleEdits(diff, parentNode, childIndex) {
        let objectId = diff.objectId;
        let domNode = getDOMNodeFromAMId(objectId);
        for (let i = 0; i<diff.edits.length; i++) {
            let edit = diff.edits[i];
            if (edit.action === "insert") {
                let index = edit.index;
                if (Object.keys(diff.props[index]).length > 1) {
                    console.log("There's a conflict!");
                } else {
                    if (index === 0) { // A new Element node is being created
                        let newNode = newElementNode(diff);
                        insertChildAtIndex(parentNode.node, newNode.node, childIndex-2);
                        i = i+1;
                        domNode = newNode;
                        continue;
                    }
                    let prop = getPropAtKey(diff.props, index);
                    if (!prop.type) { // It is a textnode
                        insertTextNode(domNode.node, index-2, prop.value);
                    } else { // Its a new element node
                        handleEdits(prop, domNode, index);
                    }
                }
            } else if (edit.action === "remove") {
                let index = edit.index;
                let nodeToRemove = domNode.node.childNodes[index-2];
                cleanDOMTree(nodeToRemove);
                let elementPathTree = PathTree.getPathNode(domNode.node);
                elementPathTree.children.splice(index-2, 1);
                nodeToRemove.remove();
            }
        }
        if (diff.edits.length === 0) { //If there's an edit property but its empty its an updated text node
            for (let prop in diff.props) {
                let textNode = domNode.node.childNodes[prop-2];
                let value = getPropAtKey(diff.props, prop).value;
                textNode.nodeValue = value;
            }
        }
}

function handleAttributeChange(diff) {
    let objectId = diff.objectId;
    let domNode = getDOMNodeFromAMId(objectId);
    for (let attrKey in diff.props) {
        if (diff.props[attrKey].length > 0) {
            console.log("There is a conflict!");
        } else {
            let attrVal = getPropAtKey(diff.props, attrKey).value;
            if (attrVal) {
                domNode.node.setAttribute(attrKey, attrVal);
            } else {
                domNode.node.removeAttribute(attrKey);
            }
        }
    }
}

function cleanDOMTree(node) {
    if (node._amId) {
        delete window._nodeMap[node._amId];
    }
    if (node._amAttributesId) {
        delete window._nodeMap[node._amAttributesId];
    }
    Array.from(node.childNodes).forEach(cleanDOMTree);
}

function newElementNode(diff) {
    let doc = window.getDocument();
    // Create node
    let el;
    let attributesId;
    if (diff.props[0].length > 0) {
        console.log("There's a conflict");
    } else {
        let prop = getPropAtKey(diff.props, 0);
        el = doc.createElement(prop.value);
    }
    if (diff.props[1].length > 0) {
        console.log("There's a conflict");
    } else {
        let prop = getPropAtKey(diff.props, 1);
        attributesId = prop.objectId;
        if (prop.type !== "map") {
            console.log("Something is wrong, this should be a map");
        } else {
            for (let attrKey in prop.props) {
                if (prop.props[attrKey].length > 0) {
                    console.log("There is a conflict!");
                } else {
                    let attrVal = getPropAtKey(prop.props, attrKey).value;
                    el.setAttribute(attrKey, attrVal);
                }
            }
        }
    }
    el._amAttributesId = attributesId;
	window._nodeMap[diff.objectId] = {type: "node", node: el};
	window._nodeMap[attributesId] = {type: "attributes", node: el};
    return window._nodeMap[diff.objectId];
}

function insertTextNode(parent, index, value) {
    let newTextNode = document.createTextNode(value);
    insertChildAtIndex(parent, newTextNode, index); 
}


function insertChildAtIndex(element, child, index) {
  if (!index) index = 0;
  if (index >= element.childNodes.length) {
    element.appendChild(child);
  } else {
    element.insertBefore(child, element.childNodes[index]);
  }
  let elementPathTree = PathTree.getPathNode(element);
  PathTree.create(child, elementPathTree);
}

function getPropAtKey(props, key) {
    return props[key][Object.keys(props[key])[0]];
}

function getDOMNodeFromAMId(id) {
    return window._nodeMap[id];
}

exports.applyPatch = applyPatch;