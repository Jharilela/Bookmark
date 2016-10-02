angular.module('bookmark.controllers')

.controller('bookListCtrl', function($scope, profileSrv, $ionicLoading) {
	console.log('bookListCtrl - loaded')
	$scope.bookList = [];
  	profileSrv.auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
		$scope.bookList =profileSrv.getBookList()
		console.log('bookList', $scope.bookList)
	  } else {
	    $scope.bookList = [];
	  }
	})

})