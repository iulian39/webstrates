'use strict';
const coreEvents = require('./coreEvents');
const coreUtils = require('./coreUtils');
const coreJsonML = require('./coreJsonML');
const corePathTree = require('./corePathTree');
const corePatchApplier = require('./corePatchApplier');
const coreDOM = require('./coreDOM');
const coreMutations = require('./coreMutation');
const base64utils = require('./base64utils');
const automergeDocc = require('./automergeDocc');
//const coreWebsocket = require('./coreWebsocket');
const globalObject = require('./globalObject');
const Y = require('yjs');
const rtc = require('y-webrtc');
const json0 = require('ot-json0');
//const Automerge = require('automerge');
const Automerge = require('./automerge-performance');
// const sharedb = require('sharedb/lib/client');
const COLLECTION_NAME = 'webstrates';

coreEvents.createEvent('receivedDocument');
coreEvents.createEvent('receivedOps');
// coreEvents.createEvent('databaseError');
coreEvents.createEvent('opsAcknowledged');
coreEvents.createEvent('initialize');
// var Y = require('yjs');
// import { WebrtcProvider } from 'y-webrtc'
const isAutomerge = true;
const kto= '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8"]],["^1",["action","ins","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","_head","elem",1]],["^1",["action","set","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:1","value","html"]],["^1",["action","ins","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:1","elem",2]],["^1",["action","makeMap","obj","6ef2e763-c760-433d-889a-1de366e8602f"]],["^1",["action","link","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:2","value","6ef2e763-c760-433d-889a-1de366e8602f"]],["^1",["action","ins","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:2","elem",3]],["^1",["action","set","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:3","value","\n"]],["^1",["action","ins","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:3","elem",4]],["^1",["action","makeList","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b"]],["^1",["action","ins","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","_head","elem",1]],["^1",["action","set","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:1","value","head"]],["^1",["action","ins","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:1","elem",2]],["^1",["action","makeMap","obj","3b353711-1a51-486c-b67f-804de7d43d7b"]],["^1",["action","link","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:2","value","3b353711-1a51-486c-b67f-804de7d43d7b"]],["^1",["action","ins","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:2","elem",3]],["^1",["action","set","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:3","value","\n"]],["^1",["action","ins","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:3","elem",4]],["^1",["action","makeList","obj","58ad7eae-349e-4253-9623-132604a3c3d4"]],["^1",["action","ins","obj","58ad7eae-349e-4253-9623-132604a3c3d4","key","_head","elem",1]],["^1",["action","set","obj","58ad7eae-349e-4253-9623-132604a3c3d4","key","1234-abcd-56789-qrstuv:1","value","title"]],["^1",["action","ins","obj","58ad7eae-349e-4253-9623-132604a3c3d4","key","1234-abcd-56789-qrstuv:1","elem",2]],["^1",["action","makeMap","obj","f117ac68-263b-4c7c-9ed6-a9482d576ffd"]],["^1",["action","link","obj","58ad7eae-349e-4253-9623-132604a3c3d4","key","1234-abcd-56789-qrstuv:2","value","f117ac68-263b-4c7c-9ed6-a9482d576ffd"]],["^1",["action","ins","obj","58ad7eae-349e-4253-9623-132604a3c3d4","key","1234-abcd-56789-qrstuv:2","elem",3]],["^1",["action","set","obj","58ad7eae-349e-4253-9623-132604a3c3d4","key","1234-abcd-56789-qrstuv:3","value","asd"]],["^1",["action","link","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:4","value","58ad7eae-349e-4253-9623-132604a3c3d4"]],["^1",["action","ins","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:4","elem",5]],["^1",["action","set","obj","dec8e3f8-55b4-4047-826a-1ae294521c5b","key","1234-abcd-56789-qrstuv:5","value","\n"]],["^1",["action","link","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:4","value","dec8e3f8-55b4-4047-826a-1ae294521c5b"]],["^1",["action","ins","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:4","elem",5]],["^1",["action","set","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:5","value","\n"]],["^1",["action","ins","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:5","elem",6]],["^1",["action","makeList","obj","53208945-1617-4702-82bf-dd1e10b36104"]],["^1",["action","ins","obj","53208945-1617-4702-82bf-dd1e10b36104","key","_head","elem",1]],["^1",["action","set","obj","53208945-1617-4702-82bf-dd1e10b36104","key","1234-abcd-56789-qrstuv:1","value","body"]],["^1",["action","ins","obj","53208945-1617-4702-82bf-dd1e10b36104","key","1234-abcd-56789-qrstuv:1","elem",2]],["^1",["action","makeMap","obj","0d12adda-40b5-46e7-a4cf-89aa3e0bbede"]],["^1",["action","set","obj","0d12adda-40b5-46e7-a4cf-89aa3e0bbede","key","data-gr-c-s-loaded","value","true"]],["^1",["action","set","obj","0d12adda-40b5-46e7-a4cf-89aa3e0bbede","key","contenteditable","value","true"]],["^1",["action","link","obj","53208945-1617-4702-82bf-dd1e10b36104","key","1234-abcd-56789-qrstuv:2","value","0d12adda-40b5-46e7-a4cf-89aa3e0bbede"]],["^1",["action","ins","obj","53208945-1617-4702-82bf-dd1e10b36104","key","1234-abcd-56789-qrstuv:2","elem",3]],["^1",["action","set","obj","53208945-1617-4702-82bf-dd1e10b36104","key","1234-abcd-56789-qrstuv:3","value","\n"]],["^1",["action","link","obj","34ac44ab-2368-4a01-9d91-9d5ba92840d8","key","1234-abcd-56789-qrstuv:6","value","53208945-1617-4702-82bf-dd1e10b36104"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","JsonML","value","34ac44ab-2368-4a01-9d91-9d5ba92840d8"]]]],"actor","1234-abcd-56789-qrstuv","seq",1,"deps",["^1",[]]]]]]';
let docAutomerge = Automerge.init(); // doc = {}
let doc, provider, arrayOp, newDoc, opCounter = 0;
const ydoc = new Y.Doc();
let docObserver, docElement;

let latestExecutedSec = 0;

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

// const ydoc = new Y.Doc()
//  const provider = new WebrtcProvider('myRoom', ydoc)


/**
 * Get the ShareDB document, or get an element at a certain path in the document if a path is
 * provided.
 * @param  {Array} path  (optional) Path into the ShareDB document.
 * @return {mixed}       ShareDB document object or a path into the document.
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

const observeFunction = () => {
	let ops = [];
	let allOps = arrayOp.toArray();

	// Check what operations to apply
	console.log('Operations Start');
	for (let i = opCounter, size = allOps.length; i < size; i++) {
		ops.push({
			...allOps[i]
		});
		console.log(allOps[i].p);
	}
	console.log('Operations End');

	opCounter += ops.length;
	if (ops.length) {
		// Apply the operations to the JsonML document
		doc = json0.type.apply(doc, ops);
	}
	// Apply changes to the DOM
	coreEvents.triggerEvent('receivedOps', ops, doc, 'test');
	console.log('RECEIVED AT : ' + new Date().getTime());
	const scripts = [];
	const html = coreJsonML.toHTML(doc, undefined, scripts);
	// coreUtils.executeScripts(scripts, () => {})

	// // debugger
	// console.log(scripts.length)
	// coreUtils.appendChildWithoutScriptExecution(coreDOM.externalDocument, html);

	// coreUtils.executeScripts(scripts, () => {
	// 	console.log('populated');
	// 	// Do not include the parent element in the path, i.e. create corePathTree on the <html>
	// 	// element rather than the document element.
	// 	const targetElement = coreDOM.externalDocument.childNodes[0];
	// 	const pathTree = corePathTree.create(targetElement, null, true);
	// 	coreEvents.triggerEvent('populated', targetElement, webstrateId);
	// });

	// const scripts = [];
	// const html = coreJsonML.toHTML(doc, undefined, scripts);
	// // debugger
	// console.log(scripts.length)
	// coreUtils.appendChildWithoutScriptExecution(coreDOM.externalDocument, html);

	// 	coreUtils.executeScripts(scripts, () => {});
	// 	console.log('populated');
	// 	// Do not include the parent element in the path, i.e. create corePathTree on the <html>
	// 	// element rather than the document element.
	// 	const targetElement = coreDOM.externalDocument.childNodes[0];
	// 	const pathTree = corePathTree.create(targetElement, null, true);
	// 	pathTree.check();
	// 	// coreEvents.triggerEvent('populated', targetElement, webstrateId);
	// });

};

const observeFunctionAutomerge = () => {
	// On another node
	let ops = [];
	let allOps = arrayOp.toArray();

	// Check what operations to apply
	console.log('docc before automerge start', docAutomerge);
	console.log('Automerge Start');
	// for (let i = opCounter, size = allOps.length; i < size; i++) {
	// 	// if (allOps[i].seq > latestExecutedSec)
	// 	// {
	// 	ops = [allOps[i]];
	// 	console.log(allOps[i]);
	// 	// if (max < allOps[i].seq) max = allOps[i].seq;
	// 	// }
		
	// }
	if(opCounter >= allOps.length)
		return;
	ops = allOps.slice(opCounter);
	opCounter = allOps.length;
	// max > latestExecutedSec ? latestExecutedSec = max : null;
	console.log('Automerge End');
	pause();
	let backendState = Automerge.Frontend.getBackendState(docAutomerge);
	const [newState, patch] = Automerge.Backend.applyChanges(backendState, ops);
	// const [newState, patch] = Automerge.Backend.applyChanges(backendState, allOps);
	patch.state = newState;
	console.log('State' , newState, 'Patch' , patch);

	docAutomerge = Automerge.Frontend.applyPatch(docAutomerge, patch);
	console.log('doccccccc', docAutomerge);
	
	const documentElement = coreDOM.externalDocument.childNodes[0];
	const bodyPathTree = corePathTree.getPathNode(document.body);

	corePatchApplier.applyPatch(patch, documentElement, nodeMap, docAutomerge, bodyPathTree);
	resume();
	
	console.log(Automerge.save(docAutomerge));
	// docAutomerge = Automerge.applyChanges(docAutomerge, ops);
	// console.log('doccccccc', docAutomerge);
	const html = coreJsonML.toHTML(docAutomerge.JsonML, undefined, []);
		
		
	console.log(html);
	
	

	
	// const html1 = coreJsonML.toHTML(docAutomerge, undefined, []);
	// console.log(html1);
	// const targetElement = coreDOM.externalDocument.childNodes[0];
	// console.log(Automerge.save(docAutomerge));
	// coreMutations.pause();
	// corePatchApplier.applyPatch(patch, targetElement);
	// coreMutations.resume();
};

exports.subscribe = webstrateId => {
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

				// Update the last applied operations
				opCounter += ops.slice().length;

				// Add the operations to the y-array
				console.log('SENT AT : ' + new Date().getTime());
				arrayOp.push(ops.slice());

			}, coreEvents.PRIORITY.IMMEDIATE);
		} else {
			// Let's say doc1 is the application state on device 1.
			// Further down we'll simulate a second device.
			// We initialize the document to initially contain an empty list of cards.
			
			//If YJS nu e populat
			arrayOp = ydoc.getArray('autoMerge');
			arrayOp.observeDeep(observeFunctionAutomerge);
			

			doc = [];
			coreEvents.triggerEvent('receivedDocument', docAutomerge, {
				static: false
			});
			coreEvents.triggerEvent('opsAcknowledged');

			coreEvents.addEventListener('initialize', (data) => {
				// docAutomerge = Automerge.change(docAutomerge, doc => {
				// 	doc.JsonML = data;
				// });
				// console.log(docAutomerge);
				// let a = Automerge.save(docAutomerge);
				// console.log(base64utils.bytesArrToBase64(a));
				// docAutomerge['Symbol(_objectId)'] = '00000000-0000-0000-0000-000000000000';
				// docAutomerge = Automerge.load(automergeDocc.doc(webstrateId));
				let bytearray = base64utils.base64toBytes(automergeDocc.base64);
				docAutomerge = Automerge.load(bytearray);
				const targetElement = coreDOM.externalDocument.childNodes[0];
				assignIds(docAutomerge.JsonML, targetElement);
				// pause();
				console.log(docAutomerge);
				let a = Automerge.save(docAutomerge);
				console.log(base64utils.bytesArrToBase64(a));
				observe(targetElement);
				// resume();				
			});
			
			coreEvents.addEventListener('createdOps', (changes) => {
				console.log('coreEvents.addEventListener(\'createdOps\'');
				// let byteArray = base64utils.stringToBytes(msg.changes);
				// if (webstrate.clientId === senderId || !msg.changes) return;
				// let backendState = Automerge.Frontend.getBackendState(window.amDoc);
				// const [newState, patch] = Automerge.Backend.applyChanges(backendState, [byteArray]);
				// patch.state = newState;
				// window.amDoc = Automerge.Frontend.applyPatch(window.amDoc, patch);
				// coreMutations.pause();
				// corePatchApplier.applyPatch(patch, documentElement);
				// coreMutations.resume();

				// // Apply operations to the JsonML document
				// doc = json0.type.apply(doc, ops.slice());

				// // Update the last applied operations
				// opCounter += ops.slice().length;

				// // Add the operations to the y-array
				// console.log('SENT AT : ' + new Date().getTime());
				// arrayOp.push(ops.slice());

			}, coreEvents.PRIORITY.IMMEDIATE);


			// webstrate.on('signal', (msg, senderId) => {
			// 	console.log('webstrate.on("signal"', msg, senderId);
			// 	let byteArray = base64utils.stringToBytes(msg.changes);
			// 	if (webstrate.clientId === senderId || !msg.changes) return;
			// 	let backendState = Automerge.Frontend.getBackendState(window.amDoc);
			// 	const [newState, patch] = Automerge.Backend.applyChanges(backendState, [byteArray]);
			// 	patch.state = newState;
			// 	window.amDoc = Automerge.Frontend.applyPatch(window.amDoc, patch);
			// 	coreMutations.pause();
			// 	corePatchApplier.applyPatch(patch, documentElement);
			// 	coreMutations.resume();
			// });

			coreEvents.addEventListener('signalAutoMerge', (changes) => {
				console.log('am primit changes', changes);
				opCounter += changes.slice().length;
				const bytezz = base64utils.bytesToString(changes);
				console.log(bytezz);
				arrayOp.push(changes);
				// let byteArray = base64utils.stringToBytes(msg.changes);
				// if (webstrate.clientId === senderId || !msg.changes) return;
				// let backendState = Automerge.Frontend.getBackendState(docAutomerge);
				// const [newState, patch] = Automerge.Backend.applyChanges(backendState, [byteArray]);
				// patch.state = newState;
				// docAutomerge = Automerge.Frontend.applyPatch(docAutomerge, patch);
				// coreMutations.pause();
				// corePatchApplier.applyPatch(patch, documentElement);
				// coreMutations.resume();

			}, coreEvents.PRIORITY.IMMEDIATE);

			
			//if YJS e populat
			// const doc = Automerge.from({ cards: [] }) // doc = { cards: [] } The value passed to Automerge.from must always be an object.


			// doc2 = Automerge.merge(doc2, doc1) // merge 2 docs


			// Updating a document
			// let newDoc = Automerge.change(docAutomerge, doc1 => {
			// 	// NOTE: never modify `currentDoc` directly, only ever change `doc`!
			// 	console.log(doc1)
			// 	doc1.property = 'value' // assigns a string value to a property
			// 	doc1['property'] = 'value' // equivalent to the previous line
			  
			// 	delete doc1['property'] // removes a property
			  
			// 	// all JSON primitive datatypes are supported
			// 	doc1.stringValue = 'value'
			// 	doc1.numberValue = 1
			// 	doc1.boolValue = true
			// 	doc1.nullValue = null
			  
			// 	doc1.nestedObject = {} // creates a nested object
			// 	doc1.nestedObject.property = 'value'
			  
			// 	// you can also assign an object that already has some properties
			// 	doc1.otherObject = { key: 'value', number: 42 }
			  
			// 	// Arrays are fully supported
			// 	doc1.list = [] // creates an empty list object
			// 	doc1.list.push(2, 3) // push() adds elements to the end
			// 	doc1.list.unshift(0, 1) // unshift() adds elements at the beginning
			// 	doc1.list[3] = Math.PI // overwriting list element by index
			// 	// now doc.list is [0, 1, 2, 3.141592653589793]
			  
			// 	// Looping over lists works as you'd expect:
			// 	for (let i = 0; i < doc1.list.length; i++) doc1.list[i] *= 2
			// 	// now doc.list is [0, 2, 4, 6.283185307179586]
			  
			// 	doc1.list.splice(2, 2, 'automerge')
			// 	// now doc.list is [0, 'hello', 'automerge', 4]
			  
			// 	doc1.list[4] = { key: 'value' } // objects can be nested inside lists as well
			  
			// 	// Arrays in Automerge offer the convenience functions `insertAt` and `deleteAt`
			// 	doc1.list.insertAt(1, 'hello', 'world') // inserts elements at given index
			// 	doc1.list.deleteAt(5) // deletes element at given index
			// 	// now doc.list is [0, 'hello', 'world', 2, 4]
			//   })
		

			// The doc1 object is treated as immutable -- you must never change it
			// directly. To change it, you need to call Automerge.change() with a callback
			// in which you can mutate the state. You can also include a human-readable
			// description of the change, like a commit message, which is stored in the
			// change history (see below).

			// 			doc1 = Automerge.change(doc1, 'Add card', doc => {
			// 			doc.cards.push({ title: 'Rewrite everything in Clojure', done: false })
			// 			})

			// 			// Now the state of doc1 is:
			// 			// { cards: [ { title: 'Rewrite everything in Clojure', done: false } ] }

			// 			// Automerge also defines an insertAt() method for inserting a new element at
			// 			// a particular position in a list. Or you could use splice(), if you prefer.
			// 			doc1 = Automerge.change(doc1, 'Add another card', doc => {
			// 			doc.cards.insertAt(0, { title: 'Rewrite everything in Haskell', done: false })
			// 			})


			// 			// On one node
			// newDoc = Automerge.change(currentDoc, doc => {
			// 	// make arbitrary change to the document
			//   })
			//   let changes = Automerge.getChanges(currentDoc, newDoc)
			//   network.broadcast(JSON.stringify(changes))
  
			//   // On another node
			//   let changes = JSON.parse(network.receive())
			//   newDoc = Automerge.applyChanges(currentDoc, changes)

			//   If you want a list of all the changes ever made in doc, you can call Automerge.getAllChanges(doc).

		}





		// 	doc.on('op', (ops, opsSource) => {
		// 		// We don't broadcast a 'receivedOps' event for ops we create ourselves, as we haven't
		// 		// received them from anybody.
		// 		if (opsSource !== source) {
		// 			coreEvents.triggerEvent('receivedOps', ops);
		// 		}
		// 	});

		// 	// This event gets triggered after all ops have been successfully been received by the
		// 	// server and submitted to the database. There's 'nothing pending' in the submission queue.
		// 	// If a user is making changes to the DOM, we can't guarantee that they have been recorded
		// 	// after this event has happened.
		// 		doc.on('nothing pending', () => {
		// 		});

		// 		doc.on('error', error => {
		// 			// ShareDB error code 4018 (Document was created remotely) triggers happens when multiple
		// 			// clients try to create the same webstrate at the same time. It doesn't matter, so we
		// 			// suppress it.
		// 			if (error.code === 4018) return;
		// 			console.error(error);
		// 			coreEvents.triggerEvent('databaseError', error);
		// 		});

		if(isAutomerge)
			resolve(docAutomerge);
		else
			resolve(doc);
		// });
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

		// The second parameter is `sendWhenReady` and true means to queue the message until the
		// websocket is open rather than to throw and error if the websocket isn't ready. This is not
		// part of the WebSocket specification, but has been implemented in coreWebsocket anyway.
		// coreWebsocket.send(msgObj, (err, doc) => {
		// 	if (err) return reject(err);
		// 	coreEvents.triggerEvent('receivedDocument', doc, { static: true });
		// 	resolve(doc);
		// }, { waitForOpen: true });
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

	//coreWebsocket.send(msgObj, callback);
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
		console.log(mutations);
		for (let mutation of mutations) {
			if(opCounter == 0 && (mutation.attributeName === 'data-new-gr-c-s-check-loaded' || (mutation.attributeName === 'data-gr-ext-installed') || (mutation.attributeName === 'data-new-gr-c-s-loaded')))
				break;
			const targetPathNode = corePathTree.getPathNode(mutation.target);

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
	};

	function childListMutation(mutation, targetPathNode) {
        
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
							
						console.log('Arrived before target path node 4');
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
			console.log('PETHHHH', path);
			
			newDoc = Automerge.change(docAutomerge, doc => {
			// newDoc = Automerge.change(docAutomerge, doc => {
				console.log(doc.JsonML);
				let parent = elementAtPath(doc.JsonML, path.slice(0,-1));				
				console.log(parent);
				parent.splice(path[path.length - 1], 0, coreJsonML.fromHTML(addedNode));
				console.log(parent, 'From HTML', coreJsonML.fromHTML(addedNode));
			});

			let changes  = Automerge.getChanges(docAutomerge, newDoc);
			// let changes  = Automerge.getChanges(docAutomerge, newDoc);
			console.log('CHAGEZ', changes);
			
			docAutomerge = newDoc;
			console.log('BEFORE SENDING THE DOC 1', docAutomerge);
			
			coreEvents.triggerEvent('signalAutoMerge', changes);
		});

		Array.from(mutation.removedNodes).forEach(function(removedNode) {
			var removedPathNode = corePathTree.getPathNode(removedNode, mutation.target);

			// If an element has no path node, it hasn't been registered in the JsonML at all, so it won't
			// exist on other clients, and therefore creating an op to delete it wouldn't make sense.
			if (!removedPathNode) {
				return;
			}

			console.log('Before removink', docAutomerge, 'removed path node ', removedPathNode);

			const path = removedPathNode.toPath();
			removedPathNode.remove();
			newDoc = Automerge.change(docAutomerge, doc => {
				console.log(doc, doc.JsonML);
				let parent = elementAtPath(doc.JsonML, path.slice(0,-1));
				console.log(parent);
				parent.splice(path[path.length - 1], 1);
				console.log(parent);
			});
			let changes  = Automerge.getChanges(docAutomerge, newDoc);
			docAutomerge = newDoc;

			console.log('BEFORE SENDING THE DOC 2', docAutomerge);
			coreEvents.triggerEvent('signalAutoMerge', changes);
		});

	}

	function characterDataMutation(mutation, targetPathNode) {
		// const path = targetPathNode.toPath(true);
		const path = targetPathNode.toPath(true);

		const newValue = mutation.target.data.replace(/ /g, ' ');

		newDoc = Automerge.change(docAutomerge, doc => {
			let parent = elementAtPath(doc.JsonML, path.slice(0,-1));
			parent[path[path.length - 1]] = newValue;
		});
		let changes  = Automerge.getChanges(docAutomerge, newDoc);
		docAutomerge = newDoc;
		console.log('BEFORE SENDING THE DOC 3', docAutomerge);
		coreEvents.triggerEvent('signalAutoMerge', changes);
	}

	function attributeMutation(mutation, targetPathNode) {
		let attributeName = mutation.attributeName;
		const targetPathNodeJsonML = targetPathNode.toPath();

		newDoc = Automerge.change(docAutomerge, doc => {
			console.log('DOC JSONML', doc.JsonML);
			let node = elementAtPath(doc.JsonML, targetPathNodeJsonML);
			node[ATTRIBUTE_INDEX][attributeName] = mutation.target.getAttribute(attributeName);
		});
		let changes  = Automerge.getChanges(docAutomerge, newDoc);
		docAutomerge = newDoc;

		console.log('BEFORE SENDING THE DOC 4', docAutomerge);
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
	//assignIds(docAutomerge, documentElement);
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
	console.log('amObj', amObj);
	let id = Automerge.getObjectId(amObj);
	console.log('id', id);
	// let attributesId = Automerge.getObjectId(amObj.JsonML[1]);
	let attributesId = Automerge.getObjectId(amObj[1]);
	console.log('attributesId', attributesId);	
	domNode._amId = id;
	domNode._amAttributesId = attributesId;
	nodeMap[id] = {type: 'node', node: domNode};
	nodeMap[attributesId] = {type: 'attributes', node: domNode};
	if (Object.keys(amObj).length === 2 || domNode.nodeType === 3) return;
	// if (Object.keys(amObj.JsonML).length === 2 || domNode.nodeType === 3) return;
	for (let i = 2; i<Object.keys(amObj).length; i++) {
		// assignIds(amObj.JsonML[i], domNode.childNodes[i-2]);
		assignIds(amObj[i], domNode.childNodes[i-2]); 
	}
}