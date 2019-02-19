/* eslint-env mocha */
'use strict';

global.proclaim = require('proclaim');
const path = require('path');
const Mocha = require('mocha');
const mocha = new Mocha();
const globby = require('globby');
const polyfillLibrary = require('../../');

polyfillLibrary.listAliases().then(aliases => {
    const esFeatures = aliases['es'];
    const nameToPath = f => f.replace(/\./g, path.sep);
    const tests = globby.sync(['!polyfills/__dist'].concat(esFeatures.map(a=>'polyfills/' + nameToPath(a) + '/tests.js')));
    tests.forEach(mocha.addFile.bind(mocha));
    return polyfillLibrary.getPolyfillString({
        features: {
            es: {
                "flags": ["always"]
            }
        },
        minify: false,
        uaString: 'chrome/80'
    }).then(esBundle => {
        new Function(esBundle)();
        mocha.run(function(failures) {
            process.exitCode = failures ? 1 : 0;
        });
    });
});
