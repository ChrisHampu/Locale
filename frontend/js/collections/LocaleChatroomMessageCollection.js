define([
	'thorax',
	'LocaleChatMessageModel'
], function($, LocaleChatMessageModel){

	/**
	  * @extends Thorax.Collection
	  */
	var LocaleChatroomMessageCollection = Thorax.Collection.extend({

		// Reference to this collection's model.
		model: LocaleChatMessageModel

	});

	/**
	  * @return
	  */
	return LocaleChatroomMessageCollection;
});