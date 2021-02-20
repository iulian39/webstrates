'use strict';
const coreEvents = require('./coreEvents');
const coreUtils = require('./coreUtils');
const coreJsonML = require('./coreJsonML');
const corePathTree = require('./corePathTree');
const json0 = require('ot-json0');

//const webrtc = require('../../y-webrtc');
// import * as Y from 'yjs';
// import { WebrtcProvider } from 'y-webrtc';

const corePopulator = {};

coreEvents.createEvent('populated');

corePopulator.populate = function(rootElement, webstrateId, arrayDoc) {
	// Empty the document, so we can use it.
	while (rootElement.firstChild) {
		rootElement.removeChild(rootElement.firstChild);
	}

	// If the document doesn't exist (no type) or is empty (no data), we should recreate it, unless
	// we're in static mode. We should never modify the document from static mode.

	console.log('id:' + webstrateId);
	const op = [{ 'p': [], 'oi': [
		'html', {}, '\n',
		[ 'head', {}, '\n',
			[ 'title', {}, webstrateId ], '\n'], '\n',
		[ 'body', {}, '\n' ]
	]}];
	const initalizeOp = [{od: null,oi: 'true',p: [5, 1, 'data-gr-c-s-loaded']}];
	arrayDoc = json0.type.apply([], op);
	arrayDoc = json0.type.apply(arrayDoc, initalizeOp);
	coreEvents.triggerEvent('initialize', arrayDoc);

	console.log('Operation is:' +op);

	// doc.submitOp(op);
	// All documents are persisted as JsonML, so we only know how to work with JSON documents.
	// if ((!staticMode && doc.type.name !== 'json0')
	// 	|| (staticMode && doc.type !== 'http://sharejs.org/types/JSONv0')) {
	// 	console.error(staticMode, doc.type);
	// 	throw `Unsupported document type: ${doc.type.name}`;
	// }

	// In order to execute scripts synchronously, we insert them all without execution, and then
	// execute them in order afterwards.
	const scripts = [];
	const html = coreJsonML.toHTML(arrayDoc, undefined, scripts);
	coreUtils.appendChildWithoutScriptExecution(rootElement, html);

	return new Promise((resolve) => {
		console.log('executing scripts');
		coreUtils.executeScripts(scripts, () => {
			console.log('populated');
			// Do not include the parent element in the path, i.e. create corePathTree on the <html>
			// element rather than the document element.
			const targetElement = rootElement.childNodes[0];
			const pathTree = corePathTree.create(targetElement, null, true);
			pathTree.check();
			resolve();
			coreEvents.triggerEvent('populated', targetElement, webstrateId);
		});
	});
};

module.exports = corePopulator;