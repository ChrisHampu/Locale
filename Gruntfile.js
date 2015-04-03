var path = require('path');
var async = require('async');

module.exports = function(grunt) {

	grunt.initConfig({
		sass: {
			options: {
				sourceMap: true,
				outputStyle: 'compressed'
			},
			deploy: {
				files: {
					'deploy/css/style.css': 'frontend/css/style.scss'
				}
			},
			dev: {
				files: {
					'frontend/css/style.css': 'frontend/css/style.scss'
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-sass');
	
	grunt.registerTask('server', 'Run backend server', function() {
		var done = this.async();
		
		async.waterfall([
			function() {
				var serverPath = path.resolve(__dirname + '/server/backend'),
				server = require(serverPath);
			}
		]);
	});
	
	grunt.registerTask('deploy', 'Create production build', function() {
		grunt.task.run('sass:deploy');
	});
	
	grunt.registerTask('default', function() {
	
	});
};
