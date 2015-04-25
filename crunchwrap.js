/**Generic node
*/
var Node = function(data) {
	this.data: data;
	this.prev: null;
	this.next: null;
}

/**Custom implementation of a queue, uses an internal linkedlist
*/
var Queue = function() {
	this.size: 0;
	this.first: null;
	this.last: null;
}
/**enqueue function
throws Error if data is null
*/
Queue.prototype.enqueue = function(data) {
	if(data === null) {
		throw new Error("Nothing to enqueue");
	}
	var node = new Node(data);
	if((!this.first === null) || !(typeof this.first === "object")) {
		this.first = node;
		this.last = node;
	} else {
		node.prev = this.last;
		this.last.next = node;

		this.last = node;
	}
	this.size++;
};
/**dequeue function
throws Error if queue is already empty
*/
Queue.prototype.dequeue = function() {
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

/**Just a quick function for computing a combination.
Takes in array of possibilities poss, number of elements to be chosen k.
Returns 2d array of combinations
*/
function combinations(poss, k) {
	if(!(typeof poss === "object") || !(typeof k === "number")) {
		return null;
	}
	var ret = [];
	var n = poss.length;
	for(var x = 0; x < n; x++) {
		for(var y = x + 1; y < n; y++) {
			for(var z = y + 1; z < n; z++) {
				ret.push([poss[x],poss[y],poss[z]]);
			}
		}
	}
	return ret;
}

/**Generates possible schedules given the availability of all the users.
Uses a bipartite graph algorithm.
*/
function generateMatches(users) {
	var hours = ["M9","M10","M11","M12","M1","M2","M3","M4","M5","M6","M7",
		"T9","T10","T11","T12","T1","T2","T3","T4","T5","T6","T7",
		"W9","W10","W11","W12","W1","W2","W3","W4","W5","W6","W7",
		"R9","R10","R11","R12","R1","R2","R3","R4","R5","R6","R7",
		"F9","F10","F11","F12","F1","F2","F3","F4"
	];

	//Minimum number of hours to be served by each officer
	var N = Math.floor(users.length/hours.length);

	/**Sorts list of people in order of how much availability, starting from most available.
	Sorting by availability and using the lowest availability each iteration of the algorithm 
	ensures that there aren't unnecessarily many combinations of matches.
	*/
	users.sort(function(arg1, arg2) {
		return arg2.hours.length - arg1.hours.length;
	});

	var A = [];
	var B = [];
	for(var i = 0; i < users.length; i++) {
		A[i] = users[i];
	}

	var matches = new Queue();
	matches.enqueue(new Match());

	//While there are still people to be matched, loop!
	while(A.length != 0) {
		
		//Gets the person with the lowest availability among those to be matched.
		var p = A.pop();
		
		//Number of matches formed from having a schedule with B.length many people
		var k = matches.length;

		//Dequeue each of the matches from the previous iteration and try adding another person
		while(k > 0) {
			var oldM = matches.dequeue();
			
			//Create a shallow copy of the availability so can manipulate without affected user objects
			var availHours = p.hours.slice(0);

			//Remove all available hours from copy that have already been assigned in match oldM
			for(hour in Object.keys(oldM.hours)) {
				var index = availHours.indexOf(hour);
				if(index > -1) {
					availHours.splice(index, 1);
				}
			}
			if(availHours.length < N) {
				continue;
			}
			var possibilities = combinations(availHours, N);
			for(possibility in possibilities) {
				var newM = oldM.clone();
			}
		}

		B.push(p);
	}
}

function pullDownFromDB(user, pass) {
	if(user === "admin") {
		db.collection('users', function(err, collection) {
			collection.find();
		});
	}
}