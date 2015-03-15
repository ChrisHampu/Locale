define([
	'jquery',
	'underscore',
	'backbone',
	'LocaleChatMessageModel'
], function($, _, Backbone, LocaleChatMessageModel){

	/**
	  * @extends Backbone.Collection
	  */
	var LocaleChatroomMessageCollection = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: LocaleChatMessageModel

	});

	/**
	  * @return
	  */
	return LocaleChatroomMessageCollection;
});