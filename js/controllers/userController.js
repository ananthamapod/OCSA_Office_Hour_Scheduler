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
  $scope.data = [];
  if(data) {
    data.forEach(function(element, index, array) {
      element = massageHours(element);
      $scope.data.push(element);
    });
  }

  $scope.reset = function() {
    console.log("reset called");
    this.clear();
    var data = this.data;
    for(var element of data) {
      var elemNode = $('.time-slot input[name=\"' + element + '\"]');
      elemNode.prop("checked", true);
    }
  }
  $scope.clear = function() {
  	$('ul.time input').prop("checked", false);
  }
  $scope.save = function() {
    //avails: an array of available hours submitted
    var avails = [];
    //put all currently selected hours in avails
    $('.time-slot input:checked').each(function() {
      avails.push($(this).attr('name'));
    });
    //make it into an object for sending as post data
    avails = {"numHours" : avails.length, "hours" : avails};
    //post request to backend
    $.post( '/saveSchedule', avails, function(msg) {
      console.log(msg);
      var message = $('#message');
      if(msg.indexOf("error") > -1) {
        //if the message is about an error
        message.removeClass('alert-success').addClass('alert-danger');
      } else {
        //successful save
        message.removeClass('alert-danger').addClass('alert-success');
        //set availability data to the newly saved availability
        $scope.data = avails['hours'];
      }
      message.show();
      message.html(msg);
    });
  }
});