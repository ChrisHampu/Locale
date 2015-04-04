var path = require('path'),
	async = require('async'),
	fs    = require('fs'),
    bower = require('bower');

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
		},
		copy: {
			deploy: {
				files: [
					{ flatten: true, src: ['bower_components/backbone/backbone.js'], dest: 'deploy/js/libs/backbone/backbone.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/requirejs/require.js'], dest: 'deploy/js/libs/require/require.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/requirejs-hbs/hbs.js'], dest: 'deploy/js/libs/requirejs-hbs/hbs.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/jquery/dist/jquery.min.js'], dest: 'deploy/js/libs/jquery/jquery.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/underscore/underscore-min.js'], dest: 'deploy/js/libs/underscore/underscore.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/handlebars/handlebars.js'], dest: 'deploy/js/libs/handlebars/handlebars.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/text/text.js'], dest: 'deploy/js/libs/text/text.js', filter: 'isFile' },
					{ flatten: true, src: ['bower_components/bootstrap/dist/js/bootstrap.min.js'], dest: 'deploy/js/libs/bootstrap/bootstrap.js', filter: 'isFile'  },
					{ flatten: true, src: ['frontend/js/libs/sidr/jquery.sidr.min.js'], dest: 'deploy/js/libs/sidr/jquery.sidr.min.js', filter: 'isFile' },
					{ flatten: true, src: ['frontend/js/libs/require/async.js'], dest: 'deploy/js/libs/require/async.js', filter: 'isFile' }
					{ flatten: true, src: ['frontend/js/libs/thorax/thorax.js'], dest: 'deploy/js/libs/thorax/thorax.js', filter: 'isFile' }
				]
			},
			dev: {
				files: [
					{ flatten: true, src: ['bower_components/backbone/backbone.js'], dest: 'frontend/js/libs/backbone/backbone.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/requirejs/require.js'], dest: 'frontend/js/libs/require/require.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/requirejs-hbs/hbs.js'], dest: 'frontend/js/libs/requirejs-hbs/hbs.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/jquery/dist/jquery.js'], dest: 'frontend/js/libs/jquery/jquery.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/underscore/underscore.js'], dest: 'frontend/js/libs/underscore/underscore.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/handlebars/handlebars.js'], dest: 'frontend/js/libs/handlebars/handlebars.js', filter: 'isFile'  },
					{ flatten: true, src: ['bower_components/text/text.js'], dest: 'frontend/js/libs/text/text.js', filter: 'isFile' },
					{ flatten: true, src: ['bower_components/bootstrap/dist/js/bootstrap.js'], dest: 'frontend/js/libs/bootstrap/bootstrap.js', filter: 'isFile'  }
				]
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	
	grunt.registerTask('ensure-installed', function() {
		var complete = this.async();
		
		if (!fs.existsSync(__dirname + "/bower_components")) {
			bower.commands.install().on('data', function(data) {
					process.stdout.write(data);
			}).on('error', function(data) {
					process.stderr.write(data);
			}).on('end', function (data) {
				if (data) {
					process.stdout.write(data);
				}
				complete();
			});
		} else {
			complete();
		}
	});	
	
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
		grunt.task.run('copy:deploy');
	});
	
	grunt.registerTask('default', function() {
		grunt.task.run('ensure-installed');
		grunt.task.run('copy:dev');
	});
};
