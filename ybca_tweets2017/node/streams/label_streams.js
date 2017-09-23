"use strict"
var _ = require('lodash');
var Config = require('./../config')
const Labels = require('./../data/labels')

const RED = "255,0,0"
const GREEN = "0,255,0"
const BLUE = "0,0,255"
const WHITE = "255,255,255"
const SOUND_ON = ",1"
const SOUND_OFF = ",0"

var day_hr_to_date=function(str){
    var day = str.slice(0, 10)
    var hr = str.slice(11, 13)
    return new Date(day + ' ' + hr + ':00:00 GMT-0000')
}
// day_hr_to_date('2016-11-12-23').toGMTString()



var get_offsetted_now=function(offset){
    var now = new Date()
    var time = new Date(now.setDate(now.getDate() - offset))
    if(Config.OffsetHour !==0){
        return new Date(time.setHours(time.getHours()+Config.OffsetHour))
    }
    return time
}

var getLabelData=function(){
    var deferred = Q.defer();
    var labelData = [];

    csv()
    .fromFile('data/labeldata.csv')
    .on('json',(jsonObj)=>{
        jsonObj.date = day_hr_to_date(jsonObj.date)
        labelData.push(jsonObj)
        // combine csv header row and csv line to a json object
        // jsonObj.a ==> 1 or 4
    })
    .on('done',(error)=>{
        deferred.resolve(labelData)
    })
    .on('error', err =>{
        deferred.reject(new Error(err))
    });

    return deferred.promise
}

class LabelStream{
    constructor(label, id, data, devices){
        this.devices = devices
        this.id = id
        this.data = data
        this.currentTime = this.data[0].date
        this.chance = 0
        this.label=label.label
        this.color = WHITE
        this.sound = SOUND_ON
        this.playing = false
        this.heartbeat_cnt = 0;
        this.playHead = 0; //for performance reason, we use counter
        this.timeoutInsts = [];

        Log("created label stream for ", this.label, data.length, "events")
    }
    setHour(hour){
        this.currentTime = hour
        var item = _.last(this.data.filter(d=>{return d.date <= hour}))
        // cnt => freq
        // 100 => 1
        // 10000+ => 10
        var cnt = item == undefined ? 1 : item.cnt
        var freq = Math.sqrt(cnt / 100.0)
        freq = freq > 10 ? 10 : freq // maximum 10 flashes per sec
        freq = freq < 0.1 ? 0.1 : freq // minimum 1 flash per 10 sec
        this.chance = freq / 10.0
        if(item.cnt > 1000)
            this.color = RED
        else if(item.cnt > 100)
            this.color = GREEN
        else
            this.color = BLUE

    }
    soundOn(){
        this.sound = SOUND_ON
    }
    soundOff(){
        this.sound = SOUND_OFF
    }
    start(){ //start from current time
        if(this.playing){

        }else{
            this.playing = true
            // console.log(`labelstream ${this.id} starting`)
            this.render()        
        }
    }
    stop(){
        this.playing = false
    }
    render(){
        // if(this.label == 'woman') console.log("render")
        if(this.playing){
            setTimeout(()=>{
                this.render()
            }, Config.FrameDelta)

            // console.log(`labelstream ${this.id} render ${this.ip} with ${this.chance}`)
            if(Math.random() < this.chance)
                this.devices.render(this.id, this.color + this.sound)
        }
    }
}

class LabelStreams{
    constructor(devices, Socket){
        this.devices = devices
        this.Socket = Socket
        // this.labels = Labels
        this.labelData = null
        this.startTime = new Date('2016-10-1 0:0:0 GMT-0000')
        this.endTime = new Date('2016-12-1 0:0:0 GMT-0000')
        this.currentTime = this.startTime
        this.labelStreams = []
        this.playing = false
    }
    init(){
        return getLabelData().then(
            data=>{
                this.labelData = data
                Labels.forEach((label, id) =>{
                    var partialData = data.filter(d=>{return d.label == label.label})
                    console.log(id, label, partialData.length)
                    this.labelStreams.push(new LabelStream(label, id, partialData, this.devices))
                })
                // this.setPlayStreams(this.labelStreams)
                this.currentTime = this.startTime
        })
    }
    start(){
        if(this.playing){

        }else{
            this.playing = true
            this.render()
            this.labelStreams.forEach(s=>{s.start()})
        }
    }
    stop(){
        this.playing = false
        this.labelStreams.forEach(s=>{s.stop()})
    }
    soundOn(){
        this.labelStreams.forEach(s=>{s.soundOn()})
    }
    soundOff(){
        this.labelStreams.forEach(s=>{s.soundOff()})
    }
    setTime(hr){
        // toGMTString
        // toLocaleString()
        var dateStr = hr.toLocaleString()
        var day = dateStr.split(',')[0]
        var hour = dateStr.split(',')[1].trim().split(':')[0]
        var apm = dateStr.split(',')[1].trim().split(' ')[1]
        var msg = day + " " + hour + apm + " PST"
        this.Socket.send(msg)
        this.labelStreams.forEach(s=>{s.setHour(hr)})
    }
    resetTime(){
        this.currentTime = this.startTime
    }
    render(){
        // console.log(this.labelCurrentTime)
        if(this.playing){
            setTimeout(()=>{
                this.render()
            }, 2400) // 2400 => takes 58 min to playback 61 day of data by hour
            this.setTime(this.currentTime)
            this.currentTime.setHours(this.currentTime.getHours()+1)
            if(this.currentTime > this.endTime){
                console.log("Start label playing from the beginning")
                this.resetTime()
            }
        }
    }
}

module.exports=LabelStreams;