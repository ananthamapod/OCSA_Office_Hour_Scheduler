app.directive("schedule", ['$timeout', function($timeout) {
	return {
		restrict: "E",
		scope: {
			schedule: "=",
			days: "=",
			hours: "="
		},
		templateUrl: "js/directives/scheduleDirective.html"
	};
}]);