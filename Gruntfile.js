/**
* GruntFile for Adok
**/

var path = require('path');
var fs = require('fs');


module.exports = function(grunt) {

	//-> Load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	//-> Grunt config
	grunt.initConfig({

		//-> Read package.json
		pkg: grunt.file.readJSON('package.json'),

		//-> for running tasks concurrently (instead of sequentially)
		concurrent: {
			dev: {
				tasks: [ 'flo', 'nodemon', 'watch'],
				//tasks: [ 'nodemon', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		//-> instantiate fb-flo (crossplatform & cross editor live-reload & reload )
		flo: {
        serve: {
            options: {
                // fb-flo options.
                port: 4000,
                dir: './',
                glob: [
					'!**/.subl*.tmp',
					'!**/*.TMP',
					'!node_modules/',
					'!public/components/'
				],
				// auto resolvers.
				resolver: function(filepath, callback) {
				if ((filepath.match(/^public(\\|\/)(views(\\|\/)min|css)(\\|\/)/) || filepath.match(/^public(\\|\/)layouts(\\|\/)/) ||filepath.match(/^(view|layout)s(\\|\/)/)) && filepath.match(/\.(js|min.js|jade|css)$/))
					callback({
						resourceURL: (!!filepath.match(/^public(\\|\/)/) ? filepath.split(/^public(\\|\/)/)[2] : filepath),
						contents: fs.readFileSync(filepath),
						reload: !filepath.match(/\.(css|js|min.js)$/),
						update: function(_window, _resourceURL) {
							console.log("Resource " + _resourceURL + " has just been updated with new content");
						}
					});
                }
            }
        }
    },

		//-> utility that will monitor for any changes in your source
		//-> and automatically restart your server
		nodemon: {
			dev: {
				options: {
					file: 'app.js',
					ignoredFiles: [
						'.sass-cache/**',
						'components/**',
						'locales/**',
						'node_modules/**',
						'public/css',
						'public/layouts',
						'public/less',
						'public/medias',
						'public/views',
						'schema/**',
						'uploads/**'
					],
					watchedExtensions: ['js']
				}
			}
		},

		//-> middleware SASS - compass
		compass: {
			dist: {
				options: {
					sassDir: 'public/CssApp',
					cssDir: 'public/css',
					config: 'config.rb',
        			outputStyle: 'expanded',
        			debugInfo : false,
        			relativeAssets: false,
                    noLineComments: true
				}
			}
		},

		//-> it allows you to do a number of other things
		//-> including running various grunt tasks.
		watch: {
			compass: {
                files: ['public/CssApp/main.scss', 'public/CssApp/components.scss',
                		'public/CssApp/scss/**/*.scss'],
                tasks: ['compass']
            },
			livereload: {
				files: ['public/css/*.css'],
				options: { livereload: true }
			},
			clientJS: {
				 files: [
					'public/layouts/**/*.js', '!public/layouts/**/*.min.js',
					'public/views/**/*.js', '!public/views/**/*.min.js'
				 ],
				 tasks: ['newer:uglify']
			}
		},

		//-> minify files
		uglify: {
			options: {
				mangle: false,
				sourceMapRoot: '/',
				sourceMapPrefix: 1,
				sourceMap: function(filePath) {
					return filePath.replace(/.js/, '.js.map');
				},
				sourceMappingURL: function(filePath) {
					return path.basename(filePath) +'.map';
				}
			},
			layouts: {
				files: {
					'public/layouts/components.min.js': [
						'public/components/jquery/dist/jquery.min.js',
						'public/components/jquery-ui/jquery-ui.min.js',
						'public/components/jquery.ui.touch-punch.dk/jquery.ui.touch-punch.dk.js',
						'public/components/underscore/underscore.js',
						'public/components/backbone/backbone.js',
						'public/components/velocity/velocity.min.js',
						'public/components/velocity/velocity.ui.min.js',
						'public/adok_components/velocity/sequences.js',
						'public/adok_components/FormFF/modernizr.custom.js',
						'public/components/i18next/i18next.min.js',
						'public/components/humane/humane.min.js',
						'public/components/bootstrap/js/affix.js',
						'public/components/bootstrap/js/alert.js',
						'public/components/bootstrap/js/button.js',
						'public/components/bootstrap/js/carousel.js',
						'public/components/bootstrap/js/collapse.js',
						'public/components/bootstrap/js/dropdown.js',
						'public/components/bootstrap/js/modal.js',
						'public/components/bootstrap/js/tooltip.js',
						'public/components/bootstrap/js/popover.js',
						'public/components/bootstrap/js/scrollspy.js',
						'public/components/bootstrap/js/tab.js',
						'public/components/bootstrap/js/transition.js',
						'public/components/moment/moment.js',
						'public/components/pikaday/pikaday.js',
						'public/components/pikaday/plugins/pikaday.jquery.js',
						'public/components/outdated-browser/outdatedbrowser/outatedbrowser.js',
						'public/components/webshim/js-webshim/minified/polyfiller.js',
						'public/adok_components/ripple/ripple.js',
						'public/adok_components/FormFF/classie.js',
						'public/adok_components/FormFF/FormFF.js',
						'public/tools/CalcDistLatLong.js',
						'public/layouts/core.js'
					],
					'public/layouts/ie-sucks.min.js': [
						'public/components/html5shiv/dist/html5shiv.js',
						'public/components/respond/dest/respond.src.js',
						'public/components/webshim/js-webshim/minified/polyfiller.js'
					],
					'public/layouts/admin.min.js': [
						'public/layouts/admin.js'
					]
				}
			},
			views: {
				files: [{
					expand: true,
					cwd: 'public/views/',
					src: ['**/*.js', '!**/*.min.js'],
					dest: 'public/views/min/',
					ext: '.min.js'
				}]
			}
		},

		//-> Clean files and folders
		clean: {
			js: {
				src: [
					'public/layouts/**/*.min.js',
					'public/layouts/**/*.min.js.map',
					'public/views/**/*.min.js',
					'public/views/**/*.min.js.map'
				]
			},
			css: {
				src: [
					'public/layouts/**/*.min.css',
					'public/views/**/*.min.css',
					'public/css/**/*.css',
					'.sass-cache/**'
				]
			}
		}
	});
	//-> End Of Grunt config

	//-> Register Task for Grunt
	grunt.registerTask('default', ['newer:uglify', 'compass:dist', 'concurrent']);
	grunt.registerTask('build', ['uglify', 'compass:dist']);
	grunt.registerTask('cleaner', ['clean']);
};
