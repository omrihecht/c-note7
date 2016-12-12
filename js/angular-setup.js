var note7 = angular.module( 'note7' , ['ngRoute' , 'note7Directives'] );

note7.config(function ( $routeProvider ) {
	$routeProvider
		.when('/home',{
			controller: 'Home',
			templateUrl: function(){
				return 'partials/home.html'
			}
		})
		.when('/game',{
			controller: 'Game',
			templateUrl: function(){
				return 'partials/game.html'
			}
		})
		.otherwise({ redirectTo: '/home' });
});


note7.factory( 'factory' , ['$http', function ( $http ){
	var factoryObj = {};

	factoryObj.sendUser = function( user ){
		return $http({
			method:'POST',
			url:urlBaseServer + 'sendUser',
			data:$.param(user),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	factoryObj.getFirstDistances = function( cur_pos ){
		return $http({
			method:'POST',
			url:urlBaseServer + 'getFirstDistances',
			data:$.param(cur_pos),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	factoryObj.getDistances = function( cur_pos ){
		return $http({
			method:'POST',
			url:urlBaseServer + 'getDistancesNew',
			data:$.param(cur_pos),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	factoryObj.sendGamePhone = function( phone_params ){
		return $http({
			method:'POST',
			url:urlBaseServer + 'sendGamePhone',
			data:$.param(phone_params),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	factoryObj.sendGamePause = function( cur_pos ){
		return $http({
			method:'POST',
			url:urlBaseServer + 'sendGamePause',
			data:$.param(cur_pos),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	factoryObj.quitGame = function( game_guid ){
		return $http({
			method:'POST',
			async: false,
			params:{ 'game_guid' : game_guid },
			url:urlBaseServer + 'sendGameEnd',
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	factoryObj.getTopScores = function(){
		return $http.get(urlBaseServer + 'getTopScores');
	}

	factoryObj.loadInfo = function(){
		return $http.get('json/info.json' );
	}

	return factoryObj;

}]);

note7.service( 'service' , function(){

	var userObj = { 'fullName' : 'test' , 'phone' : '0544444444' , 'email' : 'test' + Math.round( Math.random()*100000 ) + '@test.com' };
	//var userObj = { 'fullName' : '' , 'phone' : '' , 'email' : '' };
	var startPointObj = {
		'latLng' : new google.maps.LatLng( 32.0633986234945 , 34.77305571765646 ),
    'panoID' : 'nhGz9dQHU2p7kwxEalc0rg',
    'pov' : { 'pitch' : 5 , 'heading' : 235 }
	};

	var setUserObj = function( _userObj ){
		userObj = _userObj;
	}

	var getUserObj = function(){
		return userObj;
	}

	var setStartPointObj = function( _startPointObj ){
		startPointObj = _startPointObj;
	}

	var getStartPointObj = function(){
		return startPointObj;
	}

	return {
		setUserObj				:	setUserObj,
		getUserObj				: getUserObj,
		setStartPointObj	: setStartPointObj,
		getStartPointObj	: getStartPointObj
	};

});
