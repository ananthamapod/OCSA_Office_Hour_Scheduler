// Create a new module
var scheduleApp = angular.module('adminApp', []);

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
});