/**
 * @date 2018-05-16
 * @author Clément Désiles <main@jokester.fr>
 * @description
 * Translate the data-localize DOM elements found to the desired language.
 * This is intended to work with *grunt-locales*.
 * @see https://github.com/blueimp/grunt-locales
 */

/* globals CustomEvent, HTMLElement */
;(function (window, document) {
  'use strict'
  if (window.Localizer) return
  var singletonFlag

  /**
   * Escape html chars from string to prevent cross-site scripting attacks.
   * @see https://github.com/blueimp/grunt-locales#dom-replacement
   */
  function escapeHTML (str) {
    return str.replace(/[<>&"]/g, (c) => {
      return {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;'
      }[c]
    })
  }

  /**
   * A singleton class to handle the localization process.
   * @class Localizer
   * @param {Object} options
   */
  var Localizer = function (options) {
    if (singletonFlag) {
      console.log('Psiit, check this out: window.localizer')
      throw new Error('singleton class can be instanciated once')
    }
    singletonFlag = true
    this.locale = null
    this.registeredElements = []
    Object.assign(this.options, options)

    // Export can be defined once (singleton)
    window.localizer = this
    window.localize = this.localize.bind(this)
  }

  /**
   * Localizer options
   */
  Localizer.prototype = {
    options: {
      // The default locale to be used
      defaultLocale: 'en-US',
    },

    /**
     * Load new language script if not the same
     * and create and dispatch the event.
     * @public
     * @param {String} locale
     * @emits {Object} localeChange - "en-US" for example
     * @param {Function} callback - gives (Error err)
     * @return none
     */
    setLocale: function (locale, callback) {
      callback = callback || function () {}
      if (!locale) locale = this.options.defaultLocale
      else if (locale === this.locale) return callback()
      else if (!i18n.hasOwnProperty(locale)) throw new Error('locale not supported')
      this.locale = locale

      // Dispatch event on document for listeners
      var evt = new CustomEvent('localeChange', { detail: locale })
      document.dispatchEvent(evt)

      this.registeredElements.forEach(this.localize.bind(this))
      return callback()
    },

    /**
     * Simple getter for current locale.
     * @return {String} locale
     */
    getLocale: function () {
      return this.locale
    },

    /**
     * Localizer the string in accordance with given data,
     * if key is an HTML element, this handle it properly.
     * @param {String or HTMLElement} key
     * @param {Object} data
     * @return {String}
     */
    localize: function (key, data) {
      if (!key) return

      // String case
      // -----------
      if (!(key instanceof HTMLElement)) {
        var func = window.i18n && window.i18n[this.locale][key]
        if (func) {
          /*
           * Now grunt-locales can map to String in its
           * locale generated array, not only functions
           * @see https://github.com/blueimp/grunt-locales#optionswrapstatictranslations
           */
          if (typeof func === 'function') return func(data)
          else return func
        }
        return key
      }

      // HTMLElement case
      // ----------------

      // Register it
      var elt = key
      if (this.registeredElements.indexOf(elt) === -1) {
        this.registeredElements.push(elt)
      }

      // Apply localize change
      if (elt.hasAttribute('data-localize')) elt = elt.parentNode
      var nodes = elt.querySelectorAll('[data-localize]')
      Array.prototype.forEach.call(nodes, (node) => {
        var dataset = node.dataset
        var data = {}
        var attr = dataset && dataset.localize
        var func = window.i18n && window.i18n[this.locale][attr || node.innerHTML]
        var key
        if (func) {
          if (!attr) {
            node.setAttribute('data-localize', node.textContent)
          }
          for (key in dataset) {
            // Data is guessed on the fly with the dataset
            if (dataset.hasOwnProperty(key) && key !== 'localize') {
              data[key] = escapeHTML(dataset[key])
            }
          }
          if (typeof func === 'function') node.innerHTML = func(data)
          else node.innerHTML = func
        } else if (attr) {
          node.textContent = attr
        } else {
          node.setAttribute('data-localize', node.textContent)
        }
      })
      return
    },

    /**
     * Add a listener on localeChange event.
     * We do use here the native *addEventListener*
     * mecanism to register listeners.
     * @param {String} eventName
     * @param {Function} listener
     * @return none
     */
    on: function (eventName, listener) {
      listener = typeof eventName === 'function' ? eventName : listener
      if (!listener) throw new Error('listener cannot be null')
      eventName = 'localeChange' // only one for now
      document.addEventListener(eventName, (evt) => {
        return listener(evt.detail)
      })
    }
  }

  /**
   * @alias Localizer.prototype.on
   */
  Localizer.prototype.addEventListener = Localizer.prototype.on

  // Exports
  window.Localizer = Localizer
  window.localize = () => {
    throw new Error('instanciate Localizer once before usage')
  }
})(window, document)
