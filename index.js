/**
 * Module dependencies.
 */

var Base = require('./lib/base');
var fs = require('fs');
var _ = require('underscore');
var _s = require('underscore.string');
var hat = require('hat');

exports = module.exports = JsonToFile;

function JsonToFile(runner) {
    Base.call(this, runner);

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
        var base = __dirname + '/../../temp/mocha/' + type + '/';
        if (fullTitle.indexOf('after all') !== -1) {
            fullTitle = 'after_all_' + hat();
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
        test.title = test && test.title.replace(/[^\w\s]/gi, '');
        var fullPath = test && test.file && test.file.indexOf('/') !== -1 && _.last(test.file.split('/')) + '_' + hat(6) + '_' + _s.truncate(test.title);
        return {
            title: fullPath || test.title,
            fullTitle: fullPath || hat(),
            duration: test.duration,
            file: test.file || hat()
        }
    }
}