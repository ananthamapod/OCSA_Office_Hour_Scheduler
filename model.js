var User = function(name, hours) {
	hours = (typeof hours === 'undefined') ? [] : hours;
	this.name = name;
	this.hours = hours;
}
User.prototype.addAvail = function(hour) {
	this.hours.add(hour);
};

var Match = function() {
	this.hours = [];
}
Match.prototype.clone = function() {
	var ret = new Match();
	ret.hours = this.hours.slice(0);
	return ret;
};
Match.prototype.addHour = function(hour, name) {
	this.hours[hour] = name;
};