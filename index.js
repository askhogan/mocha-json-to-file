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
            var cleanedTest = clean(test)
            writeToFile('pass', cleanedTest, cleanedTest.fullTitle);
        } catch (e) {
            console.error('Error in pass', e);
        }
    });

    runner.on('fail', function (test, err) {
        try {
            var cleanedTest = clean(test);
            if (err && err.message) cleanedTest.err = err.message;
            writeToFile('fail', cleanedTest, cleanedTest.fullTitle);
        } catch (e) {
            console.error('Error in fail', e);
        }
    });

    function writeToFile(type, data, fullTitle) {
        try {
            var output = {};
            output[type] = data;
            var prettyOutput = JSON.stringify(output, null, 2);
            var file = getLogToFileName(type, fullTitle);
            logIfFileExists(file);
            fs.writeFile(file, prettyOutput, function (err) {
                if (err) console.error(err);
            });
        } catch (e) {
            console.error('Error writing to file: ', e);
        }
    }

    function logIfFileExists(file){
        try{
            //todo write to file
            if(fs.lstatSync(file)) console.error('overwriting file', file);
        }catch(e){}
    }

    /**
     *
     * @param type
     * @param fullTitle
     * @returns {string}
     */
    function getLogToFileName(type, fullTitle) {
        var base = __dirname + '/../../temp/mocha/' + type + '/';
        if(_s.include(fullTitle, 'after each')){
            fullTitle = 'after_each_' + hat()
        }
        if (fullTitle.indexOf('after all') !== -1) {
            fullTitle = 'after_all_' + hat();
        }
        if(_s.include(fullTitle, 'before each')){
            fullTitle = 'before_each_' + hat()
        }
        if(_s.include(fullTitle, 'before all')){
            fullTitle = 'before_all_' + hat()
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
        test.title = test && test.title && test.title.replace(/[^\w\s]/gi, '');
        var fullPath = test && test.file && test.file.indexOf('/') !== -1 && _.last(test.file.split('/')) + '_' + hat(6) + '_' + _s.truncate(test.title, 50) || (test && test.title);
        return {
            title: fullPath,
            fullTitle: _s.truncate(fullPath, 255) || hat(),
            duration: test && test.duration,
            file: (test && test.file) || hat()
        }
    }
}