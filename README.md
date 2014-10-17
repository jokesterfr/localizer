Localizer
=========

Localizer aims to simplify the usage of [grunt-locales](https://github.com/blueimp/grunt-locales) for translating purpose.
Grunt-locale is a grunt plugin which helps building translation files out of your code base (*html* and *js* files), then when compiled, the javascript language file has to be included in your page.
This is where *localizer* comes, it handles the import of language file for you, switching locale, and translating all nodes corresponding to your criterias.

Installation
------------

... is simple as a bower package can be installed:

	bower install localizer

then add a <script> tag in your page:

```javascript
<script src="../../bower_components/localizer/localizer.js"></script>
```

You're done!

API
---

Exposed objects are:

* __Localizer__ a singleton class, you can instantiate it only once
* __localizer__ reference auto exported when you instantiate *Localizer*
* __localize__ can be used only after Localizer instantiation, or it'll throw an error

### Localizer

*Localizer* prototype is 

```
<instance of Localizer> Localizer(<Object> options)
```

#### Options

Default options are:

```javascript
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
```

#### localizer.localize

Alias to *localize* (see [localize](#localize)).

#### localizer.setLocale

```javascript
// import the locales/fr_FR/i18n.js file
// and update all the registered DOM
// elements with the new translation.
localizer.setLocale('fr_FR');
```

#### localizer.getLocale

```javascript
// get the current locale in use
console.log(localizer.getLocale()); // "fr_FR"
```

### localize

Can take either a string:

```javascript
console.log(localize('Hello')); // "Bonjour"
```

... or a DOM element:

```html
<h1 data-localize>Hello</h1>
<script>
	var title = document.querySelector('h1');
	localize(title); 
	console.log(title.textContent); // "Bonjour"
</script>
```

If you have many more dom content to translate, you can also call localize on a parent ancestor:

```html
<body>
	<h1 data-localize>Hello</h1>
	<h1 data-localize>Hello again</h1>
	<script>
		localize(document.body); 
		var title = document.querySelectorAll('h1').item(0);
		console.log(title.textContent); // "Bonjour"
	</script>
</body>
```

When you give a DOM element to the *localize* method, it registers the element to be changed on the fly if language change:

```html
<h1 data-localize>Hello</h1>
<script>
	localizer.setLocale('fr_FR');
	var title = document.querySelector('h1');
	localize(title); 
	console.log(title.textContent); // "Bonjour"
	localizer.setLocale('en_US');
	console.log(title.textContent); // "Hello"
</script>
```

Examples
--------

To try out a full example of localizer capabilities, open `./examples/index.html` in your web browser.

Licence
-------

The MIT License (MIT)

Copyright (c) 2014 Clément Désiles

*For more details see the `LICENCE` file.*