/*global module:false*/
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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
			src: ['Gruntfile.js', 'src/injector.js']
		},
		jasmine: {
			src: 'src/injector.js',
			options: {
				specs: 'spec/spec.js'
			}
		},
		uglify: {
			options: {
				banner: '/*\n' +
					'* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'* http://github.com/aaronius/injectorjs\n' +
					'* Aaron Hardy; Licensed MIT\n' +
					'*/\n',
				report: 'gzip'
			},
			build: {
				src: 'src/injector.js',
				dest: 'build/injector.min.js'
			}
		}
	});

	// Default task.
	grunt.registerTask('default', ['jshint', 'jasmine', 'uglify']);
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-uglify');
};
