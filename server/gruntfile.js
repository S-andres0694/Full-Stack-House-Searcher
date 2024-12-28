/* eslint-env node */
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('./package.json'),
		//ESLint
		eslint: {
			target: [
				'routes/**/*.ts',
				'models/**/*.ts',
				'controllers/**/*.ts',
				'database/**/*.ts',
				'tests/**/*.ts',
				'*.ts',
				'*.js',
			],
			options: {
				overrideConfigFile: './eslint.config.mjs',
				ignore: true,
			},
		},
		//Watch
		watch: {
			files: [
				'routes/**/*.ts',
				'models/**/*.ts',
				'controllers/**/*.ts',
				'database/**/*.ts',
				'tests/**/*.ts',
				'*.ts',
				'*.js',
			],
			tasks: ['prettify', 'lint', 'shell:document'],
			options: {
				spawn: false,
				interval: 1000,
			},
		},
		//Prettier
		prettier: {
			files: {
				src: [
					'routes/**/*.ts',
					'models/**/*.ts',
					'controllers/**/*.ts',
					'database/**/*.ts',
					'tests/**/*.ts',
					'*.ts',
					'*.js',
				],
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
					'echo "Running tests..." && npm run unit-tests && npm run integration-tests',
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
	grunt.registerTask('unitTest', ['shell:unitTest']);
	grunt.registerTask('integrationTest', ['shell:integrationTest']);
	grunt.registerTask('lint', ['eslint']);
	grunt.registerTask('prettify', ['prettier']);
	grunt.registerTask('dbGenerate', ['shell:dbGenerate']);
	grunt.registerTask('migrate', ['shell:migrate']);
	grunt.registerTask('build', ['shell:build']);
	grunt.registerTask('test', ['shell:test']);
	grunt.registerTask('default', [
		'lint',
		'prettify',
		'unitTest',
		'integrationTest',
		'dbGenerate',
		'migrate',
		'build',
	]);
	grunt.registerTask('development', ['watch']);
};
