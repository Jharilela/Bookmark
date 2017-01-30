angular.module('bookmark.constants')

.factory('constants', function(){
	return {
		environment : "development",
		googleClientId : "316498021139-1c6f3u1h7vglk21lo9pjn3v8hbmc6n50.apps.googleusercontent.com",
		facebookAppId : "858145674316344"
	}
})

.factory('searchAPI', function(){

	return{
		googleKey : "AIzaSyA2LUTJpW7oGxg-hgBijd4zoaS6BqIDzts",
		awsAccessKeyId : "AKIAIL3KQVMU2S4BQCTQ",
		awsSecretKey : "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",
		awsAssociateId : "bookmark0bf-20",
		goodReadsKey : "guQ6kGMzvAe3tYTYzytr2A"
	}
})

.directive('noInternetMessage', function() {
  return {
    restrict: 'E',
    template: '<div class="internetOffline-errorMessage" ng-if="!online"><i class="icon ion-android-cancel"></i> No internet connection detected</div>'
  };
})

.directive('noInternetHeader', function() {
  return {
    restrict: 'E',
    template: '<ion-header-bar ng-if="!online" class="bar bar-subheader internetOffline-errorMessage--header"><no-internet-message></no-internet-message></ion-header-bar>'
  };
})

