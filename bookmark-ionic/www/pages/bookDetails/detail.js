angular.module('bookmark.controllers')
.controller('bookDetailCtrl', function($scope,$q,$ionicPopup, $ionicScrollDelegate, $location, LocationService ,$rootScope, $state, $stateParams, $window,  $timeout, $ionicHistory, detailSrv, firebaseSrv){
	console.log('bookDetailCtrl loaded ', $stateParams);
	var vm = this;
	$rootScope.angular = angular;
	vm.message = {
		type : 'neutral',
		content : ''
	}

	var windowWidth = $window.innerWidth;

	$scope.source = $stateParams.source;
	$scope.book = $stateParams.book;

	$scope.expandDescription = true;
	$scope.showPre = false;

	if($scope.book.description && $scope.book.description.containsHTML()){
		console.log('$scope.book.description.htmlToText()\n', htmlToText($scope.book.description).trim())
		$scope.showPre = true;
		$scope.book.description = htmlToText($scope.book.description).trim();
	}
	$scope.bookImage = ($scope.book.largeImageLink == undefined) ? $scope.book.imageLink : $scope.book.largeImageLink;
	$scope.bookAuthor = $scope.book.authors;

	$scope.pressDescription = function(){
		if($scope.expandDescription == true)
			$scope.expandDescription = false;
		else
			$scope.expandDescription = true;
	}

	$q.all([firebaseSrv.getUser(), firebaseSrv.searchBookOwners($scope.book)])
	.then(function(data){
		var currentUser = data[0];
		console.log("currentUser ",currentUser)
		$scope.bookOwners = data[1];
		console.log("bookOwners ",$scope.bookOwners)
		angular.forEach($scope.bookOwners, function(bookOwner, key){
	        distance = LocationService.calculateDistance(
	        	{lat : currentUser.location.lat,
	        	lng : currentUser.location.lng},
	        	{lat: bookOwner.location.lat,
	        	lng : bookOwner.location.lng})
	        bookOwner.distance = (distance/1000).toFixed(2);+"km"
	        console.log('distance : '+distance)
		})
		$scope.bookOwners.sort(dynamicSortMultiple("distance"));
	})
	.catch(function(error){
		console.log("error finding book owners ",error)
	})

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
		firebaseSrv.ownBook($scope.book)
		.then(function(log){
			console.log('success : ', log)
			vm.message = {
				type : 'success',
				content: log
			}
		})
		.catch(function(error){
			console.log('error owning book : ',error)
			if(error == "book already in wishList"){
				var confirmPopup = $ionicPopup.confirm({
			     title: 'Book is in your wish list',
			     template: '<center>Remove book from wish list<br> and add it to your book collection ?</center>'
			    });

			    confirmPopup.then(function(res) {
			     if(res) {
			       firebaseSrv.removeUserBook($scope.book)
			       .then(function(){
			       		$scope.ownBook();
			       })
			       .catch(function(error){
			       		vm.message = {
							type : 'error',
							content : error
						}
			       })
			     } else {
			       console.log('User is not sure to add book to wish list');
			     }
			    });
			}
			else{
				vm.message = {
					type : 'error',
					content : error
				}
			}
		})
		.finally(function(){
			console.log('vm.message', vm.message)
			$timeout(removeMessage, 3000);
		})
	}
	$scope.wishToRead = function(){
		firebaseSrv.addToWishList($scope.book)
		.then(function(log){
			console.log('success : ', log)
			vm.message = {
				type : 'success',
				content: log
			}
		})
		.catch(function(error){
			console.log('error : ',error)
			if(error == "book already in library"){
				var confirmPopup = $ionicPopup.confirm({
			     title: 'Book is already in your library',
			     template: '<center>Remove book from your collection<br> and add it to your wish list ?</center>'
			    });

			    confirmPopup.then(function(res) {
				    if(res) {
				       firebaseSrv.removeUserBook($scope.book)
				       .then(function(){
				       		$scope.wishToRead();
				       })
				       .catch(function(error){
				       		vm.message = {
								type : 'error',
								content : error
							}
				       })
				    } 
				    else {
				       console.log('User is not sure to remove book from library and add it to wishList');
				    }
			    });
			}
			else{
				vm.message = {
					type : 'error',
					content : error
				}
			}
		})
		.finally(function(){
			console.log('vm.message', vm.message)
			$timeout(removeMessage, 3000);
		})
	}

	$scope.borrow = function(){
		var id = "borrowFrom"
		$location.hash(id);
		$ionicScrollDelegate.$getByHandle('mainScroll').anchorScroll(id);
	}

	function removeMessage(){
		vm.message.type = "neutral";
		vm.message.content = "";
	}

})