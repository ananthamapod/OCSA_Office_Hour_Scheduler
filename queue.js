/**Custom implementation of a queue, uses an internal linkedlist
*/
var exports = module.exports = function() {
  this.size = 0;
  this.first = null;
  this.last = null;
}
/**enqueue function
throws Error if data is null
*/
exports.prototype.enqueue = function(data) {
  if(data === null) {
    throw new Error("Nothing to enqueue");
  }
  var node = new Node(data);
  if((this.first === null) || !(typeof this.first === "object")) {
    this.first = node;
    this.last = node;
  } else {
    this.last.next = node;

    this.last = node;
  }
  this.size++;
};
/**dequeue function
throws Error if queue is already empty
*/
exports.prototype.dequeue = function() {
  if((!this.first === null) || !(typeof this.first === "object")) {
    throw new Error("Nothing to dequeue");
  } else {
    var node = this.first;
    if(this.last === node) {
      this.last = null;
      this.first = null;
    } else {
      this.first = this.first.next;
    }
    this.size--;
    return node.data;
  }
};