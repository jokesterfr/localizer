/**
 * @date 2014-09-11
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
   * Extends object a with b options
   * @param  {Object} a first set of options (of this object)
   * @param  {Object} b set of options to merge
   */
  function extend (a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key]
      }
    }
  }

  /**
   * Escape html chars from string to prevent
   * Cross-site scripting attacks.
   * @see https://github.com/blueimp/grunt-locales#dom-replacement
   */
  function escapeHTML (str) {
    return str.replace(/[<>&"]/g, function (c) {
      return {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;'
      }[c]
    })
  }

  /**
   * Load a javascript script dynamically into the dom <head>
   * @param {String} url - path of the source script to load
   * @param {String} id - identifier for switching purpose
   * @param {Function} callback - gives(Error err)
   */
  function insertScript (url, id, callback) {
    // Check if we need to update script
    if (id) {
      var old = document.getElementById(id)
      if (old) {
        if (url === old.getAttribute('url')) return callback()
        else old.parentNode.removeChild(old)
      }
    }

    // Reset previous i18n set (if any)
    window.i18n = {}

    // Adding the script tag to the head as suggested before
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    script.id = id

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback
    script.onload = callback
    script.onerror = function () {
      throw new Error('cannot import ' + url + ', no translation available')
    }

    // Fire the loading
    document.head.appendChild(script)
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
    extend(this.options, options)

    // Export can be defined once (singleton)
    window.localizer = this
    window.localize = this.localize.bind(this)
  }

  /**
   * Localizer options
   */
  Localizer.prototype = {
    options: {
      // Where the pre-built javascript files will be retrieved from
      localePath: 'locales/{locale}/i18n.js',

      // The default locale to be used
      defaultLocale: 'en_US',

      // Where the script is inserted in the page
      scriptAnchor: 'i18n-src'
    },

    /**
     * Load new language script if not the same
     * and create and dispatch the event.
     * @public
     * @param {String} locale
     * @emits {Object} localeChange - "en_US" for example
     * @param {Function} callback - gives (Error err)
     * @return none
     */
    setLocale: function (locale, callback) {
      callback = callback || function () {}
      if (!locale) locale = this.options.defaultLocale
      else if (locale === this.locale) return callback()

      // Get locale path
      var path = this.options.localePath.replace(/\{locale\}/, locale)

      // Insert language file and apply changes to all registered elements
      insertScript(path, this.options.scriptAnchor, function () {
        this.locale = locale
        console.log('language changed to', this.locale)

        // Dispatch event on document for listeners
        var evt = new CustomEvent('localeChange', { detail: locale })
        document.dispatchEvent(evt)

        this.registeredElements.forEach(this.localize.bind(this))
        return callback()
      }.bind(this))
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
        var func = window.i18n && window.i18n[key]
        if (func && typeof func === 'function') {
          return func(data)
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
      Array.prototype.forEach.call(nodes, function (node) {
        var dataset = node.dataset
        var data = {}
        var attr = dataset && dataset.localize
        var func = window.i18n && window.i18n[attr || node.innerHTML]
        var key
        var f
        if (func) {
          if (!attr) {
            node.setAttribute('data-localize', node.textContent)
          }
          for (key in dataset) {
            // Data is guessed on the fly with the dataset
            if (dataset.hasOwnProperty(key) && key !== 'localize') {
              data[key] = escapeHTML(dataset[key])
              // If a the key itself can be translated, do it
              f = data[key] && window.i18n && window.i18n[data[key]]
              console.warn(data[key], f)
              if (f && typeof f === 'function') {
                data[key] = f(dataset)
              }
            }
          }
          if (typeof func === 'function') {
            node.innerHTML = func(data)
          } else {
            node.innerHTML = func
          }
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
      document.addEventListener(eventName, function (evt) {
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
  window.localize = function () {
    throw new Error('instanciate Localizer once before usage')
  }
})(window, document)
