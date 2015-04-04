define([
	'thorax',
	'LocaleChatModel'
], function($, LocaleChatModel){

	/**
	  * @extends Thorax.Collection
	  */
	var LocaleChatroomCollection = Thorax.Collection.extend({

		// Reference to this collection's model.
		model: LocaleChatModel

	});

	/**
	  * @return
	  */
	return LocaleChatroomCollection;
});