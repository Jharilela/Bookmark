angular.module('bookmark.router', [])

.config(function($stateProvider, $urlRouterProvider) {
	console.log('bookmarkRouter - loaded')
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'pages/tabs/tabs.html',
    resolve: {
      // controller will not be loaded until $waitForSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $waitForSignIn returns a promise so the resolve waits for it to complete
        return Auth.$requireSignIn();
      }]
    }
  })

  // Each tab has its own nav history stack:

  .state('tab.social', {
    url: '/social',
    views: {
      'tab-social': {
        templateUrl: 'pages/social/wall.html',
        controller: 'socialCtrl',
        resolve: {
          // controller will not be loaded until $waitForSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          "currentAuth": ["Auth", function(Auth) {
            // $waitForSignIn returns a promise so the resolve waits for it to complete
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })

  .state('tab.chatList', {
      url: '/chatList',
      views: {
        'tab-chatList': {
          templateUrl: 'pages/chat/chatList.html',
          controller: 'chatListCtrl as chatList',
          resolve: {
            "currentAuth": ["Auth", function(Auth) {
              return Auth.$requireSignIn();
            }]
          }
        }
      }
    })

  .state('chatRoom', {
    url:'/chatRoom',
    templateUrl : 'pages/chat/chatRoom.html',
    controller : 'chatRoomCtrl as chatRoom',
    cache : true,
    params : { chatId : null},
    resolve: {
      "currentAuth": ["Auth", function(Auth) {
        return Auth.$requireSignIn();
      }]
    }
  })

  .state('tab.bookList', {
    url: '/bookList',
    views: {
      'tab-bookList': {
        templateUrl: 'pages/bookList/list.html',
        controller: 'bookListCtrl as bookList',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })
  .state('bookDetail', {
      url: '/detail',
      templateUrl: 'pages/bookDetails/detail.html',
      controller: 'bookDetailCtrl as bookDetail',
      params:{ source:null,
                book: null},
      cache: false,
      resolve: {
        "currentAuth": ["Auth", function(Auth) {
          return Auth.$requireSignIn();
        }]
      }
    })

  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'pages/bookSearch/search.html',
        controller: 'searchCtrl as search',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })

  .state('tab.profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'pages/profile/home.html',
        controller: 'profileCtrl as profile',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })
  .state('userProfile', {
      url: '/userProfile',
      templateUrl: 'pages/profile/userProfile.html',
      controller: 'userProfileCtrl as userProfile',
      params:{ user:null,
                book : null},
      cache: false,
      resolve: {
        "currentAuth": ["Auth", function(Auth) {
          return Auth.$requireSignIn();
        }]
      }
    })
  .state('location', {
      url: '/location',
      templateUrl: 'pages/location/location.html',
      controller: 'locationCtrl as location',
      params:{ location:null},
      cache: false,
    })

  .state('register',{
    url: '/register',
    templateUrl:'./pages/profile/register.html',
    controller:'registerCtrl as register',
    resolve: {
      "currentAuth": ["Auth", function(Auth) {
        return Auth.$waitForSignIn();
      }]
    }
  })

  .state('newUser',{
    url: '/newUser',
    templateUrl: './pages/profile/newUser.html',
    controller: 'newUserCtrl as newUser'
  })

  ;

  // if none of the above states are matched, use this as the callback
  $urlRouterProvider.otherwise(function($injector){
    var auth = $injector.get('Auth')
    console.log('auth', auth)
    var $state = $injector.get('$state')
    return $state.go('register')
  });

})