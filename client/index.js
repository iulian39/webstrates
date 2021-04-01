'use strict';
const isElectron = require('is-electron');
let basePath = './';
if (isElectron()) basePath = './client/';

const coreEvents = require(basePath + 'webstrates/coreEvents');
const coreDOM = require(basePath + 'webstrates/coreDOM');
const coreJsonML = require(basePath + 'webstrates/coreJsonML');
const coreDatabase = require(basePath + 'webstrates/coreDatabase');
const coreMutation = require(basePath + 'webstrates/coreMutation');
const coreOpApplier = require(basePath + 'webstrates/coreOpApplier');
const coreOpCreator = require(basePath + 'webstrates/coreOpCreator');
const corePopulator = require(basePath + 'webstrates/corePopulator');
const coreUtils = require(basePath + 'webstrates/coreUtils');
const config = require(basePath + 'config');

// json ml putin diferit /done
// path tree putin diferit /done
// mutation modificat masiv
// corePatch e nou /don

const connectToWebstrate = () => {
	const webstrateName = document.getElementById('webstrateName').value;
	loadWebstrates('/' + webstrateName + '/');
};

const loadWebstrates = (webstrateId) => {
	// Create an event that'll be triggered once all modules have been loaded.
	coreEvents.createEvent('allModulesLoaded');
	// coreEvents.createEvent('receivedDocument');
	const request = coreUtils.getLocationObject(webstrateId);


	// Load optional modules.
	if (!isElectron())
		config.modules.forEach(module => require('./webstrates/' + module));
	else
		config.modules.forEach(module => require(basePath + 'webstrates/' + module));

	console.log('IS ELECTRON: ' + isElectron());
	// Send out an event when all modules have been loaded.
	coreEvents.triggerEvent('allModulesLoaded');
	coreEvents.triggerEvent('clientsReceived');
	coreEvents.triggerEvent('connect');
	// coreEvents.triggerEvent('populated');

	if (request.staticMode) {
		console.log(request.staticMode);
		// coreDatabase.fetch(request.webstrateId, request.tagOrVersion).then(doc => {
		// 	corePopulator.populate(coreDOM.externalDocument, doc);
		// });
	} else {
		coreDatabase.subscribe(request.webstrateId).then((arrayDoc) => {
			console.log(request.webstrateId);
			corePopulator.populate(coreDOM.externalDocument, request.webstrateId, arrayDoc).then(() => {
				// Emits mutations from changes on the coreDOM.externalDocument.
				coreMutation.emitMutationsFrom(coreDOM.externalDocument);

				// Emits ops from the mutations emitted by coreMutation.
				coreOpCreator.emitOpsFromMutations();

				// Apply changes on <html>, not coreDOM.externalDocument.
				const targetElement = coreDOM.externalDocument.childNodes[0];
				coreOpApplier.listenForOpsAndApplyOn(targetElement);
			});
		});
	}
};

if (!isElectron()) loadWebstrates();