note7.controller( 'MainController' , function( $scope ){

  $scope.MainControllerObj = {};
  $scope.MainControllerObj.onHomePage = false;
  $scope.MainControllerObj.onGamePause = false;
  $scope.MainControllerObj.pauseGameTime = 0;

  note7Utils.preloadImages(['images/marker-icon.png', 'images/marker-icon-found.png']);

  $(document).bind('pageReady' , function(){
    $scope.isMobile = ( isMobile ) ? true : false;
  });

  $scope.shareTwitter = function(){
    console.log('share twitter');
  }

  $scope.shareFacebook = function(){
    console.log('share facebook');
  }

  $scope.resultsBtnClick = function(){
    console.log('open results');
    //location.href = "#/home/#leader-board";
    $(document).scrollTop( $('#leader-board').offset().top );
  }

  $scope.termsBtnClick = function(){
    console.log('open terms');
  }

  $scope.logoClick = function(){
    console.log('logo click');
  }

});

note7.controller( 'Home' , function( $scope , $timeout , factory , service , $sce ){

  $(window).unbind('unload');

  $scope.MainControllerObj.onHomePage = true;

  if( $scope.MainControllerObj.onGamePause ){
    $scope.onLoginForm = true;
  } else {
    $scope.onLoginForm = false;
    $scope.MainControllerObj.pauseGameTime = 0;
  }

  $scope.userData = service.getUserObj();

  $scope.$on('$viewContentLoaded', function(event) {
    $timeout(function(){
      note7Utils.setFormFields();
      setTopScores();
    })
  });

  $scope.loginBtnClick = function(){
    $scope.onLoginForm = true;
  }

  $scope.facebookLoginClick = function(){
    console.log('connect to facebook');
    $scope.sendingForm = true;
    $scope.loading_msg = 'מתחבר לפייסבוק';

    if( fb_connected ){
      $scope.userData.authResponse = fb_authResponse;
      console.log('Logged in.');
      FB.api('/me', {fields: 'name,id,first_name,last_name,email,gender,picture'}, function(response) {
        setFacebookData( response );
        /*FB.logout(function(response) {});*/
      });

    } else {

      FB.login(function(response) {
        if (response.authResponse) {
          $scope.userData.authResponse = response.authResponse;
          console.log('Welcome!  Fetching your information.... ');
          FB.api('/me', {fields: 'name,id,first_name,last_name,email,gender,picture'}, function(response) {
            setFacebookData( response );
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      }, {scope: 'email'} , { return_scopes: true } );

    }
  }

  function setFacebookData( response ){
    for(var key in response) {
      var value = response[key];
      $scope.userData[key] = value;
      $scope.userData.logged_in = true;
    }
    $scope.userData.fullName = 	$scope.userData.name;
    $scope.userData.imgFileName = $scope.userData.picture.data.url;
    service.setUserObj( $scope.userData );
    console.log('Good to see you, ' + response.name + '.');

    $scope.$digest();

    $('input , textarea').each(function(){
      if($(this).val() != '') $(this).addClass('not-empty');
      if($(this).val() == '') $(this).removeClass('not-empty');
    });
  }

  $scope.submitUserClick = function(){

    if( debug ) location.href = "#/game";

    if( formValid() ){

      $scope.onLoad = true;
      $scope.loading_msg = 'שולח טופס';

      $scope.userData.imgFileName = ( $scope.userData.imgFileName == undefined ) ? '' : $scope.userData.imgFileName;
      factory.sendUser( $scope.userData )
        .success(function (data) {

          debugger

          $scope.MainControllerObj.newUser = data.isDistancesNew;
          $scope.MainControllerObj.pauseGameTime = ( data.presentTime == '' ) ? 0 : parseInt( data.presentTime );

          if( data === 'already' ){
            $timeout(function(){
              $scope.formReturnMsg = 'שיחקת כבר היום, ניתן לשחק פעם ביום';
              $scope.onFormReturnMsg = true;
              $scope.onLoad = false;
              $timeout(function(){
                $scope.onFormReturnMsg = false;
              },3000);
            },800);
            return;
          }
          $scope.userData.user_guid = data.userGuid;
          $scope.userData.game_guid = data.gameGuid;

          service.setUserObj( $scope.userData );

          var startPointObj = {
            'latLng' : new google.maps.LatLng( parseFloat(data.Lat) , parseFloat(data.Long) ),
            'panoID' : data.PanoId,
            'pov' : { 'pitch' : parseFloat(data.Pitch) , 'heading' : parseFloat(data.Heading) }
          };
          service.setStartPointObj( startPointObj );

          $timeout(function(){
            location.href = "#/game";
          },800);

        })
        .error(function (error) {
          debugger
          $timeout(function(){
            $scope.formReturnMsg = 'יש בעייה עם שליחת הטופס, אנא נסו שוב מאוחר יותר';
            $scope.onFormReturnMsg = true;
            $scope.onLoad = false;
            $timeout(function(){
              $scope.onFormReturnMsg = false;
            },3000);
          },800);
        });
    }
  }

  function formValid(){

    $scope.validation = {};

    if( $scope.userData.fullName == '' || $scope.userData.fullName == undefined ){
      $scope.validation.nameErr = true;
      $scope.validation.nameErr_txt = $sce.trustAsHtml('יש להזין שם');
    }

    if( $scope.userData.phone == '' || $scope.userData.phone == undefined ){
      $scope.validation.phoneErr = true;
      $scope.validation.phoneErr_txt = $sce.trustAsHtml('יש להזין מספר טלפון');
    } else {
      if( !note7Utils.isPhone( $scope.userData.phone ) ) {
        $scope.validation.phoneErr = true;
        $scope.validation.phoneErr_txt = $sce.trustAsHtml('מספר הטלפון אינו תקין');
      }
    }

    if( $scope.userData.email == '' || $scope.userData.email == undefined ){
      $scope.validation.emailErr = true;
      if( $('#user-mail').val() == '' ){
        $scope.validation.emailErr_txt = $sce.trustAsHtml('יש להזין מייל');
      }else{
        $scope.validation.emailErr_txt = $sce.trustAsHtml('כתובת המייל אינה תקינה');
      }
    }

    if( note7Utils.checkObjEmpty( $scope.validation ) ){
      return true;
    }else{
      return false;
    }

  }


  function setTopScores(){
    factory.getTopScores()
      .success(function( data ){
        $scope.leaders = data;
        for(var i=0; i<$scope.leaders.length; i++){
          $scope.leaders[i].leaderImage = ( $scope.leaders[i].imgFileName == null || $scope.leaders[i].imgFileName == '' || $scope.leaders[i].imgFileName == undefined ) ? 'images/user-img-placeholder.png' : $scope.leaders[i].imgFileName;
          if( $scope.leaders[i].topScoreTime != "" ){
            $scope.leaders[i].topScoreTime = $scope.leaders[i].topScoreTime.split('.')[0];
          }
        }
      })
      .error(function( error ){
        debugger
      })
  }

});

note7.controller( 'Game' , function( $scope , $timeout , factory , service , $sce ){

  var gameInit = false;
  var curPanoId = '';

  $scope.MainControllerObj.onHomePage = false;
  $scope.MainControllerObj.onGamePause= false;
  $scope.stopWatchTime = '00:00:00';
  $scope.startTimeMs = $scope.MainControllerObj.pauseGameTime;
  $scope.stopWatchPlay = true;

  $scope.curPos = {};

  /***  MAP OPTIONS  ***/
  var iconScale = ( $scope.isMobile ) ? 0.3 : 0.4;

  $scope.markerData = {
    'markerImage' : {
      url: 'images/marker-icon.png',
      size: new google.maps.Size(319, 473),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(319*iconScale*0.5 , 473*iconScale*0.95),
      scaledSize: new google.maps.Size(319*iconScale , 473*iconScale)
    },
    'markerShape' : {
      coords: [1, 1, 1, 473*iconScale, 319*iconScale, 473*iconScale, 319*iconScale, 1],
      type: 'poly'
    },
    'markers' : [ ]
  }

  $scope.mapOptions = {
    zoom: 14
  };

  $scope.panoOptions = {
    //panControl: false,
    zoomControl: false,
    addressControl: false,
    fullscreenControl: false,
    motionTrackingControl: false,
    motionTracking: false,
    //linksControl: false,
    enableCloseButton: false
  }

  /*** MAP OPTIONS END ***/

  $scope.userData = service.getUserObj();
  $scope.startPosition = service.getStartPointObj();
  $scope.userImg = ( $scope.userData.picture == null || $scope.userData.picture == '' || $scope.userData.picture == undefined ) ? 'images/user-img-placeholder.png' : $scope.userData.picture.data.url;

  $scope.gameStatus = {
    'devicesDistances'  : [],
    'devicesFound'      : [],
    'closestDevices'    : []
  }

  $scope.panoPosChange = function( arg ){
    if( arg === undefined ) return
    //console.log('pano position update. lat,lng :: ' + arg.latLng.lat() + ', ' + arg.latLng.lng() +', panoID :: ' + arg.panoID);
    //console.dir(arg);

    if( curPanoId == arg.panoID ) return;
    curPanoId = arg.panoID;

    $scope.curPos = { 'game_guid' : service.getUserObj().game_guid , 'lat' : arg.latLng.lat() , 'long' : arg.latLng.lng() , 'panoID' : arg.panoID , 'heading' : arg.pov.heading , 'pitch' : arg.pov.pitch };
    if( !$scope.MainControllerObj.newUser ){
      $scope.MainControllerObj.newUser = true;
      factory.getFirstDistances( $scope.curPos )
        .success(function (data) {
          //debugger
          updateDistances( data );
        })
        .error(function (error) {
          debugger
        })
    } else {
      factory.getDistances( $scope.curPos )
        .success(function (data) {
          //debugger
          updateDistances( data );
        })
        .error(function (error) {
          debugger
        })
    }

  }

  function updateDistances( data ){
    $scope.gameStatus.devicesDistances = data[0];
    for( var i=0; i<$scope.gameStatus.devicesDistances.length; i++ ){
      distance = Math.round( $scope.gameStatus.devicesDistances[i].distance );
      $scope.gameStatus.devicesDistances[i].closest = false;
      $scope.gameStatus.devicesDistances[i].distance = distance;
      $scope.gameStatus.devicesDistances[i].displayDistance = (distance<1000) ? distance : (distance/1000);
      $scope.gameStatus.devicesDistances[i].displayUnits = (distance<1000) ? 'מטר' : 'ק"מ';
      if( !gameInit ){
        if( $scope.gameStatus.devicesDistances[i].status == '1' ) $scope.gameStatus.devicesFound.push( $scope.gameStatus.devicesDistances[i] );
      }
    }
    gameInit = true;
    //debugger
    $scope.gameStatus.devicesDistances = $scope.gameStatus.devicesDistances.sort( note7Utils.sortArrayByName );
    $scope.gameStatus.closestDevices = $scope.gameStatus.devicesDistances.slice(0);
    $scope.gameStatus.closestDevices.sort( note7Utils.sortArrayByDistance );

    if( $scope.showAllDevices ){
      $scope.gameStatus.displayList = $scope.gameStatus.devicesDistances;
    } else {
      $scope.gameStatus.displayList = $scope.gameStatus.closestDevices.slice(0, 3);
      $scope.gameStatus.displayList[0].closest = true;
    }

    if( data[1] != undefined ){
      var _markers = [];
      for( var i=0; i<data[1].length; i++ ){

        var markerObj = {
          'title'       : data[1][i].title,
          'status'      : data[1][i].status,
          'latLng'      : new google.maps.LatLng( parseFloat( data[1][i].Lat ) , parseFloat( data[1][i].Long ) ),
          'panoID'      : data[1][i].PanoId,
          'phoneguid'   : data[1][i].phoneguid,
          'markerImage' : $.extend({} , $scope.markerData.markerImage)
        }
        markerObj.markerImage.url = ( markerObj.status == '1' ) ? 'images/marker-icon-found.png' : 'images/marker-icon.png';

        _markers.push( markerObj );
      }

      $scope.markerData.markers = _markers;
    }else{
      $scope.markerData.markers = [];
    }
  }

  $scope.panoPovChange = function( arg ){
    if( arg === undefined ) return
    //console.log('pano pov update');
    //console.dir(arg);
  }

  $scope.markerClick = function( arg ){
    if( arg === undefined ) return
    //arg.pixel // click position
    if( $scope.markerData.markers.length > 1 ){
      for( var i=0; i<$scope.markerData.markers.length; i++ ){
        if( arg.latLng.lat() == $scope.markerData.markers[i].latLng.lat() && arg.latLng.lng() == $scope.markerData.markers[i].latLng.lng() ){
          updateDevicesFound( $scope.markerData.markers[i] );
          break;
        }
      }
    } else {
      updateDevicesFound( $scope.markerData.markers[0] );
    }
  }

  function updateDevicesFound( obj ){
    if( $scope.gameStatus.devicesFound.filter(function(el){ return el.title == obj.title }).length > 0 ) return
    $scope.gameStatus.devicesFound.push( $scope.markerData.markers[0] );
    $scope.gameStatus.devicesDistances.filter(function(el){ return el.title == obj.title })[0].status = 1;
    obj.markerImage.url = 'images/marker-icon-found.png';

    var phoneData = { 'game_guid' : service.getUserObj().game_guid , 'phone_guid' : obj.phoneguid };

    factory.sendGamePhone( phoneData )
      .success(function(data) {
        debugger
        if( data.split(',')[0] == 'END' ){
          $scope.totalTime = data.split(',')[1].split('.')[0];
          endGame();
        } else {
          $scope.popPhoneTitle = obj.title;
          $scope.onFindPhonePop = true;
        }
      })
      .error(function(error) {
        debugger
      })
  }

  $scope.closePop = function(){
    $scope.onFindPhonePop = false;
  }

  $scope.toggleOptionsMenu = function(){
    $scope.userOptionsOpen = ( $scope.userOptionsOpen ) ? false : true;
  }

  $scope.leaderBoardClick = function(){
    debugger
  }

  $scope.logoutClick = function(){
    if( $scope.userData.id == undefined ){
      $scope.userData = {};
      service.setUserObj( $scope.userData );
      $scope.stopWatchPlay = false;
      quitGame();
      return;
    }
    FB.logout(function(response) {
      fb_connected = false;
      fb_authResponse = undefined;
      $scope.userData = {};
      service.setUserObj( $scope.userData );
      $scope.stopWatchPlay = false;
      quitGame();
    });
  }

  function quitGame(){
    factory.quitGame()
      .success(function (data) {
        debugger
        location.href = '#/home';
      })
      .error(function (error) {
        debugger
      })
  }

  $scope.pauseGameClick = function(){
    $scope.stopWatchPlay = false;
    $scope.MainControllerObj.onGamePause = true;
    debugger
    factory.sendGamePause( $scope.curPos )
      .success(function(data){
        $timeout(function(){
          location.href = '#/home';
        },10);
      })
      .error(function(error) {
        debugger
      })
  }

  $scope.timeMsUpdate = function( arg ){
    if( arg === undefined ) return
    console.log('time update :: ' + arg);
    $scope.MainControllerObj.pauseGameTime = arg;
  }

  function endGame(){
    $scope.onFindPhonePop = true;
    $scope.endGamePop = true;
    $scope.stopWatchPlay = false;
  }

  $scope.shareScore = function(){
    FB.ui({
        method: 'feed',
        name: 'name',
        link: 'https://hooliganspro.co.il/cellcom/note7/streetview/dev/01/',
        picture: 'https://hooliganspro.co.il/cellcom/note7/streetview/dev/01/images/share-img.png',
        description: 'description',
        caption: 'caption'
    }, function (response) {
        if (response !== null && typeof response.post_id !== 'undefined') {

        }
    });
  }

  $scope.toggleDeviceList = function(){
    $scope.showAllDevices = ( $scope.showAllDevices === true ) ? false : true;

    if( $scope.showAllDevices ){
      $scope.gameStatus.displayList = $scope.gameStatus.devicesDistances;
    } else {
      $scope.gameStatus.displayList = $scope.gameStatus.closestDevices.slice(0, 3);
    }
  }


  $(window).bind('unload', function(e) {
    var a = $scope.curPos;
    $.ajax({
      type: 'POST',
      async: false,
      url: urlBaseServer + 'sendGamePause',
      data: {
        'game_guid'   : $scope.curPos.game_guid,
        'lat'         : $scope.curPos.lat,
        'long'        : $scope.curPos.long,
        'panoID'      : $scope.curPos.panoID,
        'heading'     : $scope.curPos.heading,
        'pitch'       : $scope.curPos.pitch
      },
      success: function(msg){
        alert('wow' + msg);
      },
      error: function(e){
        debugger
      }
    });

  });


});
