'use strict'
angular.module('bookmark.services')
.factory('profileSrv', profileSrv)

function profileSrv (searchSrv, $firebaseAuth, $firebaseObject, $firebaseArray, $q, Auth, $state){
	console.log('profileSrv - loaded')
	var vm = this;
	var auth = $firebaseAuth();
	var ref = firebase.database().ref()
	var userRef,bookRef;

	auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
	    console.log("Signed in as:", firebaseUser.uid);
	    userRef = ref.child("users").child(auth.$getAuth().uid)
	    bookRef = ref.child("books")
	  } else {
	    console.log("profileSrv - Signed out");
	    $state.go("register")
	  }
	});
	
	return{
		auth : auth,
		ref : ref,
		isNewUser : isNewUser,
		getUser : getUser,
		saveUser : saveUser,
		validateName : validateName,
		validatePhoneNumber : validatePhoneNumber,
		validateEmail : validateEmail,
		getBooksOwned : getBooksOwned,
		addBook : addBook,
		ownBook : ownBook,
		lendBook : lendBook,
		borrowBook : borrowBook,
		wishToReadBook : wishToReadBook
	}

	function isNewUser(uid){

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
		var deferred = $q.defer();
		$firebaseObject(userRef).$loaded()
		.then(function(user){
			console.log("users Data loaded successfully")
			console.log('user', user)
			if(user.firstName == null || user.firstName == undefined){
				console.log('new user')
				deferred.reject("new user")
			}
			else{
				console.log('user exists')
				deferred.resolve(user)
			}
		})
		.catch(function(error){
			console.log("user's data cannot be loaded")
			deferred.reject("user's data cannot be loaded.\n Please try again")
		})
		return deferred.promise
	}
	function saveUser(user){
		var deferred = $q.defer();
		$firebaseObject(userRef).$loaded()
		.then(function(data){
			addObj(data, user).$save()
			.then(function() {
		        console.log('Profile saved!');
		        deferred.resolve('Profile saved!');
		      })
			.catch(function(error) {
		        console.log('Error! ',error);
		        deferred.reject("error saving ")
		      });
		})
		.catch(function(error){
			console.log('Error! ', error)
			deferred.reject("failed to fetch user data from database")
		})
	    return deferred.promise;
	}
	function getBooksOwned(){
		var deferred = $q.defer();
	    $firebaseArray(userRef.child("booksOwned")).$loaded()
	    .then(function(booksOwned){
	    	deferred.resolve(booksOwned)
	    })
	    .catch(function(error){
	    	deferred.reject("error fetching booksOwned")
	    })
		return deferred.promise;
	}
	function addBook(book){
		//add books to the books collection
		var deferred = $q.defer();
		$firebaseArray(bookRef).$loaded()
		.then(function(bookCollection){
			console.log('book collection loaded successfully')
			if(bookExists(bookCollection, book)){
				console.log("book exist. Not adding to collection")
				deferred.reject("not adding book to collection because book exists")
			}
			else{
				bookCollection.$add(book)
				.then(function(reference){
					console.log('book added to collection successfully : ', reference.key)
					deferred.resolve("book added to collection")
				})
				.catch(function(error){
					console.log('error adding book to collection ',error)
					deferred.reject("cannot add to collection")
				})
			}
		})
		.catch(function(error){
			console.log('failed to load book collection : ',error)
			deferred.reject("failed to load book colleciton")
		})
		return deferred.promise;
	}
	function ownBook(book){
		book = cleanObj(book)
		console.log('adding book to ownedBooks library')
		var deferred = $q.defer();

		$firebaseArray(userRef.child("booksOwned")).$loaded()
		.then(function(bookList){
			//bookList is an array of Strings containing bookIDS
			//book is an object containing the book details

			//perform 2 search asynchronously 
				//1. we need to check if book exists in user's library
					//collect all the books in the array of bookIDS stored from the book collection
					//then we need to compare the book object with others already in the user's list
					//if book is not found, we want to add it to the the user's bok owned list
					//if book is found, exit the asynchronous function and say that book already exists in user's library
				//2. we need to check if the book already exists in firebase book collections 
					//if it doesnt exist, we need to add the book, then pass the key back and add they key to the owned books library
					//if the book exists, well and good. This means we can add the key to the user's library
		})
		.catch(function(error){
			console.log("user's books cannot be loaded ", error)
			deferred.reject("sorry, your books cannot be loaded right now. \n Please try again ")
		})
		return deferred.promise;
	}
	function lendBook(){
		//lending a book from one user to another
	}
	function borrowBook(){
		//borrow a book from another user
	}
	function wishToReadBook(){
		//add book to wishList
	}
	function cleanObj(obj){
		for (var propName in obj) { 
		    if (obj[propName] === null || obj[propName] === undefined) {
		      delete obj[propName];
		    }
		}
		return obj;
	}
	function addObj(to, obj){
		for(var propName in obj){
			to[propName] = obj[propName]
		}
		return to;
	}
	function isEmpty(obj){
		if(obj == undefined || obj == null)
			return true;
		else
			return false;
	}
	function bookExists (bookList, newBook){
		var bookExist = false;
		var similar = searchSrv.findSimilarName(bookList, newBook)
		console.log('findSimilarname ', similar)
		if(similar.bool == true)
			bookExist = true;
		return bookExist;
	}


}