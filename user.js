var exports = module.exports = function(name, hours) {
  hours = (typeof hours === 'undefined') ? [] : hours;
  this.name = name;
  this.hours = hours;
}
exports.prototype.addAvail = function(hour) {
  this.hours.add(hour);
};