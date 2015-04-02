define([
	'jquery',
	'underscore',
	'backbone',
	'LocaleChatModel'
], function($, _, Backbone, LocaleChatModel){

	/**
	  * @extends Backbone.Collection
	  */
	var LocaleChatroomCollection = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: LocaleChatModel

	});

	/**
	  * @return
	  */
	return LocaleChatroomCollection;
});