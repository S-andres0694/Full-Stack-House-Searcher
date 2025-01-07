/* eslint-env node */

const projectFiles = [
	'routes/**/*.ts',
	'models/**/*.ts',
	'controllers/**/*.ts',
	'database/**/*.ts',
	'tests/**/*.ts',
	'*.ts',
	'*.js',
	'authentication/**/*.ts',
	'middleware/**/*.ts',
];

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('./package.json'),
		//ESLint
		eslint: {
			target: projectFiles,
			options: {
				overrideConfigFile: './eslint.config.mjs',
				ignore: true,
			},
		},
		//Watch
		watch: {
			files: projectFiles,
			tasks: ['prettify', 'lint', 'shell:document'],
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
		shell: {
			options: {
				stdout: true,
				stderr: true,
				failOnError: true,
			},
			unitTest: {
				command: 'echo "Running unit tests..." && npm run unit-tests',
			},
			integrationTest: {
				command:
					'echo "Running integration tests..." && npm run integration-tests',
			},
			dbGenerate: {
				command: 'echo "Generating database..." && npm run db:generate',
			},
			migrate: {
				command: 'echo "Migrating database..." && npm run migrate',
			},
			build: {
				command:
					'echo "Building server application..." && npm run parcel-build',
			},
			test: {
				command:
					'echo "Running tests..." && npm run unit-tests && npm run integration-tests && npm run deployment-tests',
			},
			document: {
				command: 'echo "Generating documentation..." && npm run doc',
			},
		},
	});

	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-prettier');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('lint', ['eslint']);
	grunt.registerTask('prettify', ['prettier']);
	grunt.registerTask('dbGenerate', ['shell:dbGenerate']);
	grunt.registerTask('migrate', ['shell:migrate']);
	grunt.registerTask('build', ['shell:build']);
	grunt.registerTask('test', ['shell:test']);
	grunt.registerTask('default', [
		'lint',
		'prettify',
		'test',
		'dbGenerate',
		'migrate',
		'build',
	]);
	grunt.registerTask('development', ['watch']);
};
