var user = function(name, hours = []) {
	this.name = name;
	this.hours = hours;
	this.addAvail = function(hour) {
		hours.add(hour);
	}
}