// Create a new module
var app = angular.module('adminApp', []);

// Register a new service
app.value('appName', 'Scheduler');

// configure existing services inside initialization blocks.
app.config(['$locationProvider', function($locationProvider) {
  // Configure existing providers
	$locationProvider.hashPrefix('!');
}]);

