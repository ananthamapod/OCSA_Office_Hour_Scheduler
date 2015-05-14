// Create a new module
var scheduleApp = angular.module('scheduleApp', []);

// register a new service
scheduleApp.value('appName', 'Scheduler');

// configure existing services inside initialization blocks.
scheduleApp.config(['$locationProvider', function($locationProvider) {
  // Configure existing providers
	$locationProvider.hashPrefix('!');
}]);

scheduleApp.controller('mainController', function ($scope) {
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
  $scope.reset = function() {
  	$('ul.time input').prop("checked", "");
  }
  $scope.save = function() {
    var avails = [];
    $('.time-slot input:checked').each(function() {
      avails.push($(this).attr('name'));
    });
    avails = {"hours" : avails};
    $.get( '/saveSchedule', avails, function(msg) {
      console.log(msg);
      var message = $('#message');
      if(msg.indexOf("error") > -1) {
        message.removeClass('alert-success').addClass('alert-danger');
      } else {
        message.removeClass('alert-danger').addClass('alert-success');
      }
      message.show();
      message.html(msg);
    });
  }
});