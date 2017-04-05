angular.module('bookmark.controllers')

.controller('userProfileCtrl', function($scope,$timeout,$state,$ionicPopover, $stateParams, $ionicHistory, firebaseSrv, NgMap) {
  	console.log('userprofileCtrl - loaded')
  	var vm = this; 
  	$scope.user =  $stateParams.user
  	console.log('scope.user ', $scope.user)
  	$scope.editWidth = (window.innerWidth/2)-100;
  	$scope.ownedBooks = [];
	$scope.wishedBooks = [];
	$scope.ownBooksStatus = "fetching"
	$scope.wishedBooksStatus = "fetching"
	var refeshable = false

	if(!$scope.user.$id){
		$scope.user.$id = $scope.user.uid;
	}

	firebaseSrv.getAnotherUser($scope.user.$id)
	.then(function(user){
		console.log('another user ', user)
		arr = [];
		arr.push(user.location.lat);
		arr.push(user.location.lng);
		vm.mapCenter = arr;
		// $timeout(function() {
			// vm.mapCenter = arr;
			// map.setCenter({lat: user.location.lat, lng: user.location.lng});
			// google.maps.event.trigger(map, "center_changed");
	    // }, 200);
	})

	$scope.$on("$ionicView.beforeEnter", function(event, data){
	    if(refeshable)
		   getBooks($scope.user.$id)
	});

  	$scope.goBack = function() {
	    $ionicHistory.goBack();
	};

	firebaseSrv.auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
		getBooks($scope.user.$id)
		refeshable = true	
	  } 

	  else {
	    $scope.ownedBooks = [];
	    $scope.wishedBooks = [];
	    $scope.ownBooksStatus = "fetch failed - no user"
	    $scope.wishedBooksStatus = "fetch failed - no user"
	  }
	})

	function getBooks(uid){
		firebaseSrv.getBooksOwned(uid, "full")
		.then(function(ownedBooks){
			$scope.ownedBooks = ownedBooks
			console.log('ownedBooks', $scope.ownedBooks)
			$scope.ownBooksStatus = "fetch ownedBoks successful"
		})
		.catch(function(error){
			$scope.ownedBooks = [];
			$scope.ownBooksStatus="fetch ownedBooks failed"
		})	

		firebaseSrv.getWishList(uid, "full")
		.then(function(wishedBooks){
			$scope.wishedBooks = wishedBooks
			console.log('wishedBooks', $scope.wishedBooks)
			$scope.wishedBooksStatus = "fetch wishedBooks successful"
		})
		.catch(function(error){
			$scope.ownedBooks = [];
			$scope.wishedBooksStatus="fetch wishedBooks failed"
		})
	}

	$scope.message = function(){
		console.log('going to message');
		firebaseSrv.doesChatExist($scope.user.$id)
		.then(function(chatExist){
			console.log('chatExists ',chatExist.bool)
			if(!chatExist.bool){
				firebaseSrv.newChat([$scope.user])
				.then(function(chat){
					console.log("chat created", chat)
					$state.go('chatRoom', {chatId : chat.$id})
				})
				.catch(function(error){
					console.log("failed to initiate newChat ", error)
				})
			}
			else{
				$state.go('chatRoom', {chatId : chatExist.chatRoom.$id})
			}
		})
		.catch(function(error){
			console.log('unable to determine if chat exists',error)
		})
	}

	$scope.displayLocation = function($event){
		console.log('displaying location')
		var e = $event;

		$ionicPopover.fromTemplateUrl('directives/viewMapPop.html', {
			scope: $scope
			}).then(function(popover) {
			$scope.popover = popover;
			$scope.openPopover($event);
			vm.popoverMap = NgMap.initMap("popoverMap");
		});

		$scope.openPopover = function($event) {
			$scope.popover.show($event);
		};
		$scope.closePopover = function() {
			$scope.popover.hide();
		};
		$scope.$on('$destroy', function() {
			$scope.popover.remove();
		});
	}
})
// .directive('mappop', function() {
//     return { 
//       link: function(scope, element, attributes){
//         element.css({'display' : 'block', 'width : 100%'})
//       }
//     }
// })
// .directive('viewpop', function() {
//     return { 
//       link: function(scope, element, attributes){
//         element.css({'left' : '10px', 'width' : '95%'})
//       }
//     }
// })