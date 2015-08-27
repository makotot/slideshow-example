module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('jit-grunt')(grunt);

  grunt.initConfig({

    path: {
      src: './src',
      env: './dev'
    },

    clean: {
      all: ['<%= path.env %>']
    },

    copy: {
      all: {
        files: [
          {
            expand: true,
            cwd: '<%= path.src %>/js',
            src: '**/*.js',
            dest: '<%= path.env %>/js'
          }
        ]
      }
    },

    assemble: {
      options: {
        layoutdir: '<%= path.src %>/layouts',
        partials: ['<%= path.src %>/partials/**/*.hbs'],
        data: ['<%= path.src %>/data/*.json'],
        helpers: [
        ]
      },
      all: {
        files: [
          {
            expand: true,
            cwd: '<%= path.src %>/pages',
            src: '*.hbs',
            dest: '<%= path.env %>/'
          }
        ]
      }
    },

    sass: {
      options: {
        sourceMap: true
      },
      all: {
        files: [
          {
            expand: true,
            cwd: '<%= path.src %>/scss',
            src: '*.scss',
            dest: '<%= path.env %>/css'
          }
        ]
      }
    },

    eslint: {
      options: {
      },
      target: [
        '<%= path.src %>/js/**/*.js'
      ]
    },

    browserSync: {
      all: {
        bsFiles: {
          src: [
            '<%= path.env %>/**/*.html',
            '<%= path.env %>/**/*.css',
            '<%= path.env %>/**/*.js'
          ]
        },
        options: {
          watchTask: true,
          server: '<%= path.env %>',
          open: false
        }
      }
    },

    watch: {
      options: {
        livereload: true,
        spawn: false
      },

      html: {
        files: ['<%= path.src %>/**/*.hbs', '<%= path.src %>/data/*.json'],
        tasks: ['assemble']
      },

      css: {
        files: ['<%= path.src %>/scss/**/*.scss'],
        tasks: ['sass']
      },

      js: {
        files: ['<%= path.src %>/js/**/*.js'],
        tasks: ['copy']
      }
    }
  });

  grunt.registerTask('default', ['clean']);

  grunt.registerTask('serve', 'server', function () {
    grunt.task.run(['clean', 'eslint', 'assemble', 'copy', 'sass', 'browserSync', 'watch']);
  });
};
