"use strict"
var _ = require('lodash');
const BLINK = 0;
const FADE = 1;

class RegularStream{
		constructor(idx, devices) {
				this.id = idx
				this.devices = devices
		  	this.timeoutInsts = [];
		}
    renderRegular(option) {
        if(this.ip!==null){
            if(option.sequential==false && option.randomize == false){
                this.tick(false, option.msg)
            }else if(option.sequential && option.randomize == false){
                this.timeoutInsts.push(setTimeout(()=>{this.tick(true, option.msg)}, this.id*option.sequential_delta))
            }else if(option.sequential==false && option.randomize){
                this.timeoutInsts.push(setTimeout(()=>{this.tick(true, option.msg)}, Math.random()* option.randomize_range))
            }else if(option.sequential && option.randomize){
                this.timeoutInsts.push(setTimeout(()=>{this.tick(true, option.msg)}, this.id*option.sequential_delta + Math.random()* option.randomize_range))
            }
        }
    }
    tick(remove_from_timeoutInsts, msg){
        if(remove_from_timeoutInsts) this.timeoutInsts.shift()
        this.devices.render(this.id, msg)
	}
	stop(){
	    this.timeoutInsts.forEach(inst=>{clearTimeout(inst)})
      this.timeoutInsts.length = 0
	}


}

class RegularStreams{
		constructor(devices, num_devices){
				this.devices = devices;
        this.playingRegular = false;
        this.regularStreams = [];
        _.range(num_devices).forEach(idx =>{
        		this.regularStreams.push(new RegularStream(idx, this.devices));
        });
        this.regularOption = {
						blink_mode: BLINK,
            duration: 1000,
            sequential: false,
            sequential_delta: 10,
            randomize: false,
            randomize_range: 400,
            drift: false,
            drift_delta: 10,
            msg: "255,0,0,1" //rgbRelay
        };
		}
    startRegular(option) {
        if(option!==undefined) {
            this.regularOption.duration         = option.duration;
            this.regularOption.sequential       = option.sequential;
            this.regularOption.sequential_delta = option.sequential_delta;
            this.regularOption.randomize        = option.randomize;
            this.regularOption.randomize_range  = option.randomize_range;
            this.regularOption.drift            = option.drift;
            this.regularOption.drift_delta      = option.drift_delta;
            this.regularOption.msg              = option.msg;
        }
        this.playingRegular = true;
        this.renderRegular();
    }
    updateRegular(option){
        if(option!==undefined){
            this.regularOption.duration         = option.duration;
            this.regularOption.sequential       = option.sequential;
            this.regularOption.sequential_delta = option.sequential_delta;
            this.regularOption.randomize        = option.randomize;
            this.regularOption.randomize_range  = option.randomize_range;
            this.regularOption.drift            = option.drift;
            this.regularOption.drift_delta      = option.drift_delta;
            this.regularOption.msg              = option.msg;
        }
    }
    stopRegular(){
        this.playingRegular = false;
        this.regularStreams.forEach(play=>{play.stop()});
    }
    renderRegular(){
        if(this.playingRegular){
            setTimeout(()=>{this.renderRegular()}, this.regularOption.duration);
            // this.plays.forEach((play, idx)=>{play.renderRegular(this.regularOption, idx)})
            this.regularStreams.forEach((play)=>{
            	play.renderRegular(this.regularOption);
            });
            if(this.regularOption.drift){
                this.regularOption.sequential_delta += this.regularOption.drift_delta;
            }
        }
    }
}

module.exports = RegularStreams
