var path = require('path');
var async = require('async');

module.exports = function(grunt) {

	grunt.initConfig({
	
	});
	
	grunt.registerTask('server', 'Run backend server', function() {
		var done = this.async();
		
		async.waterfall([
			function() {
				var serverPath = path.resolve(__dirname + '/server/backend'),
				server = require(serverPath);
				
				grunt.log.write("Started server\n");
			}
		]);
	});
	
	grunt.registerTask('default', function() {
	

	});
};
