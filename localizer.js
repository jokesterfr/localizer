/**
 * @date 2014-09-11
 * @author Clément Désiles <main@jokester.fr>
 * @description
 * Translate the data-localize DOM elements found to the desired language.
 * This is intended to work with *grunt-locales*.
 * @see https://github.com/blueimp/grunt-locales
 */
;(function (window, document) {
	'use strict';
	if (window.Localizer) return;
	var singletonFlag;

	/**
	 * Extends a object with b properties
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 */
	function extend(a, b) {
		for (var key in b) { 
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	}

	/**
	 * Escape html chars from string to prevent
	 * Cross-site scripting attacks.
	 * @see https://github.com/blueimp/grunt-locales#dom-replacement
	 */
	function escapeHTML(str) {
		return str.replace(/[<>&"]/g, function (c) {
			return {
				'<' : '&lt;',
				'>' : '&gt;',
				'&' : '&amp;',
				'"' : '&quot;'
			}[c];
		});
	}

	/**
	 * Load a javascript script dynamically into the dom <head>
	 * @param {String} url - path of the source script to load
	 * @param {String} id - identifier for switching purpose
	 * @param {Function} callback - gives(Error err)
	 */
	function insertScript(url, id, callback) {
		if (id) {
			var old = document.getElementById(id);
			if (old) old.parentNode.removeChild(old);
		}

		// Adding the script tag to the head as suggested before
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.id = id;

		// Then bind the event to the callback function.
		// There are several events for cross browser compatibility.
		script.onreadystatechange = callback;
		script.onload = callback;
		script.onerror = function () {
			throw new Error('cannot import ' + url + ', no translation available');
		};

		// Fire the loading
		document.head.appendChild(script);
	}

	/**
	 * A singleton class to handle the localization process.
	 * @class Localizer
	 * @param {Object} options
	 */
	var Localizer = function (options) {
		if (singletonFlag) {
			console.log('Psiit, check this out: window.localizer');
			throw new Error('singleton class can be instanciated once');
		}
		singletonFlag = true;
		this.locale = null;
		this.registeredElements = [];
		extend(this.options, options);
		this.setLocale(this.options.defaultLocale);

		// Export can be defined once (singleton)
		var that = this;
		window.localizer = this;
		window.localize = function (key, data) {
			that.localize(key, data);
		};
	};

	/**
	 * Localizer options
	 */
	Localizer.prototype.options = {
		// Where the pre-built javascript files will be retrieved from
		localePath: 'locales/{locale}/i18n.js',

		// The default locale to be used
		defaultLocale: 'en_US',

		// Where the script is inserted in the page
		scriptAnchor: 'i18n-src',

		// Called on locale change
		onLocaleChange: function (locale) {}
	};

	/**
	 * Load new language script if not the same
	 * and create and dispatch the event.
	 * @public
	 * @param {String} locale
	 * @emits {Object} localeChanged - { locale: 'en_US' } for example
	 * @return none
	 */
	Localizer.prototype.setLocale = function (locale) {
		if (!locale && this.locale) throw new Error('no locale given');
		else if (locale === this.locale) return;
		this.locale = locale;
		
		// Notify locale change
		this.options.onLocaleChange(locale);

		var that = this;
		var path = this.options.localePath.replace(/\{locale\}/, locale);
		insertScript(path, this.options.scriptAnchor, function () {
			console.log('language changed to', that.locale);
			// Apply change to registered elements
			that.registeredElements.forEach(function (elt) {
				that.localize(elt);
			});
		});
		return;
	};

	/**
	 * Simple getter for current locale.
	 * @return {String} locale
	 */
	Localizer.prototype.getLocale = function () {
		return this.locale;
	};

	/**
	 * Localizer the string in accordance with given data,
	 * if key is an HTML element, this handle it properly.
	 * @param {String or HTMLElement} key
	 * @param {Object} data
	 * @return {String}
	 */
	Localizer.prototype.localize = function (key, data) {
		if (!key) return;

		// String case
		// -----------
		if (!(key instanceof HTMLElement)) {
			var func = window.i18n && window.i18n[key];
			if (func) {
				return func(data);
			}
			return key;
		}
		
		// HTMLElement case
		// ----------------

		// Register it
		var elt = key;
		if (this.registeredElements.indexOf(elt) === -1) {
			this.registeredElements.push(elt);
		}

		// Apply localize change
		var nodes = elt.querySelectorAll('[data-localize]');
		Array.prototype.forEach.call(nodes, function (node) {
			var dataset = node.dataset,
				data = {},
				attr = dataset && dataset.localize,
				func = window.i18n && window.i18n[attr || node.innerHTML],
				key;
			if (func) {
				if (!attr) node.setAttribute('data-localize', node.textContent);
				for (key in dataset) {
					// Data is guessed on the fly with the dataset
					if (dataset.hasOwnProperty(key) && key !== 'localize') {
						data[key] = escapeHTML(dataset[key]);
					}
				}
				node.innerHTML = func(data);
			} else if (attr) {
				node.textContent = attr;
			}
		});
		return;
	};

	// Exports
	window.Localizer = Localizer;
	window.localize = function () {
		throw new Error('instanciate Localizer once before usage');
	};
})(window, document);