angular.module('bookmark.controllers')

.controller('userProfileCtrl', function($scope,$state, $stateParams, $ionicHistory, firebaseSrv) {
  	console.log('userprofileCtrl - loaded')
  	$scope.user =  $stateParams.user
  	$scope.editWidth = (window.innerWidth/2)-100;
  	$scope.ownedBooks = [];
	$scope.wishedBooks = [];
	$scope.ownBooksStatus = "fetching"
	$scope.wishedBooksStatus = "fetching"
	var refeshable = false

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
})