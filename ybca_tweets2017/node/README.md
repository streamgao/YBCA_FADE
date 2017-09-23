#Field of nodeMCU playing back recorded tweets from the past.

##Supported modes:
1. Tweet hashtag playing back
controller.startTweet(100) 100 is 100ms step size
controller.stopTweet()

2. Heart Monitor signal play through
Config.MonitHeart = true

3. Generic patterns
controller.startRegular(options)
controller.stopRegular()
default_option={
    duration: 1000,
    sequential: false,
    sequential_delta: 10,
    randomize: false,
    randomize_range: 400,
    drift: false,
    drift_delta: 10,
}

To run, install jupyter and nodejs support
npm install
install ijavascript (https://github.com/n-riesco/ijavascript)
ijs
or
jupyter notebook
start "election server.ipynb"



## 1/8/17
YBCA show on 2/18/2017
Filtered top labels from election related tweets from 10/1/16 to 11/30/16. Playback in 1 hour. (1 hour => 2.4sec)
100 mention / sec => 1 click / sec
10,000 mention / sec => 10 click / sec
1 mintion /sec => 0.1 click /sec, which is also the minimum frequency



