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

tte.controller('TravelCtrl', function($scope, $compile) {
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
		
		var stDate = new Date(stDate_ms);
		var endDate = new Date(endDate_ms);
		
		var one_day = 1000*60*60*24;
		var difference_ms = endDate_ms - stDate_ms;
		var stDate_notime_ms = stDate_notime.getTime();
		var stDateHours = stDate.getHours();
		var endDateHours = endDate.getHours();
		var tagGeldSatz = 2.2;
		var totalDays = Math.round(difference_ms/one_day)+1; //+1 Da am Tag des Reisebeginns auch schon Belege anfallen können.
		
		if (endDate.getMinutes() > 0) {
			endDateHours = endDateHours+1;
		};
		
		//Hier wird die Anfangsreihe eingefügt (der Header, welcher die Daten beschreibt)
		document.getElementById("tblDays").innerHTML = '<tr><td>Datum</td><td class="day">F</td><td class="day">M</td><td class="day">A</td><td class="day">N</td><td></td>'+
			'<td class="daypadding">Diäten</td><td class="daypadding">Spesen</td></tr>';
		
		var rowID = 1;
		var dietGesBetrag = 0;

		while (stDate_notime_ms < endDate_ms) {
			var dateVar = new Date(stDate_notime_ms);
			var dietBetrag = 0;
			
			if (dateVar.getDate() == stDate.getDate() && dateVar.getMonth() == stDate.getMonth()) {
				dietBetrag = (24-stDateHours);
				if (dietBetrag > 12) {
					dietBetrag = 12;
				};
				dietBetrag *= tagGeldSatz;
			} else if (dateVar.getDate() == endDate.getDate() && dateVar.getMonth() == endDate.getMonth()) {
				dietBetrag = endDateHours;
				if (dietBetrag > 12) {
					dietBetrag = 12;
				};
				dietBetrag *= tagGeldSatz;
			} else {
				dietBetrag = 26.4;
			};
			
			if (stDate.getDate() == endDate.getDate() && stDate.getMonth() == endDate.getMonth()) {
				dietBetrag = endDateHours-stDateHours;
				if (dietBetrag > 12) {
					dietBetrag = 12;
				};
				dietBetrag *= tagGeldSatz;
			};
			
			dietBetrag = Math.round((dietBetrag+0.00001)*100)/100;
			dietGesBetrag += dietBetrag;
			dietGesBetrag = Math.round((dietGesBetrag+0.00001)*100)/100;
			
			//Hier werden die Reihen in die Tabelle für die Tage eingefügt
			document.getElementById("tblDays").innerHTML += '<tr id="'+rowID+'"><td class="day">'+dateVar.getDate()+'.'+(dateVar.getMonth()+1)+'.</td>'+
				'<td class="day"><input type="checkbox" id="cbF'+rowID+'" ng-click="calcF('+rowID+')"></input></td>'+
				'<td class="day"><input type="checkbox" id="cbM'+rowID+'" ng-click="calcM('+rowID+')"></input></td>'+
				'<td class="day"><input type="checkbox" id="cbA'+rowID+'" ng-click="calcA('+rowID+')"></input></td>'+
				'<td class="day"><input type="checkbox" id="cbN'+rowID+'" ng-click="calcN('+rowID+')"></input></td>'+
				'<td><md-button id="btnBeleg'+rowID+'" ng-click="test('+rowID+')" class="md-primary md-raised">Beleg</md-button></td>'+
				'<td class="daypadding">'+dietBetrag+'</td>'+
				'<td class="daypadding">EUR</td></tr>';
			
			/*
				'<td>'+
				'<md-checkbox ng-model="cbF'+rowID+'" class="md-primary">Früh</md-checkbox>'+
				'<md-checkbox ng-model="cbM'+rowID+'" class="md-primary">Mittag</md-checkbox>'+
				'<md-checkbox ng-model="cbA'+rowID+'" class="md-primary">Abend</md-checkbox>'+
				'<md-checkbox ng-model="cbN'+rowID+'" class="md-primary">Nächtigung</md-checkbox>'+
				'<md-button ng-click="test()" class="md-primary">Beleg</md-button>'+
				'</td><td class="daypadding">'+dietBetrag+'</td><td class="daypadding">EUR</td></tr>';
			*/
			
			stDate_notime_ms += 86400000;
			rowID++;
		};
		
		//Schlusszeile von den Tagen
		document.getElementById("tblDays").innerHTML += '<tr style="border-top: 1px solid black;"><td colspan="6" style="text-align: right; padding-top: 10px;">SUMME</td>'+
			'<td class="daypadding" style="padding-top: 10px;">'+dietGesBetrag+'</td>'+
			'<td class="daypadding" style="padding-top: 10px;">EUR</td></tr>';
		$compile(document.getElementById('tblDays'))($scope);
		
		//Speichern in die DB
		dpd.reise.post({"start":stDate_ms,"end":endDate_ms,"location":location,"purpose":purpose,"name":name,"diets":dietGesBetrag,"expenses":0}, function(result, err) {
			if(err) return console.log(err);
			console.log(result, result.id);
		});
	};
	
	$scope.test = function(btnID) {
		//document.getElementById("btnBeleg"+btnID).innerHTML = "Works!";
		console.log("Button with the ID: 'btnBeleg"+btnID+"' was clicked!");
	};
	
	$scope.calcF = function(cbF_id) {
		if (document.getElementById("cbF"+cbF_id).checked)
			console.log("Checkbox with the ID: 'cbF"+cbF_id+"' was checked!");
		else
			console.log("Checkbox with the ID: 'cbF"+cbF_id+"' was unchecked!");
	};
	
	$scope.calcM = function(cbM_id) {
		if (document.getElementById("cbM"+cbM_id).checked)
			console.log("Checkbox with the ID: 'cbM"+cbM_id+"' was checked!");
		else
			console.log("Checkbox with the ID: 'cbM"+cbM_id+"' was unchecked!");
	};
	
	$scope.calcA = function(cbA_id) {
		if (document.getElementById("cbA"+cbA_id).checked)
			console.log("Checkbox with the ID: 'cbA"+cbA_id+"' was checked!");
		else
			console.log("Checkbox with the ID: 'cbA"+cbA_id+"' was unchecked!");
	};
	
	$scope.calcN = function(cbN_id) {
		if (document.getElementById("cbN"+cbN_id).checked)
			console.log("Checkbox with the ID: 'cbN"+cbN_id+"' was checked!");
		else
			console.log("Checkbox with the ID: 'cbN"+cbN_id+"' was unchecked!");
	};
});

tte.controller('TteCtrl', function($scope, $timeout, $mdSidenav) {
	$scope.toggleLeft = function() {
		$mdSidenav('left').toggle();
	};
});