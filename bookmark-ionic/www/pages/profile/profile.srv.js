'use strict'
angular.module('bookmark.services')
.factory('profileSrv', profileSrv)

function profileSrv ($firebaseAuth, $firebaseObject, $firebaseArray){
	console.log('profileSrv - loaded')
	var vm = this;
	var auth = $firebaseAuth();
	var ref = firebase.database().ref()
	var userRef ;

	auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
	    console.log("Signed in as:", firebaseUser.uid);
	    userRef = ref.child('users').child(auth.$getAuth().uid)
	  } else {
	    console.log("Signed out");
	  }
	});
	
	return{
		auth : auth,
		ref : ref,
		getUser : getUser,
		validateName : validateName,
		validatePhoneNumber : validatePhoneNumber,
		validateEmail : validateEmail,
		getBookList : getBookList,
		ownBook : ownBook,
		lendBook : lendBook,
		borrowBook : borrowBook,
		wishToReadBook : wishToReadBook
	}

	function validateEmail(email) 
	{
	    var format = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return format.test(email);
	}
	function validateName(name)
	{
		var chars = /^[a-zA-Z]+$/;
		return chars.test(name);
	}
	function validatePhoneNumber(phoneNumber)
	{
		var nums = /^\+?\d+$/;
		return nums.test(phoneNumber);
	}
	function getUser(){
		//return synchronized object for data binding
		return $firebaseObject(userRef);
	}
	function getBookList(){
	    var bookRef = $firebaseArray(userRef.child("booksOwned"))
		return bookRef;
	}
	function ownBook(book){
		book = cleanObj(book)

		var bookRef = $firebaseArray(userRef.child("booksOwned"))
		bookRef.$loaded()
		.then(function(){
			if(!checkRedundancy(bookRef, book)){
				bookRef.$add(book)
				.then(function(reference){
					console.log('added successfully ', bookRef)				})
				.catch(function(error){
					console.log('error adding to database ',error)
				})
			}
			else{
				console.log('not adding to list because book exists')
			}
		})
		.catch(function(error){
			console.log("user's books cannot be loaded ", error)
		})
	}
	function lendBook(){

	}
	function borrowBook(){

	}
	function wishToReadBook(){

	}
	function cleanObj(obj){
		for (var propName in obj) { 
		    if (obj[propName] === null || obj[propName] === undefined) {
		      delete obj[propName];
		    }
		}
		return obj;
	}
	function checkRedundancy (bookList, newBook){
		var bookExists = false;

		angular.forEach(bookList, function(book){
			if(book.ISBN == newBook.ISBN)
				bookExists = true;
		})

		return bookExists;
	}


}