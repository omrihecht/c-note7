note7Directives = angular.module('note7Directives' , [] );

note7Directives.directive( 'gglMap' , function( $timeout ){
  return{
    restrict: 'E',
    templateUrl: 'partials/map.html',
    replace: false,
    scope: {
      mapOptions     : '@mapOptions',
      panoOptions    : '@panoOptions',
      startPosition  : '@startPosition',
      markerData     : '@markerData',
      panoPosChange  : '&panoPosition',
      panoPovChange  : '&panoPov',
      markerClick    : '&markerElem'
    },

    link: function(scope, element, attributes){

      //debugger

      var markers = [];

      var mapOptions = JSON.parse( scope.mapOptions );
      var map = new google.maps.Map(document.getElementById(attributes.mapId) , mapOptions);
      map.setCenter( JSON.parse( scope.startPosition ).latLng );

      var panoOptions = JSON.parse( scope.panoOptions );

      var panorama = new google.maps.StreetViewPanorama( document.getElementById(attributes.mapId) , panoOptions );
      //panorama.setPosition( JSON.parse( scope.startPosition ) );
      panorama.setPano( JSON.parse( scope.startPosition ).panoID );
      panorama.setPov( JSON.parse( scope.startPosition ).pov );
      map.setStreetView(panorama);

      $timeout(function(){
        scope.panoPosition = {
          'panoID' : panorama.getPano(),
          'latLng' : new google.maps.LatLng( panorama.getLocation().latLng.lat() , panorama.getLocation().latLng.lng() ),
          'pov' : { 'heading' : panorama.getPov().heading , 'pitch' : panorama.getPov().pitch }
        }
      },1000);

      scope.$watch( 'markerData', function(){

        markerData = JSON.parse( scope.markerData );

        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        markers = [];

        for( var i=0; i< markerData.markers.length; i++ ){
          var marker = new google.maps.Marker({
            position: markerData.markers[i].latLng,
            map: panorama,
            icon: markerData.markers[i].markerImage,
            shape: markerData.markerShape,
            animation: google.maps.Animation.DROP
          });
          marker.addListener('click',function( e ){
            $timeout(function(){ scope.markerElem = e; });
          })
          markers.push(marker);
          marker.setMap(panorama);
        }

      });

      scope.$watch('markerElem', function(value) {
        scope.markerClick({ arg : value });
      });

      scope.$watch('panoPosition', function(value) {
        scope.panoPosChange({ arg : value });
      });

      scope.$watch('panoPov', function(value) {
        scope.panoPovChange({ arg : value });
      });

      scope.toggleMap = function(){
        if (panorama.getVisible() == false) {
          panorama.setVisible(true);
        } else {
          panorama.setVisible(false);
        }
      }

      panorama.addListener('pano_changed', function() {
        //console.log('pano change');
        map.setCenter( { lat:panorama.getLocation().latLng.lat() , lng:panorama.getLocation().latLng.lng() } );

        $timeout(function(){
          scope.panoPosition = {
            'panoID' : panorama.getPano(),
            'latLng' : new google.maps.LatLng( panorama.getLocation().latLng.lat() , panorama.getLocation().latLng.lng() ),
            'pov' : { 'heading' : panorama.getPov().heading , 'pitch' : panorama.getPov().pitch }
          }
        });
      });

      panorama.addListener('links_changed', function() {
        //console.log('links change');
      });

      panorama.addListener('position_changed', function() {
        //console.log('position change');
      });

      panorama.addListener('pov_changed', function() {
        //console.log('pov change');
        $timeout(function(){
          scope.panoPov = {
            'panoID' : panorama.getPano(),
            'latLng' : new google.maps.LatLng( panorama.getLocation().latLng.lat() , panorama.getLocation().latLng.lng() ),
            'pov' : { 'heading' : panorama.getPov().heading , 'pitch' : panorama.getPov().pitch }
          }
        });
      });

    }// end link


  };
});


note7Directives.directive('imageonload', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('load', function() {
				$.event.trigger({
					type : 'imageLoaded'
				});
			});
			element.bind('error', function(){
				alert('image could not be loaded');
			});
		}
	};
});


note7Directives.directive('stopwatch', function( $interval ) { return {
  restrict: 'AE',
  templateUrl: 'partials/stopwatch.html',
  scope: {
    stopWatchPlay : '@stopWatchPlay',
    startTimeMs   : '@startTimeMs',
    currentTime   : '=time',
    timeMsUpdate  : '&timeMs'
  },

  link: function(scope, element, attrs, ctrl ) {

    scope.$watch( 'startTimeMs' , function( value ){
      ctrl.setElapsedTime( value );
    });

    scope.$watch( 'stopWatchPlay' , function( value ){
      //debugger
      if( value === 'true' ){
        ctrl.start();
      }else{
        ctrl.stop();
        scope.timeMS = ctrl.getTimeMS();
        //scope.getCurrentTime({ arg : value });
      }
    });

    scope.$watch( 'timeMS' , function( value ){
      scope.timeMsUpdate({ arg : value });
    });

  },

  controllerAs: 'swctrl',
  controller: function($scope, $interval) {
    console.log("Creating the directive's controller");
    var self = this;
    var totalElapsedMs = 0;
    var elapsedMs = 0;
    //var time;
    var startTime;
    var timerPromise;

    self.setElapsedTime = function( val ){
      totalElapsedMs = parseFloat(val);
    }

    self.start = function() {
      if (!timerPromise) {
        startTime = new Date();
        timerPromise = $interval(function() {
          var now = new Date();
          //$scope.time = now;
          elapsedMs = now.getTime() - startTime.getTime();
        }, 31);
      }
    };

    self.stop = function() {
      if (timerPromise) {
        $interval.cancel(timerPromise);
        timerPromise = undefined;
        totalElapsedMs += elapsedMs;
        elapsedMs = 0;
      }
    };

    self.reset = function() {
      startTime = new Date();
      totalElapsedMs = elapsedMs = 0;
    };

    self.getTime = function() {
      return time;
    };

    self.getTimeMS = function(){
      return totalElapsedMs + elapsedMs;
    }

    self.getElapsedMs = function() {
      //return totalElapsedMs + elapsedMs;
      var tempTime = totalElapsedMs + elapsedMs;
      var milliseconds = tempTime % 1000;
      tempTime = Math.floor(tempTime / 1000);
      var seconds = ( (tempTime % 60) < 10 ) ? '0' + tempTime % 60 : tempTime % 60;
      tempTime = Math.floor(tempTime / 60);
      var minutes = ( (tempTime % 60) < 10 ) ? '0' + tempTime % 60 : tempTime % 60;
      tempTime = Math.floor(tempTime / 60);
      var hours = ( (tempTime % 60) < 10 ) ? '0' + tempTime % 60 : tempTime % 60;

      return hours + " : " + minutes + " : " + seconds;
    };
  }
}});
