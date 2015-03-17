var tte = angular.module('trackTravel', ['ngMaterial', 'ngMdIcons']);
//Globale Variablen
var name = "";
var dateToday = new Date();
var dateToday_ms = dateToday.getTime();
var dateTodayYear = dateToday.getFullYear();
var dateTodayMonth = dateToday.getMonth();
var dateTodayDate = dateToday.getDate();
var dateTodayHours = dateToday.getHours();
var dateTodayMinutes = dateToday.getMinutes();

tte.controller('TteCtrl', function($scope) {
	$scope.data = {
      selectedIndex : 0
    };
    $scope.next = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
    };
    $scope.previous = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };
});

tte.controller('UserCtrl', function($timeout, $scope, $http) {
	$scope.loadUsers = function() {
		// Use timeout to simulate a request.
		$scope.users = [];
		return $timeout(function() {
			$http.get('/users')
			.success(function(users) {
				$scope.loaded = true;
				$scope.users = users;
				})
			.error(function(err) {
				alert(err);
			});
		}, 0); //No Timeout = 0
	};
	
	$scope.changedValue = function(user) {
		name = user.name;
	};
});

tte.controller('TravelCtrl', function($scope) {
	var fillStartDate = new Date(dateTodayYear, dateTodayMonth, dateTodayDate, 0, 0, 0, 0);
	var fillStartTime = new Date(1970, 0, 1, dateTodayHours, dateTodayMinutes, 0, 0); //1970.Jan.1 ist der Nullpunkt beim Datum
	$scope.startDate = fillStartDate;
	$scope.startTime = fillStartTime;
	
	$scope.saveTravel = function() {
		var stDate_notime = $scope.startDate;
		var stTime = $scope.startTime;
		var endDate_notime = $scope.endDate;
		var endTime = $scope.endTime;
		var location = $scope.location;
		var purpose = $scope.txtpurpose;
		
		var timezone_ms = stTime.getTimezoneOffset()*60*1000*-1; //Bei GMT+1 = "-60"
		
		var stDate_ms = stDate_notime.getTime() + stTime.getTime() + timezone_ms; //in Millisekunden: Datum ohne Zeit + Zeit + Zeitzone
		var endDate_ms = endDate_notime.getTime() + endTime.getTime() + timezone_ms;
		
		var stDate = new Date(stDate_ms); //Wird derzeit nicht benutzt
		var endDate = new Date(endDate_ms); // wird derzeit nicht benutzt
		
		console.log(stDate_ms);
		console.log(endDate_ms);
		console.log(stTime.getTime());
		console.log("Hi!");
		
		/*dpd.reise.post({"start":stDate_ms,"end":endDate_ms,"location":location,"purpose":purpose,"name":name,"diets":0,"expenses":0}, function(result, err) {
			if(err) return console.log(err);
			console.log(result, result.id);
		});*/
	};
});

tte.controller('TteCtrl', function($scope, $timeout, $mdSidenav, $log) {
	$scope.toggleLeft = function() {
		$mdSidenav('left').toggle()
						.then(function(){
							$log.debug("toggle left is done");
						});
	};
});

tte.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function() {
		$mdSidenav('left').close()
						.then(function(){
							$log.debug("close LEFT is done");
						});
	};
});