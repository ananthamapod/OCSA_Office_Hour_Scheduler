// Main controller
app.controller('mainController', function ($scope) {
  $scope.days = [
    {'name': 'Monday',
     'short': 'M'},
    {'name': 'Tuesday',
     'short': 'T'},
    {'name': 'Wednesday',
     'short': 'W'},
    {'name': 'Thursday',
     'short': 'R'},
    {'name': 'Friday',
     'short': 'F'}
  ];
  $scope.hours = [
  	{"hour": '9:00 AM'},
  	{"hour": '10:00 AM'},
  	{"hour": '11:00 AM'},
  	{"hour": '12:00 PM'},
  	{"hour": '1:00 PM'},
  	{"hour": '2:00 PM'},
  	{"hour": '3:00 PM'},
  	{"hour": '4:00 PM'},
  	{"hour": '5:00 PM'},
  	{"hour": '6:00 PM'},
  	{"hour": '7:00 PM'}
  ];

  $scope.users = [];
  if(users) {
    $scope.users = users;
    $scope.users.forEach(function(elem, ind, array) {
      elem['editUsername'] = elem['username'];
      elem['editEmail'] = elem['email'];
      elem['editName'] = elem['name'];
    });
  }

  $scope.edit = function(index) {
    var parent = $(".user-card").eq(index);
    console.log(parent);
    parent.find(".noneditable").hide();
    parent.find(".display").hide();
    parent.find(".edit").show();
  }

  $scope.save = function(index) {
    var current = users[index];
    if(current['username'] === current['editUsername'] && current['name'] === current['editName'] && current['email'] === current['editEmail']) {

    } else {
      var validChange = true;
      for(user of $scope.users) {
        if(current['editUsername'] === user.username) {
          if(user !== current) {
            validChange = false;
            break;
          }
        }
      }
      console.log(current['username']);
      console.log(current['editUsername']);
      if(validChange) {
        //POST request here
        $.post( '/editUser', {"oldUsername" : current['username'], "username" : current['editUsername'], "name" : current['editName'], "email" : current['editEmail'], "hours" : current['hours']}, function(msg) {
          console.log(msg);
          var message = $('#message');
          if(msg.indexOf("error") > -1) {
            //if the message is about an error
            message.removeClass('alert-success').addClass('alert-danger');
          } else {
            //successful save
            message.removeClass('alert-danger').addClass('alert-success');
          }
          message.show();
          message.html(msg);
        });

        current['username'] = current['editUsername'];
        current['name'] = current['editName'];
        current['email'] = current['editEmail'];
      } else {
        var message = $('#message');
        message.removeClass('alert-success').addClass('alert-danger');
        message.show();
        message.html("<strong>Edit failed!</strong> A user with that netid already exists!");
      }
    }

    $scope.finishEdit(index);
  }

  $scope.cancel = function(index) {
    var current = users[index];
    current['editUsername'] = current['username'];
    current['editName'] = current['name'];
    current['editEmail'] = current['email'];

    $scope.finishEdit(index);
  }

  $scope.deleteUser = function(index) {
    console.log("called delete");
    var current = users[index];

    //POST request here
    $.post( '/deleteUser', {"username" : current['username']}, function(msg) {
      console.log(msg);
      var message = $('#message');
      if(msg.indexOf("error") > -1) {
        //if the message is about an error
        message.removeClass('alert-success').addClass('alert-danger');
      } else {
        //successful save
        message.removeClass('alert-danger').addClass('alert-success');
        //set availability data to the newly saved availability
        console.log("add user to ng-model");
        $scope.users.splice(index, 1);
        $scope.$apply();
      }
      message.show();
      message.html(msg);
    });
  }

  $scope.finishEdit = function(index) {
    var parent = $(".user-card").eq(index);
    console.log(parent);
    parent.find(".noneditable").show();
    parent.find(".display").show();
    parent.find(".edit").hide();
  }

  $scope.tryAddUser = function() {
    console.log("try adding users");
    var parentDiv = $('[id="tryAddUser"]').parent();
    parentDiv.toggleClass("morph-enabled");
    var from = parentDiv.find(".morphFrom");
    var to = parentDiv.find(".morphTo");
    if(to.css("display") === "none") {
      from.css("display", "none");
      to.fadeIn();
      to.find("input").val("");
    }
  }

  $scope.addUser = function(username, name, email) {
  	console.log("Username : " + username);
    var newUsername = true;
    if(username == undefined || username === "admin") {
      newUsername = false;
    }
    for(user of $scope.users) {
      if(username === user.username) {
        newUsername = false;
        break;
      }
    }

    if(newUsername) {
      if(email == undefined) {
        email = "";
      }
      //POST request here
      $.post( '/addUser', {"username" : username, "name" : name, "email" : email}, function(msg) {
        console.log(msg);
        var message = $('#message');
        if(msg.indexOf("error") > -1) {
          //if the message is about an error
          message.removeClass('alert-success').addClass('alert-danger');
        } else {
          //successful save
          message.removeClass('alert-danger').addClass('alert-success');
          //set availability data to the newly saved availability
          console.log("add user to ng-model");
          $scope.users.push({"username" : username, "name": name, "email" : email, "editUsername" : username, "editName": name, "Editemail" : email, "hours" : []});
          $scope.$apply();
        }
        message.show();
        message.html(msg);
      });

      var parentDiv = $('[id="tryAddUser"]').parent();
      parentDiv.toggleClass("morph-enabled");
      var from = parentDiv.find(".morphFrom");
      var to = parentDiv.find(".morphTo");
      if(from.css("display") === "none") {
        to.css("display", "none");
        from.fadeIn();
        $scope.username = "";
      }
    }
  }

  $scope.changePassword = function(oldPass, newPass1, newPass2) {
    console.log("change password called");
    if(oldPass === undefined) {
      oldPass = "";
    }
    if(newPass1 === undefined) {
      newPass1 = "";
    }
    if(newPass2 === undefined) {
      newPass2 = "";
    }
    var message = $('#message');
    if(newPass1 == newPass2) {
      console.log("passwords match");
      $.post( '/changePassword', {"oldPassword" : oldPass, "newPass1" : newPass1, "newPass2" : newPass2}, function(msg) {
        console.log(msg);
        if(msg.indexOf("error") > -1) {
          //if the message is about an error
          message.removeClass('alert-success').addClass('alert-danger');
        } else {
          //successful save
          message.removeClass('alert-danger').addClass('alert-success');
        }
        message.show();
        message.html(msg);
      });
    } else {
      message.removeClass('alert-success').addClass('alert-danger');
      message.show();
      message.html("Passwords do not match.");
    }
  }

  $scope.schedule = function() {
    $.get('/crunchwrap', function(response) {
      if(response) {
        console.log(response);
        $scope.schedules = response.matches;
        $scope.$apply();
        console.log($scope.schedules);
      }
    });
  }

  $scope.getName = function(day, hour) {
    return day + hour.slice(0,hour.indexOf(':'));
  }
});
