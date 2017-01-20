angular.module('bookmark.controllers')

.controller('bookListCtrl', function($scope, firebaseSrv, $ionicLoading) {
	console.log('bookListCtrl - loaded')
	$scope.ownedBooks = [];
	$scope.wishedBooks = [];
	$scope.ownBooksStatus = "fetching"
	$scope.wishedBooksStatus = "fetching"
	var refeshable = false

	$scope.$on("$ionicView.beforeEnter", function(event, data){
	    if(refeshable)
		   getBooks()
	});

  	firebaseSrv.auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
		getBooks()
		refeshable = true	
	  } 

	  else {
	    $scope.ownedBooks = [];
	    $scope.wishedBooks = [];
	    $scope.ownBooksStatus = "fetch failed - no user"
	    $scope.wishedBooksStatus = "fetch failed - no user"
	  }
	})

	function getBooks(){
		firebaseSrv.getBooksOwned("currentUser", "full")
		.then(function(ownedBooks){
			$scope.ownedBooks = ownedBooks
			console.log('ownedBooks', $scope.ownedBooks)
			$scope.ownBooksStatus = "fetch ownedBoks successful"
		})
		.catch(function(error){
			$scope.ownedBooks = [];
			$scope.ownBooksStatus="fetch ownedBooks failed"
		})	

		firebaseSrv.getWishList("currentUser", "full")
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

	


})