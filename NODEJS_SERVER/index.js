// init
"use strict";
var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var split = require('split');
// var parse = require('csv-parse');
const csv = require('csvtojson')
var Config = require('./config')
var Controller = require('./controller');
var Network = require('./network');
var Log = require('./Log');

var App_and_socket = require('./app_and_socket');
var controller = new Controller(Network, App_and_socket)
Network.startServer(controller.heart_beat_received.bind(controller))

controller.labelStreams.init()
    .then(()=>{
        console.log("all done");
    })
    .catch(err=>{console.log(err)});

// controller.regularStreams.startRegular();
// controller.regularStreams.stopRegular();

var option={
    duration: 1000,
    sequential: true,
    sequential_delta: 40,
    randomize: false,
    randomize_range: 8095,
    drift: true,
    drift_delta:2,
    msg: "0,255,0,1"
}
controller.regularStreams.startRegular(option);
