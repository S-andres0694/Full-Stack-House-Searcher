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
    },
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-prettier');
  grunt.loadNpmTasks('grunt-shell');
  grunt.registerTask('unitTest', ['shell:unitTest']);
  grunt.registerTask('integrationTest', ['shell:integrationTest']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('prettify', ['prettier']);
  grunt.registerTask('dbGenerate', ['shell:dbGenerate']);
  grunt.registerTask('migrate', ['shell:migrate']);
  grunt.registerTask('build', ['shell:build']);
  grunt.registerTask('default', [
    'lint',
    'prettify',
    'unitTest',
    'integrationTest',
    'dbGenerate',
    'migrate',
    'build',
  ]);
};
