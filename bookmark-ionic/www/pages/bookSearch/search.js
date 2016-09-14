angular.module('bookmark.controllers')
.controller('searchCtrl', function($scope, searchSrv, ngProgressFactory, $state) {
  console.log('searchCtrl - loaded')
  var vm = this;

  vm.searchingText = "";
  vm.errorMessage = "";
  vm.books =[];
  vm.showProgress = true;
  vm.progress = 0;

  vm.bookDetail = function(i, j){
  	console.log('book clicked i:'+i+' j:'+j)
  	console.log('sending '+vm.books[i][j].title)
  	$state.go('bookDetail', {source:"search", book: vm.books[i][j]});
  }
              
  $scope.searching = function(){
  	console.log('ok is pressed 1')
  	searchSrv.progressbar.start();
  	searchSrv.progressbar.set(2);
  	if(vm.searchingText!="" && vm.searchingText!=" ")
	  {
	  	searchSrv.searchBookList(vm.searchingText, vm.selectedService)
	  	.then(printBooks)
	  	.catch(printBooksError)
	  }
  }

	function printBooks(bookList){
		searchSrv.progressbar.complete();
	  	if(typeof bookList == "string"){
	  		vm.books = [];
	  		vm.errorMessage = bookList;
	  	}
	  	else{
		  	vm.errorMessage = "";
		  	vm.books = [];
			for (var i=0; i<bookList.length; i+=3) {
			    vm.books.push(bookList.slice(i, i+3));
			}
		    // vm.books = bookList;
		  	console.log('items', vm.books)
	  	}
	}

	function printBooksError(err){
		searchSrv.progressbar.complete();
		console.log('err', err)
	}

})