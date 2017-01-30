// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('bookmark', [
  'ionic', 
  'bookmark.router', 
  'bookmark.controllers', 
  'bookmark.constants',
  'bookmark.services',
  'ngProgress',
  'firebase',
  'ngCordova',
  'ngCordovaOauth',
  'cropme'
  ])

.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.run(["$rootScope", "$state", function($rootScope, $state) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    console.log()
    if (error === "AUTH_REQUIRED") {
      console.log('this $state requires AUTH')
      $state.go("register");
    }
  });
}])

.run(["Auth", function(Auth){
  console.log('getting authentication ', Auth)
  var ref = firebase.database().ref()
  console.log('ref', ref)
}])

.run(function($window, $rootScope) {
      $rootScope.online = navigator.onLine;
      $window.addEventListener("offline", function() {
        $rootScope.$apply(function() {
          $rootScope.online = false;
        });
      }, false);

      $window.addEventListener("online", function() {
        $rootScope.$apply(function() {
          $rootScope.online = true;
        });
      }, false);
})

.config(function($provide) {
  $provide.decorator('$state', function($delegate, $stateParams) {
      $delegate.forceReload = function() {
          return $delegate.go($delegate.current, $stateParams, {
              reload: true,
              inherit: false,
              notify: true
          });
      };
      return $delegate;
  });
})

.config(['$ionicConfigProvider', function($ionicConfigProvider){
  $ionicConfigProvider.tabs.position('bottom'); // other values: top
}]);

angular.module('bookmark.constants', [])

angular.module('bookmark.controllers', [])

angular.module('bookmark.services', [])