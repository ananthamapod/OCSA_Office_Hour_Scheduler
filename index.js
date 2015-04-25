var app = require('express')();
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
 
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
app.get('/', checkLogin, function(req, res) {
    if (req.currentUser) {
    // logged in
    res.sendFile(__dirname + '/index.html');
  } else {
    // logged out
    res.sendFile(__dirname + '/login.html');
  }
});


//--------------User Authentication---------------------------//
function checkLogin(req, res, next) {
    if (req.query['netid']) {
      console.log("found netid");
      MongoClient.connect(url, function(err, db) {
        db.collection('users', function (err, collection) {
            if (err) return next(err); // handle errors!
            collection.findOne({
                _id: req.query['netid']
            }, function (err, user) {
                if (user) {
                    req.currentUser = user;
                } else {
                    req.currentUser = null;
                }
                next();
            });
        });
      });
    } else if(req.session.netid) {
        db.collection('users', function (err, collection) {
            if (err) return next(err); // handle errors!
            collection.findOne({
                _id: req.session.user_id
              },
              function (err, user) {
                if (user) {
                    req.currentUser = user;
                } else {
                    req.currentUser = null;
                }
                next();
              });
        });
    } else {
        req.currentUser = null;
        next();
    }
}
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

app.get('/ang-app.js', function(req, res) {
  res.sendFile(__dirname + '/ang-app.js');
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