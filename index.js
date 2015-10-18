//-------------------------Model-----------------------------//
/*var User = function(name, hours) {
  hours = (typeof hours === 'undefined') ? [] : hours;
  this.name = name;
  this.hours = hours;
}
User.prototype.addAvail = function(hour) {
  this.hours.add(hour);
};

var Match = function() {
  this.hours = {};
}
Match.prototype.clone = function() {
  var ret = new Match();

  for (var attr in this.hours) {
      if (this.hours.hasOwnProperty(attr)) {
        ret.hours[attr] = this.hours[attr];
      }
    }

  return ret;
};
Match.prototype.addHour = function(hour, name) {
  this.hours[hour] = name;
};
*/
var User = require('./user');
var Match = require('./match');
var Queue = require('./queue');
var combinations = require('./NCombinatoR/node/NCombinatoR');

//-----------------------------------------------------------//

/**Generates possible schedules given the availability of all the users.
Uses a bipartite graph algorithm.
*/
function generateMatches(users) {
  var hours = ["M9","M10","M11","M12","M1","M2","M3","M4","M5","M6","M7",
    "T9","T10","T11","T12","T1","T2","T3","T4","T5","T6","T7",
    "W9","W10","W11","W12","W1","W2","W3","W4","W5","W6","W7",
    "R9","R10","R11","R12","R1","R2","R3","R4","R5","R6","R7",
    "F10","F11","F12","F1","F2","F3","F4"
  ];

  //Minimum number of hours to be served by each officer
  var N = Math.floor(hours.length/users.length);

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
    var k = matches.size;

    //Dequeue each of the matches from the previous iteration and try adding another person
    while(k > 0) {
      var oldM = matches.dequeue();

      //Create a shallow copy of the availability so can manipulate without affected user objects
      var availHours = p.hours.slice(0);

      //Remove all available hours from copy that have already been assigned in match oldM
      for(hour in Object.keys(oldM.hours)) {
        var index = availHours.indexOf(hour);
        if(index > -1) {
          availHours = availHours.splice(index, 1);
        }
      }


      if(availHours.length < N) {
        continue;
      }

      var possibilities = combinations(availHours.length, N, availHours);
      console.log(possibilities);
      possibilities = possibilities.data;

      possibility = possibilities[0];
      var newM = oldM.clone();

      for(var i = 0; i < 3; i++) {
        newM.addHour(possibility[i], p.name);
      }

      matches.enqueue(newM);

      k--;
    }

    if(matches.length == 0) {
      return [];
    }
    B.push(p);
  }
  return matches;
}

//-----------------------------------------------------------//

//express and initializing the app
var express = require('express');
var app = express();

//file system module for extracting secure certificate credentials
var fs = require('fs');
//reading credentials into variables
var privateKey  = fs.readFileSync('sslcert/domain.key', 'utf8');
var certificate = fs.readFileSync('sslcert/domain.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

//session and body-parser for data persistence and post requests
var session = require('express-session');
var bodyParser = require('body-parser');

//https protocol
var https = require('https').Server(credentials, app);

//mongoclient for db interactions
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

//using EJS as template engine
var engine = require('ejs-locals');

//crunchwrap - where the scheduling magic happens
var scheduler = require('./crunchwrap');

//adding support for post requests with body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Setting app's template engine to ejs
app.engine('ejs', engine);
app.set('view engine', 'ejs');


//Start session
app.use(session({secret: 'ssshhhhh'}));
console.log("Session started");

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

//---------------------Main Routes----------------------------//
app.get('/', function(req, res) {
  console.log("gets to main route with get request");
  if(req.session) {
    if(req.session.netid) {
      if(req.session.netid === "admin") {
        //admin logged in
        console.log("Session Netid:" + req.session.netid);
        adminLoad(req, res);
      } else {
        // general user logged in
        loadSchedule(req, res);
      }
    } else {
      res.render('login',{});
    }
  }
  else {
    // logged out
    res.render('login',{});
  }
});

app.post('/', checkLogin, function(req, res) {
  if (res.currentUser) {
    console.log("last callback in main route with post request");
    res.redirect('/');
  } else {
    // logged out
    res.redirect('/');
  }
});

app.get('/logout', logout, function(req, res) {
  // logged out
  res.redirect('/');
});


//-------------User Authentication & Login--------------------//
function login(id, password, req, res, next) {
  MongoClient.connect(url, function(err, db) {
    db.collection('users', function (err, collection) {
        if (err) return next(err); // handle errors!
        collection.findOne({
            "netid": id,
            "password": password
        }, function (err, user) {
            if(err) {
              console.log("Error");
              console.log(err);
            }
            //console.log(user);
            if (user) {
                res.currentUser = user;
                //console.log(req.session);
                req.session.netid = id;
            } else {
                res.currentUser = null;
            }
            db.close();
            next();
        });
    });
  });
}

function checkLogin(req, res, next) {
  console.log("gets to checkLogin");
  console.log(req.body);
  if ((typeof req.body.netid !== 'undefined') && (typeof req.body.password !== 'undefined')) {
    console.log("found netid");
    console.log(req.body.netid);
    login(req.body.netid, req.body.password, req, res, next);
  } else if(req.session.netid) {
    login(req.session.netid, req, res, next);
  } else {
      req.currentUser = null;
      next();
  }
}
//------------------------------------------------------------//

//--------------------Logout & Kill Session-------------------//
function logout(req, res, next) {
  console.log("logout");
  if(req.session && req.session.netid) {
    req.session.destroy();
  }
  next();
}
//------------------------------------------------------------//

//------------------------Admin Load--------------------------//
function adminLoad(req, res) {
  MongoClient.connect(url, function(err, db) {
    if(err) {
      console.log(err);
      res.render('admin',{"error" : err, "userData" : undefined});
    }
    db.collection('users', function(err, collection) {
      if(err) {
        console.log("error");
        //console.log(err);
        res.render('admin',{"error" : err, "userData" : undefined});
      } else {
        collection.find({ "netid" : { $ne: "admin" } }, function(err, cursor) {
          cursor.toArray(function(err, items) {
            if(err) {
              console.log("error");
              //console.log(err);
              res.render('admin',{"error" : err, "userData" : undefined});
            } else {
              console.log(items);
              res.render('admin',{"error" : undefined, "userData" : items});
            }
            db.close();
          });
        });
      }
    });
  });
}
//------------------------------------------------------------//

//--------------------User Load and Save----------------------//
function loadSchedule(req, res) {
  if(req.session.netid) {
    MongoClient.connect(url, function(err, db) {
      db.collection('users', function (err, collection) {
          if (err)                 res.render('index',{'user' : req.session.netid, 'name' : "Name Unavailable", 'password' : "", 'data' : undefined}); // handle errors!
          collection.findOne({
              "netid": req.session.netid
          }, function (err, user) {
              console.log(user);
              if(err) {
                console.log(err);
                res.render('index',{'user' : req.session.netid, 'name' : "Name Unavailable", 'password' : "", 'data' : undefined});
              }
              else if (user) {
                console.log(user["hours"]);
                res.render('index',{'user' : req.session.netid, 'name' : user["name"], 'password' : user["password"], 'data' : user["hours"]});
              } else {
                res.render('index',{'user' : req.session.netid, 'name' : "Name Unavailable", 'password' : "", 'data' : undefined});
              }
              db.close();
          });
      });
    });
  } else {
    res.render('login',{});
  }
}

function saveSchedule(req, res, next) {
  if(req.session.netid && (typeof req.body.numHours !== 'undefined')) {
    var val = [];
    if(req.body.numHours > 0) {
      val = req.body.hours;
    }
    console.log(val);
    val.forEach(function(curr, ind, array) {
      curr = String(curr);
      curr = curr.slice(0, curr.indexOf(":"));
      val[ind] = curr;
      console.log(curr);
    });
    var query = {
      "$set" : {
        "hours" : val
      }
    };
    console.log(query);
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("<strong>Save failed!</strong> Looks like our database is held up. Try again.");
        return next(err); // handle errors!
      }
      var collection = db.collection('users');
      console.log(db);
      collection.update({ "netid" : req.session.netid }, query, function(err, count) {
        //console.log("Error" + err);
        //console.log("Count");
        //console.log(count.connection._events.error);
        db.close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("<strong>Save successful!</strong> Your office hours will be available shortly.");
        next();
      });
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("<strong>Save failed!</strong> Are you sure you are logged in?");
  }
}
//------------------------------------------------------------//

//-------------------Admin Interactions-----------------------//
function addUser(req, res, next) {
  if(req.session.netid === "admin" && req.body.username && req.body.username != "admin") {
    var query = { "netid" : req.body.username, "password" : "", "name" : req.body.name, "email" : (req.body.email? req.body.email: ""), "hours" : [] };
    console.log(query);
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("<strong>Save failed!</strong> Looks like our database is held up. Try again.");
        return next(err); // handle errors!
      }
      console.log(db);
      var collection = db.collection('users');
      console.log(db);
      collection.insert(query, function(err, count) {
        //console.log("Error" + err);
        //console.log("Count");
        //console.log(count.connection._events.error);
        db.close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("<strong>User Added!</strong>");
        next();
      });
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("<strong>Adding user failed!</strong> Are you the admin? Are you sure you are logged in?");
  }
}

function editUser(req, res, next) {
  if(req.session.netid && req.body.username && req.body.username != "admin") {
    var query = {
      "$set" : {
        "netid" : req.body.username,
        "name" : req.body.name,
        "email" : (req.body.email? req.body.email: ""),
      }
    };
    console.log(query);
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("<strong>Edit failed!</strong> Looks like our database is held up. Try again.");
        return next(err); // handle errors!
      }
      console.log(db);
      var collection = db.collection('users');
      console.log(db);
      collection.update({ "netid" : req.body.oldUsername }, query, function(err, count) {
        //console.log("Error" + err);
        //console.log("Count");
        //console.log(count.connection._events.error);
        db.close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("<strong>User Updated!</strong>");
        next();
      });
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("<strong>Editing user failed!</strong> Are you the admin? Are you sure you are logged in?");
  }
}

function deleteUser(req, res, next) {
  if(req.session.netid === "admin" && req.body.username) {
    var query = { "netid" : req.body.username};
    console.log(query);
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("<strong>Delete failed!</strong> Looks like our database is held up. Try again.");
        return next(err); // handle errors!
      }
      console.log(db);
      var collection = db.collection('users');
      console.log(db);
      collection.remove(query, function(err, count) {
        //console.log("Error" + err);
        //console.log("Count");
        //console.log(count.connection._events.error);
        db.close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("<strong>User Deleted!</strong>");
        next();
      });
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("<strong>Deleting user failed!</strong> Are you the admin? Are you sure you are logged in?");
  }
}

function crunchwrap(req, res, next) {
  console.log("Crunchwrap");
  if(req.session.netid === "admin") {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("<strong>Scheduling failed!</strong> Looks like our database is held up. Try again.");
        return next(err); // handle errors!
      }
      var collection = db.collection('users');
      collection.find({ "netid" : { $ne: "admin" } }, function(err, cursor) {
        cursor.toArray(function(err, items) {
          if(err) {
            console.log("error");
            //console.log(err);
            res.writeHead(501, { "Content-Type": "text/plain" });
            res.end("<strong>Scheduling failed!</strong> Looks like something went wrong. Try again.");
          } else {
            var users = [];
            items.forEach(function(elem, ind, array) {
              users.push(new User(elem['name'], elem['hours']));
            });
            var matches = generateMatches(users);
            var matchArray = [];

            while(matches.size > 0) {
              matchArray.push(matches.dequeue());
            }
            res.json({"matches" : matchArray});
          }
          db.close();
        });
      });
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("<strong>Deleting user failed!</strong> Are you the admin? Are you sure you are logged in?");
  }
}

function changePassword(req, res, next) {
  if(req.session.netid) {
    console.log(req.session.netid);
    console.log("old Password is " + req.body.oldPassword);
    console.log(req.body.newPass1);
    var query = {"netid" : req.session.netid, "password" : req.body.oldPassword};
    var updateQuery = {"$set" : {"password" : req.body.newPass1}};
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("<strong>Password change failed!</strong> Looks like our database is held up. Try again.");
        return next(err); // handle errors!
      }
      var collection = db.collection('users');
      collection.update(query, updateQuery, function(err, count) {
        var message = "";
        if(err) {
          message = "<strong>Password change failed!</strong> Are you the admin? Are you sure you are logged in?";
        } else {
          if(count !== 0) {
            message = "<strong>Password Changed!</strong>";
          } else {
            message = "<strong>Password change failed!</strong> Incorrect password. Please try again.";
          }
        }
        //console.log("Error" + err);
        //console.log("Count");
        //console.log(count.connection._events.error);
        db.close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(message);
        next();
      });
    });
  }
}
//------------------------------------------------------------//

//--------Routes for Manipulating Server/DB Data--------------//
app.post('/saveSchedule', saveSchedule);
app.post('/addUser', addUser);
app.post('/editUser', editUser);
app.post('/deleteUser', deleteUser);
app.post('/changePassword', changePassword);
app.get('/crunchwrap', crunchwrap);
//------------------------------------------------------------//

//--------------Routes for Resources--------------------------//

/* General Resources */
app.get('/style.css', function(req, res) {
	res.sendFile(__dirname + '/css/style.css');
});
app.get('/jquery.js', function(req, res) {
  res.sendFile(__dirname + '/js/jquery-1.11.3.min.js');
});
app.get('/bootstrap.min.css', function(req, res) {
	res.sendFile(__dirname + '/css/bootstrap.min.css');
});
app.get('/bootstrap.min.js', function(req, res) {
  res.sendFile(__dirname + '/js/bootstrap.min.js');
});
app.get('/grid.css', function(req, res) {
	res.sendFile(__dirname + '/css/grid.css');
});

/* Admin Angular Resources */
app.get('/ang-admin.js', function(req, res) {
  res.sendFile(__dirname + '/js/ang-admin.js');
});
app.get('/adminController.js', function(req, res) {
  res.sendFile(__dirname + '/js/controllers/adminController.js');
});
app.get('/scheduleDirective.js', function(req, res) {
  res.sendFile(__dirname + '/js/directives/scheduleDirective.js');
});
app.get('/js/directives/scheduleDirective.html', function(req, res) {
  res.sendFile(__dirname + '/js/directives/scheduleDirective.html');
});

/* User Angular Resources */
app.get('/ang-schedule.js', function(req, res) {
  res.sendFile(__dirname + '/js/ang-schedule.js');
});
app.get('/userController.js', function(req, res) {
  res.sendFile(__dirname + '/js/controllers/userController.js');
});
app.get('/resetDirective.js', function(req, res) {
  res.sendFile(__dirname + '/js/directives/resetDirective.js');
});

/* More General Resources */
app.get('/massageHours.js', function(req, res) {
  res.sendFile(__dirname + '/js/massageHours.js');
});
app.get('/angular/angular.min.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/angular/angular.min.js');
});

//-----------------------------------------------------------//


//---------------------------TESTS---------------------------//

app.get('/test1', function(req, res) {
  var testMatches = new Queue();
  for(var i = 1; i < 11; i++) {
    var newMatch = new Match();
    newMatch.addHour("T" + i, "1");
    testMatches.enqueue(newMatch);
  }
  console.log(testMatches);
  console.log(testMatches.first);
  console.log(testMatches.first.next);
  console.log(testMatches.last);
  res.json(testMatches);
});

//-----------------------------------------------------------//







//---------------------STARTING THE SERVER-------------------//

https.listen(3000, function() {
	console.log('listening on *:3000');
});

//-----------------------------------------------------------//
