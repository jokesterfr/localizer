/**
 * @author Clément Désiles <main@jokester.fr>
 * @date 2016-09-21
 * @see http://gruntjs.com/getting-started
 * @see https://github.com/blueimp/grunt-locales
 * Grunt task manager descriptor
 */
module.exports = function(grunt) {

  /*
   * Disable warnings of this kind:
   * >> Unable to parse locale string from examples/main.js:8:9.
   * grunt-locale is using them abusively, in our case we need
   * to translate dynamic content...
   * @see https://github.com/blueimp/grunt-locales/commit/38fb0b56a39655f20ad0301cc65b48ec72ef3c06
   */
  var _warn = grunt.log.warn;
  grunt.log.warn = function () {
    if (/^Unable to parse locale/.test(arguments && arguments[0])) return;
    _warn.apply(null, arguments);
  };

  // Project configuration
  grunt.initConfig({

    locales: {
        options: {
          locales: ['fr_FR', 'en_US'],
          localizeMethodIdentifiers: ['localize'],
          localizeAttributes: ['localize', 'localize-label', 'localize-placeholder'],
          localeName: 'i18n',
          csvExtraFields: [],
          purgeLocales: true
        },
        update: {
          src: ['examples/**/*.html', 'examples/**/*.js'],
          dest: 'examples/locales/{locale}/i18n.json'
        },
        build: {
          src: 'examples/locales/**/i18n.json',
          dest: 'examples/locales/{locale}/i18n.js'
        },
        'export': {
          src: 'examples/locales/**/i18n.json',
          dest: 'examples/locales/{locale}/i18n.csv'
        },
        'import': {
          src: 'examples/locales/**/i18n.csv',
          dest: 'examples/locales/{locale}/i18n.json'
        }
    },

    handlebars: {
      options: {
        namespace: 'templates'
      },
      all: {
        files: {
          "examples/build/templates.js": ["examples/tpl/*.html"],
        }
      }
    },

    watch: {
      templates: {
        files: [ 'examples/index.html', 'examples/tpl/*.html' ],
        tasks: ['locales:update', 'handlebars'],
        options: {
          spawn: false
        }
      },

      locales: {
        files: 'examples/locales/**/i18n.json',
        tasks: ['locales:build']
      }
    }
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-locales');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  // Default task(s).
  grunt.registerTask('default', ['locales:update', 'locales:build', 'handlebars']);
  grunt.registerTask('i18n', ['locales:update', 'locales:build']);
};
