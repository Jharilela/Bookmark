angular.module('bookmark.controllers')

.controller('bookListCtrl', function($scope, profileSrv, $ionicLoading) {
	console.log('bookListCtrl - loaded')
	$scope.bookList = [];
	$scope.status = "fetching"
  	profileSrv.auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
		profileSrv.getBooksOwned()
		.then(function(bookList){
			$scope.bookList = bookList
			console.log('bookList', $scope.bookList)
			$scope.status = "fetch successful"
		})
		.catch(function(error){
			$scope.bookList = [];
			$scope.status="fetch failed"
		})		
	  } else {
	    $scope.bookList = [];
	    $scope.status="fetch failed"
	  }
	})

})