# Compatibility entry points for existing contributors and the pre-commit hook.
# Use the same build and tests as npm, including the checked-in browser artifact.
module.exports = (grunt) ->
  run = (args) ->
    require('child_process').execFileSync process.execPath, args, stdio: 'inherit'

  grunt.registerTask 'uglify', -> run ['script/build.js']
  grunt.registerTask 'test', -> run ['script/test-all.js']
  grunt.registerTask 'types', ->
    tsc = require.resolve 'typescript/bin/tsc'
    run [tsc, '-p', 'spec/types/tsconfig.json']
    run [tsc, '-p', 'spec/types/tsconfig.jquery.json']

  grunt.registerTask 'default', ['uglify', 'test', 'types']
