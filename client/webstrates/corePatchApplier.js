const PathTree = require('./corePathTree');
const coreDOM = require('./coreDOM');
const Automerge = require('./automerge-performance');

let globel = {};
let docAutomerge = {};

function assignIds(amObj, domNode) {
	if (domNode.nodeType === 3) {
		return;
	}
	// console.log('amObj', amObj);
	let id = Automerge.getObjectId(amObj);
	// console.log('id', id);
	// let attributesId = Automerge.getObjectId(amObj.JsonML[1]);
	let attributesId = Automerge.getObjectId(amObj[1]);
	// console.log('attributesId', attributesId);	
	domNode._amId = id;
	domNode._amAttributesId = attributesId;
	globel.nodeMap[id] = {type: 'node', node: domNode};
	globel.nodeMap[attributesId] = {type: 'attributes', node: domNode};
	if (Object.keys(amObj).length === 2 || domNode.nodeType === 3) return;
	// if (Object.keys(amObj.JsonML).length === 2 || domNode.nodeType === 3) return;
	for (let i = 2; i<Object.keys(amObj).length; i++) {
		// assignIds(amObj.JsonML[i], domNode.childNodes[i-2]);
		assignIds(amObj[i], domNode.childNodes[i-2]); 
	}
}

function applyPatch(patch, documentElement, nodeMap, docAutomerge, bodyPathTree) {
	globel.nodeMap = nodeMap;
	globel.docAutomerge = docAutomerge;
	globel.bodyPathTree = bodyPathTree;
	let diffs = patch.diffs;
	applyDiff(diffs, documentElement);
}


function applyDiff(diff, documentElement) {
	if (diff.objectId !== '00000000-0000-0000-0000-000000000000' && diff.type === 'map') { //attribute change
		handleAttributeChange(diff, documentElement);
	} else if (!diff.edits) { // modif here??
		for (let key in diff.props) {
			if (Object.keys(diff.props[key]).length > 1) {
				console.log('There\'s a conflict!');
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
		if (edit.action === 'insert') {
			let index = edit.index;
			if (Object.keys(diff.props[index]).length > 1) {
				console.log('There\'s a conflict!');
			} else {
				if (index === 0) { // A new Element node is being created
					let newNode = newElementNode(diff);
					insertChildAtIndex(parentNode.node, newNode.node, childIndex-2);
					// insertChildAtIndex(parentNode.node, newNode.node, childIndex-1);
					i = i+1;
					domNode = newNode;
					continue;
				}
				let prop = getPropAtKey(diff.props, index);
				if (!prop.type) { // It is a textnode
					insertTextNode(domNode.node, index-2, prop.value, diff);
					// insertTextNode(domNode.node, index, prop.value);
				} else { // Its a new element node
					handleEdits(prop, domNode, index);
				}
			}
		} else if (edit.action === 'remove') {
			let index = edit.index;
			console.log('RIMOV??????');
			let nodeToRemove = domNode.node.childNodes[index-2];
			// let nodeToRemove = domNode.node.childNodes[index -1];
			if(!nodeToRemove){
				console.log('boom');
			}
			cleanDOMTree(nodeToRemove);
			let elementPathTree = PathTree.getPathNode(domNode.node);
			elementPathTree.children.splice(index-2, 1);
			// elementPathTree.children.splice(index -1, 1);
			
			console.log('Arrived before target path node 10');
			nodeToRemove.remove();
		}
	}
	if (diff.edits.length === 0) { //If there's an edit property but its empty its an updated text node
		if(!domNode){
			const targetElement = coreDOM.externalDocument.childNodes[0];
			assignIds(globel.docAutomerge.JsonML, targetElement);
			domNode = getDOMNodeFromAMId(objectId);
		}
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
	if(!domNode){
		const targetElement = coreDOM.externalDocument.childNodes[0];
		assignIds(globel.docAutomerge.JsonML, targetElement);
		domNode = getDOMNodeFromAMId(objectId);
	}
	for (let attrKey in diff.props) {
		if (diff.props[attrKey].length > 0) {
			console.log('There is a conflict!');
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
		delete globel.nodeMap[node._amId];
	}
	if (node._amAttributesId) {
		delete globel.nodeMap[node._amAttributesId];
	}
	Array.from(node.childNodes).forEach(cleanDOMTree);
}

function newElementNode(diff) {
	let doc = document;
	// Create node
	let el;
	let attributesId;
	if (diff.props[0].length > 0) {
		console.log('There\'s a conflict');
	} else {
		let prop = getPropAtKey(diff.props, 0);
		el = doc.createElement(prop.value);
	}
	if (diff.props[1].length > 0) {
		console.log('There\'s a conflict');
	} else {
		let prop = getPropAtKey(diff.props, 1);
		attributesId = prop.objectId;
		if (prop.type !== 'map') {
			console.log('Something is wrong, this should be a map');
		} else {
			for (let attrKey in prop.props) {
				if (prop.props[attrKey].length > 0) {
					console.log('There is a conflict!');
				} else {
					let attrVal = getPropAtKey(prop.props, attrKey).value;
					el.setAttribute(attrKey, attrVal);
				}
			}
		}
	}
	el._amAttributesId = attributesId;
	globel.nodeMap[diff.objectId] = {type: 'node', node: el};
	globel.nodeMap[attributesId] = {type: 'attributes', node: el};
	return globel.nodeMap[diff.objectId];
}

function insertTextNode(parent, index, value, diff) {
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
	PathTree.create(child, elementPathTree, false, index);
}

function getPropAtKey(props, key) {
	return props[key][Object.keys(props[key])[0]];
}

function getDOMNodeFromAMId(id) {
	return globel.nodeMap[id];
}

exports.applyPatch = applyPatch;