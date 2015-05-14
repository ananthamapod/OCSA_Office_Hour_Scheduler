//-------------------------Model-----------------------------//
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
//-----------------------------------------------------------//

//-----------------------Crunchwrap--------------------------//
/**Generic node
*/
var Node = function(data) {
  this.data = data;
  this.prev = null;
  this.next = null;
}

/**Custom implementation of a queue, uses an internal linkedlist
*/
var Queue = function() {
  this.size = 0;
  this.first = null;
  this.last = null;
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

        for(var i = 0; i < 3; i++) {
          newM.addHour(possibility[i], p.name);
        }
        
        matches.enqueue(newM);
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
//-----------------------------------------------------------//

var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
//Start session
app.use(session({secret: 'ssshhhhh'}));

//----------Just testing the database connection--------------//
// Connection URL 
var url = 'mongodb://localhost:27017/OCSA_Hour_Scheduler';
// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
 
  db.close();
});

//------------------------------------------------------------//

//---------------------Main Route-----------------------------//
app.get('/', function(req, res) {
  // logged out
  res.sendFile(__dirname + '/login.html');
});

app.post('/', checkLogin, function(req, res) {
  if (req.currentUser) {
    if(req.session.netid === "admin") {
      //admin
      console.log("Session Netid:" + req.session.netid);
      res.sendFile(__dirname + '/admin.html');
    } else {
      // logged in
      res.sendFile(__dirname + '/index.html');
    }
  } else {
    // logged out
    res.sendFile(__dirname + '/login.html');
  }
});


//--------------User Authentication---------------------------//
function login(id, req, res, next) {
  MongoClient.connect(url, function(err, db) {
    db.collection('users', function (err, collection) {
        if (err) return next(err); // handle errors!
        collection.findOne({
            _id: id
        }, function (err, user) {
            if(err) {
              console.log(err);
            }
            console.log(user);
            if (user) {
                req.currentUser = user;
                req.session.netid = id;
            } else {
                req.currentUser = null;
            }
            db.close();
            next();
        });
    });
  });
}

function checkLogin(req, res, next) {
  console.log(req.body);
  if (req.body.netid) {
    console.log("found netid");
    console.log(req.body.netid);
    login(req.body.netid, req, res, next);
  } else if(req.session.netid) {
    login(req.session.netid, req, res, next);
  } else {
      req.currentUser = null;
      console.log(req.body);
      next();
  }
}
//------------------------------------------------------------//

//----------------------User Save-----------------------------//
function loadSchedule(req, res, next) {
  if(req.session.netid) {
    MongoClient.connect(url, function(err, db) {
      db.collection('users', function (err, collection) {
        if (err) {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Load failed. Looks like our database is held up. You can refresh to try again or give us your schedule manually. Sorry for the inconvenience!");
          return next(err); // handle errors!
        }
        console.log(query);
        collection.update({
          "_id" : req.session.netid
        }, query);
        db.close();
      });
    });
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Save successful! Your office hours will be available shortly.");
    next();
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Save failed. Are you sure you are logged in?");
}

function saveSchedule(req, res, next) {
  if(req.query.hours) {
    var val = req.query.hours;
    val.forEach(function(curr, ind, array) {
      curr = String(curr);
      curr = curr.slice(0, curr.indexOf(":"));
      val[ind] = curr;
      console.log(curr);
    });
    var query = { "hours" : val };
    console.log(query);
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("Save failed. Looks like our database is held up. Try again.");
        return next(err); // handle errors!
      }
      var collection = db.collection('users');
      collection.update({ "_id" : "Ananth" }, query, function(err, count) {
        console.log(err);
        console.dir(count);
        db.close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Save successful! Your office hours will be available shortly.");
        next();
      });
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Save failed. Are you sure you are logged in?");
  }
}
//------------------------------------------------------------//

//------------Routes for Getting Server Data------------------//
app.get('/saveSchedule', saveSchedule);
//------------------------------------------------------------//

//--------------Routes for Resources--------------------------//
app.get('/style.css', function(req, res) {
	res.sendFile(__dirname + '/style.css');
});
app.get('/bootstrap.min.css', function(req, res) {
	res.sendFile(__dirname + '/bootstrap.min.css');
});
app.get('/grid.css', function(req, res) {
	res.sendFile(__dirname + '/grid.css');
});

app.get('/ang-admin.js', function(req, res) {
  res.sendFile(__dirname + '/ang-admin.js');
});
app.get('/ang-schedule.js', function(req, res) {
  res.sendFile(__dirname + '/ang-schedule.js');
});
app.get('/node_modules/angular/angular.min.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/angular/angular.min.js');
});

//-----------------------------------------------------------//


//----Just for playing around with real-time interaction-----//
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});

//-----------------------------------------------------------//

