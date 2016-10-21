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
	function getBookCollection(){
		var deferred = $q.defer();
	    $firebaseArray(bookRef).$loaded()
	    .then(function(bookCollection){
	    	console.log('book collection loaded successfully')
	    	deferred.resolve(bookCollection)
	    })
	    .catch(function(error){
	    	console.log('failed to load book collection : ',error)
	    	deferred.reject("error fetching booksOwned")
	    })
		return deferred.promise;
	}
	function getBooksOwned(type){
		var deferred = $q.defer();
	    $firebaseArray(userRef.child("booksOwned")).$loaded()
	    .then(function(bookKeys){
	    	console.log('booksOwned loaded successfully')
	    	if(type == "keys"){
		    	deferred.resolve(bookKeys)
		    }
		    else if(type == "full"){
		    	getBookCollection()
		    	.then(function(bookCollections){
		    		var bookList = [];
		    		angular.forEach(bookCollections, function(bookCollection) {
			          	angular.forEach(bookKeys, function(bookKey){
			          		if(bookCollection.$id == bookKey.key){
			          			bookList.push(bookCollection)
			          		}
			          	})
			       	});
			       	deferred.resolve(bookList)
		    	})
		    	.catch(function(error){
		    		deferred.reject("cannot load user's books from collection")
		    	})

		    }
	    })
	    .catch(function(error){
	    	console.log("failed to load booksOwned : ",error)
	    	deferred.reject("error fetching booksOwned")
	    })
		return deferred.promise;
	}
	function addBook(book){
		//add books to the books collection
		var deferred = $q.defer();
		getBookCollection()
		.then(function(bookCollection){
			if(bookExists(bookCollection, book).bool){
				console.log("book exist. Not adding to collection")
				deferred.reject("not adding book to collection because book exists")
			}
			else{
				bookCollection.$add(cleanObj(book))
				.then(function(reference){
					console.log('book added to collection successfully : ', reference.key)
					deferred.resolve(reference.key)
				})
				.catch(function(error){
					console.log('error adding book to collection ',error)
					deferred.reject("cannot add to collection")
				})
			}
		})
		.catch(function(error){
			deferred.reject("failed to load book colleciton")
		})
		return deferred.promise;
	}
	function ownBook(book){
		book = cleanObj(book)
		console.log('adding book to ownedBooks library')
		var deferred = $q.defer();

		function addOwnedBooks(refKey){
			getBooksOwned('keys')
			.then(function(booksOwned){
				console.log('booksOwned ', booksOwned)
				var userHasBook = false;
				angular.forEach(booksOwned, function(value) {
		        	if(value.key == refKey){
		        		userHasBook = true;
		        		console.log('user already has the book');
		        		deferred.reject("user already has book")
		        	}
		        });
		        if(!userHasBook){
		        	console.log('adding book to user\'s library')
			        booksOwned.$add({
						key : refKey,
						status : "available",
						secondParty : {
							uid : "",
							name : "",
							status : "",
							requestTimestamp : "",
							initialDate : "",
							returnDate : ""
						}
					})
					deferred.resolve("books added successfully")
			    }
			})
			.catch(function(error){
				console.log('ownBook - cannot get booksOwned')
				deferred.reject("cannot get user's books")
			})
		}

		getBookCollection()
		.then(function(bookCollection){
			var bookExist = bookExists(bookCollection, book)
			if(bookExist.bool){
				var bookKey = bookCollection.$keyAt(bookExist.index)
				console.log('book exists in collection, key : '+bookKey)
				addOwnedBooks(bookKey)
			}
			else{
				console.log('adding book to collection')
				addBook(book)
				.then(function(key){
					console.log('book has been added with key : '+key)
					addOwnedBooks(key)
				})
				.catch(function(error){
					console.log('ownBook - cannot add book to collection')
					deferred.reject("cannot add books to server")
				})
			}
		})
		.catch(function(error){
			console.log("cannot get bookCollection ", error)
			deferred.reject("cannot load books on server")
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
		var similar = searchSrv.findSimilarName(bookList, newBook)
		console.log('findSimilarname ', similar)
		return similar;
	}

}