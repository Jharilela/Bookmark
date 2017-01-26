angular.module('bookmark.controllers')

.controller('bookListCtrl', function($ionicModal,$ionicPopup, $scope,$state, firebaseSrv, $ionicLoading) {
	console.log('bookListCtrl - loaded')
	$scope.ownedBooks = [];
	$scope.wishedBooks = [];
	$scope.ownBooksStatus = "fetching"
	$scope.wishedBooksStatus = "fetching"
	var refeshable = false
	$scope.multipleSelect = false;

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
		firebaseSrv.getBooksOwned("currentUser", "full+keys")
		.then(function(ownedBooks){
			$scope.ownedBooks = ownedBooks.chunk(3)
			console.log('ownedBooks', $scope.ownedBooks)
			$scope.ownBooksStatus = "fetch ownedBoks successful"
		})
		.catch(function(error){
			$scope.ownedBooks = [];
			$scope.ownBooksStatus="fetch ownedBooks failed"
		})	

		firebaseSrv.getWishList("currentUser", "full")
		.then(function(wishedBooks){
			$scope.wishedBooks = wishedBooks.chunk(3)
			console.log('wishedBooks', $scope.wishedBooks)
			$scope.wishedBooksStatus = "fetch wishedBooks successful"
		})
		.catch(function(error){
			$scope.ownedBooks = [];
			$scope.wishedBooksStatus="fetch wishedBooks failed"
		})
	}

	$scope.selectMultiple=function(source,obj){
		console.log('selectMultiple', obj)
		if(obj){
			$scope.multipleSelect = true;
			$scope.changeVisibility(source, obj.row, obj.col)
		}
		else{
			$scope.multipleSelect = false;
			angular.forEach($scope[source], function(bookRow){
				angular.forEach(bookRow, function(book, key){
					book.showOverlay = false;
				})
			})
		}
	}

	$scope.seeBookDetail = function(book){
		$state.go("bookDetail", {source:'bookList', book: book});
	}

	$scope.changeVisibility = function(source, i, j){
		if(!$scope[source][i][j].showOverlay || $scope[source][i][j].showOverlay == false)
			$scope[source][i][j].showOverlay = true;
		else
			$scope[source][i][j].showOverlay = false;
	}

	$scope.viewBookInfo = function(){
		console.log('viewingBookInfo')
		getBooksSelected();
		if($scope.booksSelected.length > 0){
			$ionicModal.fromTemplateUrl('directives/viewBookInfo.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}
	}
	// Close the modal
	$scope.closeModal = function() {
		$scope.modal.hide();
		$scope.modal.remove();
		$scope.form = {};
	}

	$scope.lendBook = function(){
		getBooksSelected();
		var hasLentBooks = false;
		var hasAvailableBooks = false
		angular.forEach($scope.booksSelected, function(bookSelected, key){
			if(bookSelected.secondParty && bookSelected.secondParty.name)
				hasLentBooks = true;
			else
				hasAvailableBooks = true;
		})
		if($scope.booksSelected.length > 0 && hasAvailableBooks){
			$scope.form = {};
			$scope.form.type='rent';
			$scope.form.rentPeriod ="/day";
			$ionicModal.fromTemplateUrl('directives/rentBook.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}
		else if($scope.booksSelected.length > 0 && hasLentBooks && !hasAvailableBooks){
			console.log('removing secondParty from bookSelected')
			angular.forEach($scope.booksSelected, function(book, key){
				firebaseSrv.receiveOwnedBook(book);
			})
		}
	}

	$scope.setFormType = function(type){
		$scope.form.type = type;
	}

	$scope.submitModal = function(){
		getBooksSelected();
		angular.forEach($scope.booksSelected, function(book , key){
			firebaseSrv.lendBook($scope.form, book);
		})
		$scope.closeModal();
	}
	$scope.isNameEmpty = function(){
		if($scope.form.name && !isEmpty($scope.form.name)){
			return false;
		}
		else{
			return true;
		}
	}

	$scope.removeBooks = function(){
		getBooksSelected();
		if($scope.booksSelected.length > 0){
			var confirmPopup = $ionicPopup.confirm({
			 title: 'Removing book',
			 template: 'Are you sure you want to remove these books?'
			});

			confirmPopup.then(function(res) {
			 if(res) {
				angular.forEach($scope.booksSelected, function(book, key){
					firebaseSrv.removeUserBook(book.book)
					.then(function(){
						getBooks();
					})
				})
			 } 
			});
		}
	}

	function getBooksSelected(){
		$scope.booksSelected = [];
		angular.forEach($scope['ownedBooks'], function(bookRow){
			angular.forEach(bookRow, function(book, key){
				if(book.showOverlay == true)
					$scope.booksSelected.push(book)
			})
		})
		angular.forEach($scope['wishedBooks'], function(bookRow){
			angular.forEach(bookRow, function(book, key){
				if(book.showOverlay == true)
					$scope.booksSelected.push(book)
			})
		})
		console.log('booksSelected', $scope.booksSelected)
	}

})