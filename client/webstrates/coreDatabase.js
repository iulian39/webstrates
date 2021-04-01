'use strict';
const coreEvents = require('./coreEvents');
const coreUtils = require('./coreUtils');
const coreJsonML = require('./coreJsonML');
const corePathTree = require('./corePathTree')
//const coreWebsocket = require('./coreWebsocket');
const globalObject = require('./globalObject');
const Y = require('yjs');
const rtc = require('y-webrtc');
const json0 = require('ot-json0');
// const sharedb = require('sharedb/lib/client');
const COLLECTION_NAME = 'webstrates';

coreEvents.createEvent('receivedDocument');
coreEvents.createEvent('receivedOps');
// coreEvents.createEvent('databaseError');
coreEvents.createEvent('opsAcknowledged');
coreEvents.createEvent('initialize');
// var Y = require('yjs');
// import { WebrtcProvider } from 'y-webrtc'

let doc, provider, arrayOp, opCounter = 0;
const ydoc = new Y.Doc();

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
	if (!path || !Array.isArray(path)) return doc;
	return path.reduce((doc, path) => doc && doc[path], doc.data);
};

/**
 * Get the element at a given path in a JsonML document.
 * @param  {JsonMLPath} path Path to follow in snapshot.
 * @return {JsonML}          Element at path in snapshot.
 * @public
 */
exports.elementAtPath = (snapshot, path) => {
	// Snapshot is optional (and only used in the internal recursion).
	if (!path) {
		path = snapshot;
		snapshot = doc;
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
	console.log("Operations Start")
	for (let i = opCounter, size = allOps.length; i < size; i++) {
		ops.push({
			...allOps[i]
		});
		console.log(allOps[i].p)
	}
	console.log("Operations End")

	opCounter += ops.length;
	if (ops.length) {
		// Apply the operations to the JsonML document
		doc = json0.type.apply(doc, ops);
	}
	// Apply changes to the DOM
	coreEvents.triggerEvent('receivedOps', ops, doc, "test");
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


exports.subscribe = webstrateId => {
	return new Promise((resolve, reject) => {
		// Check if we can reuse the ShareDB Database connection from a parent if we're in an iframe.
		// if (coreUtils.isTranscluded() && coreUtils.sameParentDomain() && config.reuseWebsocket) {
		// 	doc = window.parent.window.webstrate.getDocument(webstrateId);
		// }

		// // Even if we're transcluded, we won't succeed in getting a document from our parent if another
		// // subscription on the same webstrate already exists.
		// if (!doc) {
		// Filter out our own messages. This could be done more elegantly by parsing the JSON object
		//  and
		// then checking if the "wa" property exists, but this is a lot faster.
		// This filter is passed to coreWebsocket.copy() when getting a copy of a websocket.
		// @param  {obj} event  Websocket onmessage event.
		// @return {bool}       Whether the message should be let through to ShareDB.
		// const websocket = coreWebsocket.copy(event => !event.data.startsWith('{"wa":'));

		// Create a new ShareDB connection.
		// conn = new sharedb.Connection(websocket);

		// Get ShareDB document for webstrateId.
		// doc = conn.get(COLLECTION_NAME, webstrateId);
		
		provider = new rtc.WebrtcProvider(webstrateId, ydoc);
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

var searchText = " Аsk for trade ";
var proceedText = " Proceed ";

const findButton = (text) => {
	const tags = document.getElementsByTagName("button");
	for (var i = 0; i < tags.length; i++) {
        if (tags[i].textContent == searchText) {
            return tags[i];
        }
    }
}

acceptBtn = findButton(searchText)
while(acceptBtn){
	acceptBtn.click();
	await new Promise((resolve) => setTimeout(() => {
		proceedBtn = findButton(proceedText);
		if(proceedBtn) proceedBtn.click();
	resolve();
	}, 6000));
	await new Promise((resolve) => setTimeout(() => {
		//close
		proceedBtn = findButton(proceedText);
		if(proceedBtn) proceedBtn.click();
		resolve();
	}, 4000));
	await new Promise((resolve) => setTimeout(() => {
		//just wait a little..
		resolve();
	}, 4000));
	acceptBtn = findButton(searchText);
}


var aTags = document.getElementsByTagName("button");
	
    var found = [];

    for (var i = 0; i < aTags.length; i++) {
        if (aTags[i].textContent == searchText) {
            found.push(aTags[i]);
        }
    }
    if(found.length > 0)
        for (let i of found) {
			i.click();  
			await new Promise((resolve) => setTimeout(() => {
				bTags  = document.getElementsByTagName("button");
			for (var i = 0; i < bTags.length; i++) {
				if (bTags[i].textContent == proceedText) {
					bTags[i].click();
					break;
				}
			}
			resolve();
			}, 5000));
			console.log("ASDD")
		}
