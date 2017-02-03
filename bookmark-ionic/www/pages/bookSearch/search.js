angular.module('bookmark.controllers')
.controller('searchCtrl', function($scope, firebaseSrv ,searchSrv, ngProgressFactory, $state) {
	console.log('searchCtrl - loaded')
	var vm = this;

	vm.searchingText = "";
	vm.errorMessage = "";
	vm.books =[];
	vm.showProgress = true;
	vm.progress = 0;
	vm.suggestedKeywords = [];
	vm.didYouMeanKeyword = ""
	$scope.subheaderHeight = "22px";

	$scope.$watch('online', function(newStatus) { 
		console.log('connection is ',newStatus?'online':'offline')
	});

	vm.bookDetail = function(i, j){
	  	console.log('book clicked i:'+i+' j:'+j)
	  	console.log('sending '+vm.books[i][j].title)
	  	$state.go('bookDetail', {source:"search", book: vm.books[i][j]});
	}

	// $scope.typing = function(){
	// 	firebaseSrv.suggestSearch(vm.searchingText)
	// 	.then(function(keywords){
	// 		vm.suggestedKeywords = keywords
	// 		if(keywords.length==0) vm.suggestedKeywords = []
	// 		$scope.subheaderHeight = (5+(22*keywords.length))+"px"
	// 	})
	// 	.catch(function(error){
	// 		console.log("unable to get suggested search")
	// 	})
	// }
	              
	$scope.searching = function(){
		$scope.suggestedKeywords = [];
		vm.didYouMeanKeyword = "";
		firebaseSrv.suggestSearch(vm.searchingText)
		.then(function(keywords){
			if(keywords.length>0 && keywords[0].similarity<100)
			vm.didYouMeanKeyword = keywords[0].keyword
			console.log("didYouMeanKeyword ",vm.didYouMeanKeyword)
		})
		.catch(function(error){
			vm.didYouMeanKeyword = ""
			console.log("unable to get suggested search")
		})
		
	  	console.log('searching '+vm.searchingText)
	  	vm.suggestedKeywords = [];
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
		    vm.books = bookList.chunk(3);
		  	console.log('items', vm.books)
	  	}
	  	firebaseSrv.logSearch(vm.searchingText.toLowerCase(), (Date.now()/1000 | 0 ))
	  	//console.log(levenshtein("HARRY porter","Harry potter"))
	}

	function printBooksError(err){
		searchSrv.progressbar.complete();
		console.log('err', err)
	}

	$scope.resetBookSearch = function(){
		vm.searchingText=vm.didYouMeanKeyword; 
		vm.didYouMeanKeyword = "";
		vm.books = [];
		searchSrv.progressbar.set(0);
	}

})