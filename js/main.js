var debug = false;

var mapApiKey = 'AIzaSyC_PtCMe4SgXMlUcG2M9NwyLqnEDyCDSKE';
var isMobile, isIpad, isIOS, isAndroid, isIE, isOldBrowser;
var urlBase = '';
var urlBaseServer = 'https://hooliganspro.co.il/cellcom/note7/server/home1/';

var note7Utils = new Note7Utils();

$(document).ready(function(e) {
  var md = new MobileDetect(window.navigator.userAgent);

  head.ready(function () {

    if(md.tablet() != null){
      isIpad = true;
      viewport = document.querySelector("meta[name=viewport]");
      viewport.setAttribute('content', 'initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0');
      $('html').addClass('ipad-device');
    }

    if(md.phone() != null){
      isMobile = true;
      $('html').addClass('mobile-device');
      if(md.os() == 'AndroidOS'){
        isAndroid = true;
        $('html').addClass('AndroidOS');
      }
      if(md.os() == 'iOS'){
        isIOS = true;
        $('html').addClass('IOS');
      }
    }

    if(head.browser.ie && head.browser.version < 11){
			isIE = true;
      $('html').addClass('old-browser');
		}
    $.event.trigger({
      type : 'pageReady'
    });

    setPage();
  });
});

$(window).on('load', function (e) {

});

function initMap(){

}

function setPage(){
  location.href = "#/home"
}
