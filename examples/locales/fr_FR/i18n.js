(function () {
var i18n = window.i18n = window.i18n || {},
    MessageFormat = {locale: {}};

MessageFormat.locale.fr=function(n){return n===0||n==1?"one":"other"}

var
c=function(d){if(!d)throw new Error("MessageFormat: No data passed to function.")},
n=function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: `"+k+"` isnt a number.");return d[k]-(o||0)},
v=function(d,k){c(d);return d[k]},
p=function(d,k,o,l,p){c(d);return d[k] in p?p[d[k]]:(k=MessageFormat.locale[l](d[k]-o),k in p?p[k]:p.other)},
s=function(d,k,p){c(d);return d[k] in p?p[d[k]]:p.other};

i18n["Mojo"] = function(d){return "Je localise, tu délocalises, nous délocalisons la production !"};
i18n["Hello {name}!"] = function(d){return "Bonjour "+v(d,"name")+" !"};
i18n["Switch to french"] = function(d){return "Changer pour de l'anglais"};
}());
