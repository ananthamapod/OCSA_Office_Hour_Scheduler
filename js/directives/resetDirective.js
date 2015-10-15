app.directive("mainDirective", ['$timeout', function($timeout) {
    //for loading the schedule when the page first loads
    //done as the directive with $timeout so that scope.reset is only called when compiling and rendering are finished
    return {
      restrict: "EA",
      scope: false,
      link: function(scope,elem,attr) {
        $timeout(function() {scope.reset()});
      }
    };
}]);