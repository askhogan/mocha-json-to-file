/**
 * Module dependencies.
 */

var Base = require('./lib/base');
var color = Base.color;
var fs = require('fs');
var hat = require('hat');
var path = require('path');

exports = module.exports = ClusterEmitterReporter;

function ClusterEmitterReporter(runner) {
    Base.call(this, runner);

    var self = this;

    runner.on('pass', function (test) {
        try {
            var output = JSON.stringify({'pass': clean(test)});
            writeToFile('pass', output, clean(test).fullTitle);
        } catch (e) {
            console.error('Error in pass', e);
        }
    });

    runner.on('fail', function (test, err) {
        try {
            test = clean(test);
            if (err && err.message) test.err = err.message;
            var output = JSON.stringify({'fail': test});
            writeToFile('fail', output, clean(test).fullTitle);
        } catch (e) {
            console.error('Error in fail', e);
        }
    });

    runner.on('end', function () {
        try {
            var output = JSON.stringify({'end': self.stats});
            writeToFile('end', output, hat());
        } catch (e) {
            console.error('Error in end', e);
        }
    });

    function writeToFile(type, output, fullTitle) {
        try {
            var file = getLogToFileName(type, fullTitle);
            fs.writeFile(file, output, function (err) {
                if (err) console.error(err);
            });
        } catch (e) {
            console.error('Error writing to file: ', e);
        }
    }

    /**
     *
     * @param type
     * @param fullTitle
     * @returns {string}
     */
    function getLogToFileName(type, fullTitle) {
        var base = '/temp/mocha/' + type + '/';
        if (fullTitle.indexOf('after all') !== -1) {
            //do something here to make them unique
        }
        if (!type) {
            console.error('No type provided');
            return base + hat() + '.json';
        }

        return base + fullTitle + '.json';
    }

    /**
     * Return a plain-object representation of `test`
     * free of cyclic properties etc.
     *
     * @param {Object} test
     * @return {Object}
     * @api private
     */

    function clean(test) {
        test.title = test.title.replace(/[^\w\s]/gi, '');
        var fullPath = test.file && test.file.indexOf('/') !== -1 && _.last(test.file.split('/')) + '_' + test.title;
        console.log(fullPath, test.file, test);
        if (!test.file) {
            console.log('No file so log out', this);
        }
        return {
            title: fullPath || test.title,
            fullTitle: fullPath,
            duration: test.duration,
            file: test.file
        }
    }
}