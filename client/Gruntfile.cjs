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
				interval: 2500,
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
	
	// Run tasks every 15 seconds
	grunt.registerTask('development', 'Run tasks every 15 seconds', function() {
		const done = this.async();
		const runTasks = () => {
			grunt.task.run(['lint', 'prettify']);
		};
		
		// Run immediately on start
		runTasks();
		
		// Then run every 15 seconds
		setInterval(runTasks, 15000);
	});
};

