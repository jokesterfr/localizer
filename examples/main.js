// instanciate singleton and localize body
var l = new Localizer()

// init default locale
localizer.setLocale()

// register listeners on body
localize(document.body)

// add a locale switcher
var button = document.querySelector('button')
button.addEventListener('click', function () {
  if (localizer.getLocale() === 'en_US') {
    localizer.setLocale('fr_FR')
  } else {
    localizer.setLocale('en_US')
  }
})

l.on('localeChange', function (locale) {
  console.log('localeChange listener says: locale changed to', locale)
})

// register alpaca random number stuff
document.getElementById('alpaca-btn').addEventListener('click', function (evt) {

  // fill a pre-compiled template
  var xhr = new XMLHttpRequest()
  xhr.addEventListener('load', function () {
    var alpacaTemplate = templates['examples/tpl/alpacas.html']
    var content = alpacaTemplate({ amount: parseInt(this.responseText, 10) })
    var ul = document.querySelector('ul#alpaca-info')
    ul.innerHTML = content

    // translate the pre-compiled template result
    localize(ul)
  })

  // get a random integer
  xhr.open('GET', 'https://www.random.org/integers/?num=1&min=0&max=3&col=1&base=10&format=plain&rnd=new')
  xhr.send()
}, false)

