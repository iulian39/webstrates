'use strict';
const coreEvents = require('./coreEvents');
const coreUtils = require('./coreUtils');
const coreJsonML = require('./coreJsonML');
// const { ipcRenderer } = require('electron');
const corePathTree = require('./corePathTree');
const corePatchApplier = require('./corePatchApplier');
const coreDOM = require('./coreDOM');
const coreMutations = require('./coreMutation');
const base64utils = require('./base64utils');
const automergeDocc = require('./automergeDocc');
const globalObject = require('./globalObject');
const Y = require('yjs');
const rtc = require('y-webrtc');
const json0 = require('ot-json0');
const Automerge = require('./automerge-performance');
const COLLECTION_NAME = 'webstrates';
const _ = require('lodash');

coreEvents.createEvent('receivedDocument');
coreEvents.createEvent('receivedOps');
coreEvents.createEvent('opsAcknowledged');
coreEvents.createEvent('initialize');

const isAutomerge = false;
let docAutomerge = Automerge.init(); // doc = {}
let doc, provider, arrayOp, newDoc, newDoc2, opCounter = 0;
const ydoc = new Y.Doc();
let docObserver, docElement;

let mutations = 0;

const observerOptions = {
	childList: true,
	subtree: true,
	attributes: true,
	characterData: true,
	attributeOldValue: true,
	characterDataOldValue: true
};

const ATTRIBUTE_INDEX = 1;
const nodeMap = {};

/**
 * Get the JsonML document, or get an element at a certain path in the document if a path is
 * provided.
 * @param  {Array} path  (optional) Path into the JsonML document.
 * @return {mixed}       JsonML document object or a path into the document.
 * @public
 */
exports.getDocument = path => {
	let docz = isAutomerge ? docAutomerge : doc;
 	if (!path || !Array.isArray(path)) return docz;
	return path.reduce((docz, path) => docz && docz[path], docz.data);
};

/**
 * Get the element at a given path in a JsonML document.
 * @param  {JsonMLPath} path Path to follow in snapshot.
 * @return {JsonML}          Element at path in snapshot.
 * @public
 */
exports.elementAtPath = (snapshot, path) => {
	let docz = isAutomerge ? docAutomerge : doc;
	// Snapshot is optional (and only used in the internal recursion).
	if (!path) {
		path = snapshot;
		snapshot = docz;
	}

	if (path.length > 0 && typeof path[path.length - 1] === 'string') {
		return null;
	}

	var [head, ...tail] = path;
	if (!head || !snapshot[head]) {
		return snapshot;
	}

	return exports.elementAtPath(snapshot[head], tail);
};

// Having multiple subscriptions to the same webstrate causes ShareDB to behave oddly and cut
// off parts of operations for (so far) unknown reasons. As a result, getDocument will return
// nothing if a subcription to the document already exists.
const subscriptions = new Set();
Object.defineProperty(globalObject.publicObject, 'getDocument', {
	value: (webstrateId) => {
		// In case this document is transcluded as well, we recursively ask the parent for the document.
		if (!conn) {
			return window.parent.window.webstrate.getDocument(webstrateId);
		}

		if (subscriptions.has(webstrateId)) return;
		subscriptions.add(webstrateId);
		return conn.get(COLLECTION_NAME, webstrateId);
	}
});

coreEvents.addEventListener('saveAutomerge', () => {
	let a = Automerge.save(docAutomerge);
	ipcRenderer.send('saveDialog', base64utils.bytesArrToBase64(a));
}, coreEvents.PRIORITY.IMMEDIATE);

const writeResultsToStorage = (name, array) => {
	console.log('writeResultsToStorage', name);
	localStorage.setItem(name, JSON.stringify(array));
	const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
	const result = average( array ); // 5
	console.log('Average = ' + result);
	array = [];
};

let receiveArray = [];
let sendArray = [];
let once = true;
let onceSend = true;

const observeFunction = () => {
	const startDate = new Date();
	let ops = [];
	let allOps = arrayOp.toArray();

	// Check what operations to apply
	//console.log('Operations Start');
	for (let i = opCounter, size = allOps.length; i < size; i++) {
		let op = {
			...allOps[i]
		};
		ops.push(op);
	}
	//console.log('Operations End');

	opCounter += ops.length;
	if (ops.length) {
		// Apply the operations to the JsonML document
		doc = json0.type.apply(doc, ops);
	} else
	{
		return;
	}
	// Apply changes to the DOM
	coreEvents.triggerEvent('receivedOps', ops, doc, 'test');
	const scripts = [];
	const html = coreJsonML.toHTML(doc, undefined, scripts);
	if(scripts.length < 0 && allOps.length <= 10){ // PAUSED FOR TESTING | For drawing to work
		coreMutations.pause();
		document.querySelector('html').remove();
		coreUtils.appendChildWithoutScriptExecution(coreDOM.externalDocument, html);
		coreUtils.executeScripts(scripts, () => {
			const targetElement = coreDOM.externalDocument.childNodes[0];
			const pathTree = corePathTree.create(targetElement, null, true);
			pathTree.check();
			coreMutations.resume();
		});		
		
	}

	const endDate = new Date();
	receiveArray.push(endDate - startDate);
	if(once){
		let name = 'OTreceive_' + endDate.getTime();
		setTimeout(() => writeResultsToStorage(name, receiveArray), 1000000);
		once = false;
	}

};

const historyRollback = (docAm, currentElements, desiredElements, path) => {
	for(let el = 0; el < desiredElements.length; el++){
		if(Array.isArray(desiredElements[el])){
			if(path.length === 0){
				path = [el];
			} else {
				path = [...path, el];
			}
			historyRollback(docAm, currentElements[el], desiredElements[el], path);
			path.pop();	
			continue;
		}
		if(!_.isEqual(currentElements[el], desiredElements[el])) {
			currentElements[el] = desiredElements[el];
			// now we find the corresponding element from our Automerge document
			// and update it, using our path list
			let docAmElem;
			if(path.length > 0){
				for(let i = 0; i < path.length; i++){
					if(!docAmElem)
						docAmElem = docAm.JsonML[path[i]];
					else
						docAmElem = docAmElem[path[i]];
				}
				docAmElem[el] = desiredElements[el];
			} else {
				docAm.JsonML[el] = desiredElements[el];
			}			
		}
	}			
};

const rollback = () => {
	let history = Automerge.getHistory(docAutomerge);	

	const historyIndex = 5;
	if (history.length === -1) {
		const backendState = Automerge.Frontend.getBackendState(docAutomerge);
		// we clone our document in order to be able to modify it
		// and Automerge will detect what has changed
		let newDoc = Automerge.clone(docAutomerge);
		newDoc = Automerge.change(newDoc, doc1 => {
			const desiredVersion = history[historyIndex].snapshot;
			// we need to remove all the hidden properties
			const currentElements = JSON.parse(JSON.stringify(doc1.JsonML));
			const desiredElements = JSON.parse(JSON.stringify(desiredVersion.JsonML));
			historyRollback(doc1, currentElements, desiredElements, []);
		});
		// we detect the changes
		const changes  = Automerge.getChanges(docAutomerge, newDoc);
		// pause our DOM mutation observer
		pause();
		
		const [newState, patch] = Automerge.Backend.applyChanges(backendState, changes);
		patch.state = newState;
		
		docAutomerge = Automerge.Frontend.applyPatch(docAutomerge, patch);
		const documentElementz = coreDOM.externalDocument.childNodes[0];
		// we apply the changes to our DOM
		corePatchApplier.applyPatch(patch, documentElementz, nodeMap, docAutomerge);
		// send the changes to other peers
		coreEvents.triggerEvent('signalAutoMerge', changes);
		resume();
		return;		
	}
};

const observeFunctionAutomerge = () => {	
	const startDate = new Date();
	
	// On another node
	let ops = [];
	let allOps = arrayOp.toArray();	
	
	
	if(opCounter >= allOps.length){
		return;
	}
	ops = allOps.slice(opCounter);
	opCounter = allOps.length;
	pause();
	const backendState = Automerge.Frontend.getBackendState(docAutomerge);
	const [newState, patch] = Automerge.Backend.applyChanges(backendState, ops);
	patch.state = newState;

	docAutomerge = Automerge.Frontend.applyPatch(docAutomerge, patch);
	
	const documentElement = coreDOM.externalDocument.childNodes[0];
	const bodyPathTree = corePathTree.getPathNode(document.body);
	corePatchApplier.applyPatch(patch, documentElement, nodeMap, docAutomerge, bodyPathTree);
	resume();
		
	// const endDate = new Date();
	// receiveArray.push(endDate - startDate);
	// if(once){
	// 	let name = 'CRDTreceive_' + endDate.getTime();
	// 	setTimeout(() => writeResultsToStorage(name, receiveArray), 1000000);
	// 	once = false;
	// }
};

exports.subscribe = (webstrateId, docFromFile) => {
	return new Promise((resolve, reject) => {
		provider = new rtc.WebrtcProvider(webstrateId, ydoc);
		const targetElement = coreDOM.externalDocument.childNodes[0];
		if (!isAutomerge) {
			arrayOp = ydoc.getArray('op');
			arrayOp.observeDeep(observeFunction);
			doc = [];
			coreEvents.triggerEvent('receivedDocument', doc, {
				static: false
			});
			coreEvents.triggerEvent('opsAcknowledged');

			coreEvents.addEventListener('initialize', (data) => {
				doc = data;
			});

			coreEvents.addEventListener('createdOps', (ops) => {
				// Apply operations to the JsonML document
				doc = json0.type.apply(doc, ops.slice());

				if(mutations < 3 && (ops[0].p[2] === 'data-new-gr-c-s-check-loaded' || ops[0].p[2] === 'data-gr-ext-installed' || ops[0].p[2] === 'data-new-gr-c-s-loaded')){
					mutations++;
					return;
				}

				// Update the last applied operations
				opCounter += ops.slice().length;

				arrayOp.push(JSON.parse(JSON.stringify(ops)));

			}, coreEvents.PRIORITY.IMMEDIATE);
		} else {
			// Let's say doc1 is the application state on device 1.
			// Further down we'll simulate a second device.
			// We initialize the document to initially contain an empty list of cards.
			
			arrayOp = ydoc.getArray('autoMerge');
			arrayOp.observeDeep(observeFunctionAutomerge);
			if(docFromFile){
				let bytearray = base64utils.base64toBytes(docFromFile);
				docAutomerge = Automerge.load(bytearray);
				let changes = Automerge.getAllChanges(docAutomerge);
				arrayOp.push([...changes]);
				opCounter += changes.length;
			}

			doc = [];
			coreEvents.triggerEvent('receivedDocument', docAutomerge, {
				static: false
			});
			coreEvents.triggerEvent('opsAcknowledged');

			coreEvents.addEventListener('initialize', (data) => {
				if(!docFromFile){
					let bytearray = base64utils.base64toBytes(automergeDocc.base64);
					docAutomerge = Automerge.load(bytearray);
				}

				const targetElement = coreDOM.externalDocument.childNodes[0];
				assignIds(docAutomerge.JsonML, targetElement);
				observe(targetElement);				
			});

			coreEvents.addEventListener('loadDocAutomerge', (doc) => {				
				let docClone = Automerge.clone(docAutomerge);
				let backendState = Automerge.Frontend.getBackendState(docAutomerge);
				let bytearray = base64utils.base64toBytes(doc);
				let newDoc= Automerge.load(bytearray);
				let newDoc1 = Automerge.change(docClone, doc => {
					let docz = JSON.parse(JSON.stringify(newDoc.JsonML));
					doc.JsonML.splice(1);

					for(let i = 1; i < docz.length; i++){
						doc.JsonML.push(docz[i]);
					}
				});
				let changes  = Automerge.getChanges(docAutomerge, newDoc1);
				pause();
				
				const [newState, patch] = Automerge.Backend.applyChanges(backendState, changes);
				patch.state = newState;

				docAutomerge = Automerge.Frontend.applyPatch(docAutomerge, patch);
				const documentElementz = coreDOM.externalDocument.childNodes[0];
				const bodyPathTreez = corePathTree.getPathNode(document.body);
				corePatchApplier.applyPatch(patch, documentElementz, nodeMap, docAutomerge, bodyPathTreez);
				coreEvents.triggerEvent('signalAutoMerge', changes);
				resume();
				const targetElement = coreDOM.externalDocument.childNodes[0];
				assignIds(docAutomerge.JsonML, targetElement);
			}, coreEvents.PRIORITY.IMMEDIATE);
			
			coreEvents.addEventListener('createdOps', (changes) => {
				//console.log('coreEvents.addEventListener(\'createdOps\'');
			}, coreEvents.PRIORITY.IMMEDIATE);

			coreEvents.addEventListener('signalAutoMerge', (changes) => {
				opCounter += changes.slice().length;
				arrayOp.push(changes);

			}, coreEvents.PRIORITY.IMMEDIATE);
		}

		if(isAutomerge)
			resolve(docAutomerge);
		else
			resolve(doc);
	});
};

exports.fetch = (webstrateId, tagOrVersion) => {
	return new Promise((resolve, reject) => {
		const msgObj = {
			wa: 'fetchdoc',
			d: webstrateId
		};

		if (/^\d/.test(tagOrVersion) && Number(tagOrVersion)) {
			msgObj.v = Number(tagOrVersion);
		} else {
			msgObj.l = tagOrVersion;
		}
	});
};

/**
 * Restore document to a previous version, either by version number or tag label.
 * Labels cannot begin with a digit whereas versions consist only of digits, so distinguishing
 * is easy.
 * This does not return a promise, as we do not have control over exactly when the document gets
 * reverted as this is ShareDB's job.
 * @param {string} tagOrVersion Tag label or version number.
 * @param {Function} callback Callback
 */
exports.restore = (webstrateId, tagOrVersion, callback) => {
	var msgObj = {
		wa: 'restore',
		d: webstrateId
	};

	if (/^\d/.test(tagOrVersion)) {
		msgObj.v = tagOrVersion;
	} else {
		msgObj.l = tagOrVersion;
	}

};

/**
 * Get a range of ops from a specific webstrate.
 * @param  {string}   webstrateId Webstrate to get ops from .
 * @param  {Number}   fromVersion Version to start the op range from (inclusive).
 * @param  {Number}   toVersion   Version to end the op range at (exclusive).
 * @param  {Function} callback    Callback.
 * @return {Array}                (async) Array of ops in the range.
 */
exports.getOps = (webstrateId, fromVersion, toVersion, callback) => {
	// coreWebsocket.send({
	// 	wa: 'getOps',
	// 	d: webstrateId,
	// 	from: fromVersion,
	// 	to: toVersion
	// }, callback);
};

function observe (documentElement) {

	docElement = documentElement;	

	let mutationsHandler = (mutations) => {
		let startDate = new Date();
		//console.log(mutations);
		for (let mutation of mutations) {
			if(opCounter == 0 && (mutation.attributeName === 'data-new-gr-c-s-check-loaded' || (mutation.attributeName === 'data-gr-ext-installed') || (mutation.attributeName === 'data-new-gr-c-s-loaded')))
				break;
			let targetPathNode = corePathTree.getPathNode(mutation.target);

			const elementTarget = mutation.target.nodeType === document.ELEMENT_NODE
				? mutation.target
				: mutation.target.parentElement;
			const elementPathNode = corePathTree.getPathNode(elementTarget);

			switch (mutation.type) {
				case 'attributes':
					attributeMutation(mutation, targetPathNode); break;
				case 'characterData':
					characterDataMutation(mutation, targetPathNode); break;
				case 'childList':
					childListMutation(mutation, targetPathNode); break;
			}
		}

		const endDate = new Date();
		sendArray.push(endDate - startDate);
		if(onceSend){
			let name = 'CRDTsend_' + endDate.getTime();
			setTimeout(() => writeResultsToStorage(name, sendArray), 1000000);
			onceSend = false;
		}
	};

	function childListMutation(mutation, targetPathNode) {
		let changeArr = [];
		Array.from(mutation.removedNodes).forEach(function(removedNode) {
			var removedPathNode = corePathTree.getPathNode(removedNode, mutation.target);

			// If an element has no path node, it hasn't been registered in the JsonML at all, so it won't
			// exist on other clients, and therefore creating an op to delete it wouldn't make sense.
			if (!removedPathNode) {
				return;
			}

			//console.log('Before removink', docAutomerge, 'removed path node ', removedPathNode);

			const path = removedPathNode.toPath();
			removedPathNode.remove();
			
			newDoc = Automerge.change(docAutomerge, doc => {
				let parent = elementAtPath(doc.JsonML, path.slice(0,-1));
				parent.splice(path[path.length - 1], 1);
			});
			let changes  = Automerge.getChanges(docAutomerge, newDoc);				
			changeArr.push(changes[0]);
				
			docAutomerge = newDoc;			
		});
        
		Array.from(mutation.addedNodes).forEach(function(addedNode) {
			// Sanitizes all nodes (i.e. ensures valid tag names and attributes) and set wids on all nodes.
			const parentNode = mutation.target;

			let addedPathNode = corePathTree.getPathNode(addedNode, parentNode);

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
			const newPathNode = corePathTree.create(addedNode, targetPathNode);
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
			let previousSiblingPathNode = corePathTree.getPathNode(previousSibling, parentNode);
			while (previousSibling && !previousSiblingPathNode) {
				previousSibling = previousSibling.previousSibling;
				previousSiblingPathNode = corePathTree.getPathNode(previousSibling, parentNode);
			}

			if (previousSibling) {
				const previousSiblingIndex = targetPathNode.children.indexOf(previousSiblingPathNode);
				targetPathNode.children.splice(previousSiblingIndex + 1, 0, newPathNode);
			} else if (addedNode.nextSibling) {
				targetPathNode.children.unshift(newPathNode);
			} else {
				targetPathNode.children.push(newPathNode);
			}
			const path = corePathTree.getPathNode(addedNode, parentNode).toPath();
			
			newDoc = Automerge.change(docAutomerge, doc => {
				let parent = elementAtPath(doc.JsonML, path.slice(0,-1));				
				parent.splice(path[path.length - 1], 0, coreJsonML.fromHTML(addedNode));
			});

			let changes = Automerge.getChanges(docAutomerge, newDoc);
			changeArr.push(changes[0]);
				
			docAutomerge = newDoc;
		});

		
		coreEvents.triggerEvent('signalAutoMerge', changeArr);
	}

	function characterDataMutation(mutation, targetPathNode) {
		const path = targetPathNode.toPath(true);

		const newValue = mutation.target.data.replace(/ /g, ' ');

		newDoc = Automerge.change(docAutomerge, doc => {
			let parent = elementAtPath(doc.JsonML, path.slice(0,-1));
			parent[path[path.length - 1]] = newValue;
		});
		let changes  = Automerge.getChanges(docAutomerge, newDoc);
		docAutomerge = newDoc;
		coreEvents.triggerEvent('signalAutoMerge', changes);
	}

	function attributeMutation(mutation, targetPathNode) {
		let attributeName = mutation.attributeName;
		const targetPathNodeJsonML = targetPathNode.toPath();

		newDoc = Automerge.change(docAutomerge, doc => {
			let node = elementAtPath(doc.JsonML, targetPathNodeJsonML);
			node[ATTRIBUTE_INDEX][attributeName] = mutation.target.getAttribute(attributeName);
		});
		let changes  = Automerge.getChanges(docAutomerge, newDoc);
		docAutomerge = newDoc;

		coreEvents.triggerEvent('signalAutoMerge', changes);
	}

	function elementAtPath(snapshot, path) {
		if (!path) {    
			path = snapshot;
			snapshot = docAutomerge;
		}

		if (path.length > 0 && typeof path[path.length-1] === 'string') {
			return null;
		}

		var [head, ...tail] = path;
		if (!head || !snapshot[head]) {
			return snapshot;
		}

		return elementAtPath(snapshot[head], tail);
	}

	docObserver = new MutationObserver(mutationsHandler);
	docObserver.observe(documentElement, observerOptions);
}

function pause() {
	if (docObserver) docObserver.disconnect();
}

function resume() {
	if (docObserver) docObserver.observe(docElement, observerOptions);
}

function assignIds(amObj, domNode) {
	if (domNode.nodeType === 3) {
		return;
	}
	let id = Automerge.getObjectId(amObj);
	let attributesId = Automerge.getObjectId(amObj[1]);
	domNode._amId = id;
	domNode._amAttributesId = attributesId;
	nodeMap[id] = {type: 'node', node: domNode};
	nodeMap[attributesId] = {type: 'attributes', node: domNode};
	if (Object.keys(amObj).length === 2 || domNode.nodeType === 3) return;
	for (let i = 2; i<Object.keys(amObj).length; i++) {
		assignIds(amObj[i], domNode.childNodes[i-2]); 
	}
}