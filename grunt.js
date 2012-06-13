/*global module:false*/
module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		meta: {
		version: '0.1.0',
		banner: '/*! injectjs - v<%= meta.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'* http://github.com/aaronius/injectjs/\n' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
			'Aaron Hardy; Licensed MIT */'
		},
		lint: {
			files: ['grunt.js', 'src/*.js']
		},
		test: {
			files: ['spec/spec.js']
		},
		concat: {
			dist: {
				src: ['<banner:meta.banner>', 'src/*.js'],
				dest: 'injector.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: 'injector.min.js'
			}
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint test'
		},

//		mocha: {
//			index: ['mocha-spec/runner.html']
//		},
		jasmine: {
			all: ['spec/runner.html']
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true
			},
			globals: {}
		},
		uglify: {}
	});

	// Default task.
	grunt.registerTask('default', 'lint jasmine concat min');
	//  grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-jasmine-task');
};
