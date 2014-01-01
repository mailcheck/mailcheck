module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json'),
    uglify:
      options:
        banner: '/*<%= pkg.version %>*/'
      main:
        files:
          'src/mailcheck.min.js': 'src/mailcheck.js'

    jasmine_node:
      specNameMatcher: "spec"
      requirejs: false
      forceExit: true
      jUnit:
        report: false
        savePath : "spec"
        useDotNotation: true
        consolidate: true

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-jasmine-node'

  grunt.registerTask 'default', ['uglify']
  grunt.registerTask 'test', ['jasmine_node']
