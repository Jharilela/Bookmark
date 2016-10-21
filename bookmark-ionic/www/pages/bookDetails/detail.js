angular.module('bookmark.controllers')
.controller('bookDetailCtrl', function($scope,$rootScope, $state, $stateParams, $window,  $timeout, $ionicHistory, detailSrv, profileSrv){
	console.log('bookDetailCtrl loaded ', $stateParams);
	var vm = this;
	$rootScope.angular = angular;
	vm.message = {
		type : 'neutral',
		content : ''
	}

	var windowWidth = $window.innerWidth;
	$scope.imageWidth = 0.6 * windowWidth;
	console.log('imageWidth', $scope.imageWidth)

	$scope.source = $stateParams.source;
	$scope.book = $stateParams.book;
	$scope.bookImage = ($scope.book.largeImageLink == undefined) ? $scope.book.imageLink : $scope.book.largeImageLink;
	$scope.bookAuthor = $scope.book.authors;

	if($scope.book.subTitle!=undefined && $scope.book.title.toUpperCase().indexOf($scope.book.subTitle.toUpperCase())>=0){
		$scope.book.title = $scope.book.title.substring(0,$scope.book.title.toUpperCase().indexOf($scope.book.subTitle.toUpperCase())).trim()
		if($scope.book.title.charAt($scope.book.title.length-1)==":")
			$scope.book.title = $scope.book.title.substring(0,$scope.book.title.length-1)
	}

	if($scope.book.authors!=undefined && typeof $scope.book.authors=="object" && $scope.book.authors.length > 0)
		$scope.book.authors = $scope.book.authors.join(", ");
	console.log("loaded ", $scope.book.title, $scope.bookImage);

	$scope.goBack = function() {
	    $ionicHistory.goBack();
	  };

	$scope.ownBook = function(){
		profileSrv.ownBook($scope.book)
		.then(function(log){
			console.log('success : ', log)
			vm.message = {
				type : 'success',
				content: log
			}
		})
		.catch(function(error){
			console.log('error : ',error)
			vm.message = {
				type : 'error',
				content : error
			}
		})
		.finally(function(){
			console.log('vm.message', vm.message)
			$timeout(removeMessage, 3000);
		})
	}

	function removeMessage(){
		vm.message.type = "neutral";
		vm.message.content = "";
	}

})