var exports = module.exports = function() {
  this.hours = {};
}

exports.prototype.clone = function() {
  var ret = new exports();

  for (var attr in this.hours) {
      if (this.hours.hasOwnProperty(attr)) {
        ret.hours[attr] = this.hours[attr];
      }
    }

  return ret;
};

exports.prototype.addHour = function(hour, name) {
  this.hours[hour] = name;
};
