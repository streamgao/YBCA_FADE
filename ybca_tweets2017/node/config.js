var Config={
	DEBUG: false,
	NumDays : 10,
	HashtagPerDay : 10,
	OffsetHour: 0, //default to 0, -5: midnight => 7pm
	MonitHeart: true, //heart monitor play through
	FrameDelta: 100 // for label stream, time delay between ticks
}

module.exports = Config