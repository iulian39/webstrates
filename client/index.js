'use strict';
const coreEvents = require('./webstrates/coreEvents');
const coreDOM = require('./webstrates/coreDOM');
const coreDatabase = require('./webstrates/coreDatabase');
const coreMutation = require('./webstrates/coreMutation');
const coreOpApplier = require('./webstrates/coreOpApplier');
const coreOpCreator = require('./webstrates/coreOpCreator');
const corePopulator = require('./webstrates/corePopulator');
const coreUtils = require('./webstrates/coreUtils');

//const coreWebsocket = require('./webstrates/coreWebsocket');

// Create an event that'll be triggered once all modules have been loaded.
coreEvents.createEvent('allModulesLoaded');
// coreEvents.createEvent('receivedDocument');
const request = coreUtils.getLocationObject();

const protocol = location.protocol === 'http:' ? 'ws:' : 'wss:';
//coreWebsocket.setup(`${protocol}//${location.host}/${request.webstrateId}/${location.search}`);

// Load optional modules.
config.modules.forEach(module => require('./webstrates/' + module));

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
}
else {
	coreDatabase.subscribe(request.webstrateId).then((arrayDoc) => {

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