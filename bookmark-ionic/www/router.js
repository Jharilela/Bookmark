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
    templateUrl: 'pages/tabs/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.social', {
    url: '/social',
    views: {
      'tab-social': {
        templateUrl: 'pages/social/wall.html',
        controller: 'socialCtrl'
      }
    }
  })

  .state('tab.chatRoom', {
      url: '/chatRoom',
      views: {
        'tab-chatRoom': {
          templateUrl: 'pages/chatRoom/chatList.html',
          controller: 'chatCtrl'
        }
      }
    })
  .state('tab.bookList', {
    url: '/bookList',
    views: {
      'tab-bookList': {
        templateUrl: 'pages/bookList/list.html',
        controller: 'bookListCtrl as bookList'
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
    })

  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'pages/bookSearch/search.html',
        controller: 'searchCtrl as search'
      }
    }
  })

  .state('tab.profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'pages/profile/home.html',
        controller: 'profileCtrl as profile'
      }
    }
  })

  .state('register',{
    url: '/register',
    templateUrl:'/pages/profile/register.html',
    controller:'registerCtrl as register'
  })

  .state('newUser',{
    url: '/newUser',
    templateUrl: '/pages/profile/newUser.html',
    controller: 'newUserCtrl as newUser'
  })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/search');

})