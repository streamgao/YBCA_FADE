const _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var split = require('split');

var Log = function(DEBUG){
    var msg = _.map(arguments, b=>{return b==null ? 'NULL' : b.toString()}).join(' ')+'\n'
    fs.appendFile('log.txt', msg, function (err) {
        if (err) throw err;
    });
    if(DEBUG) {
        console.log(msg);
    }
};

module.exports = Log;
