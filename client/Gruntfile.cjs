/* eslint-env node */

const projectFiles = [
	'src/**/*.ts',
	'src/**/*.tsx',
	'src/**/*.js',
	'src/**/*.jsx',
	'src/**/*.json',
	'src/**/*.cjs',
];

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('./package.json'),
		//ESLint
		eslint: {
			target: projectFiles,
			options: {
				overrideConfigFile: './eslint.config.js',
				ignore: true,
			},
		},
		//Watch
		watch: {
			files: projectFiles,
			tasks: ['prettify', 'lint'],
			options: {
				spawn: false,
				interval: 1000,
			},
		},
		//Prettier
		prettier: {
			files: {
				src: projectFiles,
			},
		},
	});

	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-prettier');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('lint', ['eslint']);
	grunt.registerTask('prettify', ['prettier']);
	grunt.registerTask('default', [
		'lint',
		'prettify',
	]);
	grunt.registerTask('development', ['watch']);
};

