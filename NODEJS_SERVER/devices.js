"use strict"
const _ = require('lodash')
const MaxHeartbeatCnt = 3;
var Log = require('./Log');


class Devices{
	constructor(max_devices, Network){
		this.Network = Network

		this.devices = []  // id => ip mapping
		_.range(max_devices).forEach(id =>{
			this.devices.push(new Device(id, Network))
		})
	}
    add_or_update(id, ip){
    	this.devices[id].add_or_update(ip)
    }
    render(id, msg){
    	this.devices[id].render(msg)
    }

}

class Device{
	constructor(id, Network){
		this.id = id
		this.ip = null
		this.Network = Network
	    this.heartbeat_cnt = 0;

	}
	render(msg){
		if(this.ip !== null){
			// console.log(`sending ${msg} to ${this.ip}`)
			this.Network.send(this.ip, msg)
		}
	}
    add_or_update(ip){
        if(this.ip == null){
            Log(`adding ${ip} to ${this.id}`)
            setTimeout(()=>{ this.checkHealth()}, 3000);
        }
        if(this.ip !== ip){
        	Log(`ip changed from ${this.ip} to ${ip} for ${this.id}`)
        }
        this.ip = ip
        this.heartbeat_cnt = MaxHeartbeatCnt
    }
    checkHealth(){ // check every 3 second
        if(this.ip!==null){
            var that = this;
            this.heartbeat_cnt --
            if(this.heartbeat_cnt<0){
                Log("removing", this.ip, "from", this.date, this.hashtag)
                this.ip = null
            }else{
                setTimeout(()=>{ this.checkHealth()}, 3000);
            }
        }
    }
    remove(ip){
        this.ip = null
    }
}

module.exports = Devices
