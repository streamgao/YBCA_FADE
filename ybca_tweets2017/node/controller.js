"use strict"
var _ = require('lodash');
var Q = require('q');
var Config = require('./config')
const csv = require('csvtojson')
const Hashtags = require('./data/hashtags');
var HashtagStream = require('./streams/hashtag_stream');
var LabelStreams = require('./streams/label_streams')
var RegularStreams = require('./streams/regular_streams')
var Devices = require('./devices')

const Max_Devices = 30



var getlogs=function(date){
    var deferred = Q.defer();
    var logs = [];
    //     fs.createReadStream('data/2016-07-27/part-00000')
    fs.createReadStream('data/'+date+'/part-00000')
        .pipe(split())
        .on('data', function (line) {
            if(line.length>5){
                var d=line.replace(/\]/, '').replace(/\[/, '').split(',');
                var user=d.shift()
                var hashtags=d.shift()
                var date=d.pop()
                var location=d.join(',')
                hashtags && hashtags.split(" ").forEach(h=>{
                    if(h.length>3)
                        logs.push({
                            hashtag: h,
                            date: new Date(date)
                        });
                });
            }else{
                Log(line)
            }
        })
        .on('end', ()=>{
            deferred.resolve(logs)
        })
        .on('finish', ()=>{
            Log("finish")
        })
        .on("error", err=>{
            deferred.reject(new Error(err));
        });
    return deferred.promise
}


class Controller{
    constructor(Network, Socket){
        this.plays = null

        this.hashtagStreams=[]
        this.playingTweet = false
        // this.playingRegular = false
        // this.regularOption={
        //     duration: 1000,
        //     sequential: false,
        //     sequential_delta: 10,
        //     randomize: false,
        //     randomize_range: 400,
        //     drift: false,
        //     drift_delta: 10,
        //     msg:"255,0,0,1" //rgbRelay
        // }
        this.Network = Network
        this.Socket = Socket
        this.duration = 100
        this.devices = new Devices(Max_Devices, this.Network)

        this.labelStreams = new LabelStreams(this.devices, this.Socket)
        this.regularStreams = new RegularStreams(this.devices, Max_Devices)

        this.heartMonitorId = 'all'
    }
    day_to_id(i_day, i_hashtag){
        return i_day*Config.HashtagPerDay + i_hashtag
    }
    id_to_day(id){
        var i_day = Math.floor(id/Config.HashtagPerDay)
        var i_hashtag = id - i_day*Config.HashtagPerDay
        return {i_day: i_day, i_hashtag: i_hashtag}
    }
    heart_beat_received(id, ip){
        // Log(id, ip);
        this.devices.add_or_update(id, ip)
        // if(this.plays[id]!==undefined){
        //     this.plays[id].add(id, ip)
        // }
    }
    setPlayStreams(streams){
        this.plays = streams
    }
    initTweet(){
        return _.range(Config.NumDays).reduce((soFar, i_day)=>{
            return soFar.then(()=>{return getlogs(Hashtags[i_day].date)
                .then(logs=>{
                    global.L = logs; 
                    Log(logs.length, "logs loaded")
                    _.range(Config.HashtagPerDay).forEach(i_hashtag=>{
                        var date = Hashtags[i_day].date
                        var hashtag = Hashtags[i_day].hashtags[i_hashtag].hashtag
                        var stream = _.map(logs.filter(l=>{return l.hashtag == hashtag}), 'date')
                        this.hashtagStreams.push( new HashtagStream(date, hashtag, stream, this.Network))
                    })
                    this.setPlayStreams(this.hashtagStreams)
                })
          })
        }, Q([]))
    }
    // tick(id){
    //     if(this.heartMonitorId=='all' || this.heartMonitorId == id)
    //     this.plays.forEach(play=>{play.tick()})
    // }

    startTweet(duration){
        if(duration !== undefined) this.duration = duration
        Log("start playing tweets at duration:", this.duration);
        this.plays.forEach(play=>{play.startTweet()})
        this.playingTweet = true
        this.renderTweet()
    }
    stopTweet(){
        this.playingTweet = false
    }
    renderTweet(){
        if(this.playingTweet){
            setTimeout(()=>{this.renderTweet()}, this.duration)
            this.plays.forEach(play=>{play.renderTweet()})
        }
    }
    // startRegular(option){
    //     if(option!==undefined){
    //         this.regularOption.duration         = option.duration;
    //         this.regularOption.sequential       = option.sequential;
    //         this.regularOption.sequential_delta = option.sequential_delta;
    //         this.regularOption.randomize        = option.randomize;
    //         this.regularOption.randomize_range  = option.randomize_range;
    //         this.regularOption.drift            = option.drift;
    //         this.regularOption.drift_delta      = option.drift_delta;
    //         this.regularOption.msg              = option.msg;
    //     }
    //     this.playingRegular = true
    //     this.renderRegular()
    // }
    // updateRegular(option){
    //     if(option!==undefined){
    //         this.regularOption.duration         = option.duration;
    //         this.regularOption.sequential       = option.sequential;
    //         this.regularOption.sequential_delta = option.sequential_delta;
    //         this.regularOption.randomize        = option.randomize;
    //         this.regularOption.randomize_range  = option.randomize_range;
    //         this.regularOption.drift            = option.drift;
    //         this.regularOption.drift_delta      = option.drift_delta;
    //         this.regularOption.msg              = option.msg;            
    //     }
    // }
    // stopRegular(){
    //     this.playingRegular = false
    //     this.plays.forEach(play=>{play.stopRegular()})
    // }
    // renderRegular(){
    //     if(this.playingRegular){
    //         setTimeout(()=>{this.renderRegular()}, this.regularOption.duration)
    //         this.plays.forEach((play, idx)=>{play.renderRegular(this.regularOption, idx)})
    //         if(this.regularOption.drift){
    //             this.regularOption.sequential_delta += this.regularOption.drift_delta
    //         }
    //     }
    // }
}

module.exports=Controller;