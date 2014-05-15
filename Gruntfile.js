module.exports = function (grunt) {

	// Metadata.
	var pkg = grunt.file.readJSON('package.json'),
		banner = '/*! ' + pkg.name + ' - v' + pkg.version + ' - ' +
				grunt.template.today("yyyy-mm-dd") + '\n' +
				pkg.homepage ? ('* ' + pkg.homepage + '\n') : '' +
				'* Copyright (c) ' + grunt.template.today("yyyy") + ' ' +
				pkg.author.name + ';' + ' Licensed MIT */\n',

		// My custom variables
		emails = 'emails**/*.+(htm|html)',
		emailZips = emails + '.zip',

		screenfly = 'test/**/*screenfly.js',

		screenshots = 'screenshots/',
		lastShots = screenshots + 'base/',
		resultShots = screenshots + 'results/';

	// load all npm grunt tasks
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({

		// jsHint all js files
		jshint: {
			gruntfile: {
				src: 'Gruntfile.js'
			},
			emailer: {
				src: 'tasks/**/*emailer.js',
			},
			phantomcss: {
				src: screenfly,
			},
			all: ['*.js']
		},

		// Before generating any new files, remove any previously-created files.
		clean: [emailZips],

		emailer: {
			zip: {
				expand: true,
				cwd: '/',
				src: [emails],
				misc: ['**/*.+(jpg|jpeg|gif|png)']
			}
		},

		phantomcss: {
			desktop: {
				options: {
					// url: 'http://rdesai:8022',
					screenshots: lastShots + 'desktop/',
					results: resultShots + 'desktop',
					viewportSize: [1024, 768]
				},
				src: [screenfly]
			},
			mobile: {
				options: {
					// url: 'http://rdesai:8022',
					screenshots: lastShots + 'mobile/',
					results: resultShots + 'mobile',
					viewportSize: [320, 480]
				},
				src: [screenfly]
			}
		},

		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile'],
				options: {
					spawn: false
				}
			},
			emailer: {
				files: '<%= jshint.emailer.src %>',
				tasks: ['jshint:emailer', 'emailer'],
				options: {
					spawn: false
				}
			},
			phantomcss: {
				files: '<%= jshint.phantomcss.src %>',
				tasks: ['jshint:phantomcss', 'phantomcss'],
				options: {
					//spawn: false
				}
			},
			emails: {
				files: [emails],
				tasks: ['emails'],
				options: {
					spawn: false
				}
			}
		},

		/* Grunt exec properties
		__command:__ The shell command to be executed. Must be a string or a function that returns a string. (__alias:__ cmd)
		__stdout:__ If true, stdout will be printed. Defaults to true.
		__stderr:__ If true, stderr will be printed. Defaults to true.
		__cwd:__ Current working directory of the shell command. Defaults to the directory containing your Gruntfile.
		__exitCode:__ The expected exit code, task will fail if the actual exit code doesn't match. Defaults to 0.
		__callback:__ The callback function passed child_process.exec. Defaults to a noop.
		*/

		exec: {
			open: {
				cmd: '#'
			},
			remove_logs: {
				command: 'rm -f *.log',
				stdout: false,
				stderr: false
			},
			list_files: {
				cmd: 'ls -l **'
			},
			echo_grunt_version: {
				cmd: function() { return 'echo ' + this.version; }
			},
			echo_name: {
				cmd: function(firstName, lastName) {
					firstName = typeof firstName !== 'undefined' ? firstName : 'Ronak';
					lastName = typeof lastName !== 'undefined' ? lastName : 'Desai';
					var formattedName = [
						lastName.toUpperCase(),
						firstName.toUpperCase()
					].join(', ');

					return 'echo ' + formattedName;
				}
			}
		}
	});

	// Watch events
	grunt.event.on('watch', function(action, filepath, target) {
		// // configure copy:devTmpl to only run on changed file
		// grunt.config(['copy','devTmpl'], filepath);
		// // configure copy:devImg to only run on changed file
		// grunt.config(['copy','devImg'], filepath);
		switch(target) {
			case 'emails': {
				grunt.config(['exec', 'open', 'cmd'], 'open "' + filepath + '"');
				grunt.config(['emailer', 'zip', 'cwd'], require('path').dirname(filepath));
			}
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// By default, lint and run all tests.
	grunt.registerTask(
		'default',
		'Running "DEFAULT: jshint, clean, emailer, exec, watch"...',
		['jshint:all', 'clean', 'exec', 'watch']
	);
	grunt.registerTask(
		'emails',
		'Running Emailer - zip and upload...',
		['clean', 'emailer', 'exec:open', 'watch']
	);
	grunt.registerTask(
		'screenshots',
		'Taking Screenshots - crawl, screenshot and diff',
		['clean', 'phantomcss', 'watch']
	);
};