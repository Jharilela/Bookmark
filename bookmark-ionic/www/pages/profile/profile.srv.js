'use strict'
angular.module('bookmark.services')
.factory('profileSrv', profileSrv)

function profileSrv (searchSrv, $firebaseAuth, $firebaseObject, $firebaseArray, $q, Auth, $state){
	console.log('profileSrv - loaded')
	var vm = this;
	var auth = $firebaseAuth();
	var ref = firebase.database().ref()
	var userRef,bookRef,searchRef;

	auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
	    console.log("Signed in as:", firebaseUser.uid);
	    userRef = ref.child("users").child(auth.$getAuth().uid)
	    bookRef = ref.child("books")
	    searchRef = ref.child("search")
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
		getSearchCollection : getSearchCollection,
		getBooksOwned : getBooksOwned,
		getWishList : getWishList,
		logSearch : logSearch,
		suggestSearch : suggestSearch,
		ownBook : ownBook,
		lendBook : lendBook,
		borrowBook : borrowBook,
		addToWishList : addToWishList
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
	function getSearchCollection(){
		var deferred = $q.defer();
	    $firebaseArray(searchRef).$loaded()
	    .then(function(searches){
	    	console.log('search collections loaded successfully')
	    	deferred.resolve(searches)
	    })
	    .catch(function(error){
	    	console.log('failed to load search collections : ',error)
	    	deferred.reject("error fetching search collections")
	    })
		return deferred.promise;
	}
	function getWishList(type){
		var deferred = $q.defer();
	    $firebaseArray(userRef.child("wishList")).$loaded()
	    .then(function(wishListKeys){
	    	console.log('wish list loaded successfully')
	    	if(type == "keys"){
		    	deferred.resolve(wishListKeys)
		    }
		    else if(type == "full"){
		    	getBookCollection()
		    	.then(function(bookCollections){
		    		var bookList = [];
		    		angular.forEach(bookCollections, function(bookCollection) {
			          	angular.forEach(wishListKeys, function(wishListKey){
			          		if(bookCollection.$id == wishListKey.key){
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
	    	console.log('failed to load wish list : ',error)
	    	deferred.reject("error fetching wish list books")
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
	function addBookToCollection(book){
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
				addBookToCollection(book)
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
	function addToWishList(book){
		book = cleanObj(book)
		console.log('adding book to wish list')
		var deferred = $q.defer();

		function addBookToWishList(refKey){
			$q.all([getWishList("keys"), getBooksOwned('keys')])
			.then(function(data){
				console.log('data', data)
				var wishListKeys = data[0]
				var ownedBookKeys = data[1]

				var userWishesBook = false;
				angular.forEach(wishListKeys, function(wishListKey) {
		        	if(wishListKey.key == refKey){
		        		userWishesBook = true;
		        		console.log('user already wishes the book')
		        		deferred.reject('book already in wishList')
		        	}
		        });

				var userHasBook = false;
				angular.forEach(ownedBookKeys, function(ownedBookKeys) {
		        	if(ownedBookKeys.key == refKey){
		        		userHasBook = true;
		        		console.log('user already has the book');
		        		deferred.reject("book already in library")
		        	}
		        });

				if(!userHasBook && !userWishesBook){
		        	console.log('adding book to user\'s wish list')
			        wishListKeys.$add({
						key : refKey,
						timestamp : Date.now()/1000 | 0
					})
					deferred.resolve("books added successfully")
			    }
			})
			.catch(function(error){
				console.log('error adding book to wishList', error)
				deferred.reject("cannot add book to wishList")
			})
		}

		getBookCollection()
		.then(function(bookCollection){
			var bookExist = bookExists(bookCollection, book)
			if(bookExist.bool){
				var bookKey = bookCollection.$keyAt(bookExist.index)
				console.log('book exists in collection, key : '+bookKey)
				addBookToWishList(bookKey)
			}
			else{
				console.log('adding book to collection')
				addBookToCollection(book)
				.then(function(key){
					console.log('book has been added with key : '+key)
					addBookToWishList(key)
				})
				.catch(function(error){
					console.log('wishList - cannot add book to collection')
					deferred.reject("cannot add book to server")
				})
			}
		})
		.catch(function(error){
			console.log("cannot get bookCollection ", error)
			deferred.reject("cannot load books on server")
		})
		return deferred.promise;
	}
	function logSearch(keyword, timestamp){
		//1. Log to SearchDb
			//check if it exists
			//if exists, increase the counter
			//if it doesnt exist, add it with a counter value of 1
			//also include timestamp and names that are greater than 90% similarity but not 100%, with count and timestamps
		var deferred = $q.defer();
		getSearchCollection()
		.then(function(searchCollection){
			console.log('searchCollection', searchCollection)
			var keywordExist = false;
			var similarBooks =[];

			//check if the keyword exist in the search collection 
			angular.forEach(searchCollection, function(searches, index){
				var similarity = levenshtein(searches.keyword, keyword)
				console.log('comparing book '+searches.keyword+' : '+keyword+' = '+similarity)
				//if the word exists, then we increase the counter by 1
				if(similarity>80){
					similarBooks.push({
						key : searchCollection.$keyAt(index),
						index : index,
						searches : searches,
						similarity : similarity
					})
				}
			})
			//if the keyword doesnt already exist in the search Collection, we add a new one
			if(similarBooks.length == 0){
				searchCollection.$add({
					keyword : keyword,
					count : 1,
					verified : false
				})
				.then(function(reference){
					$firebaseArray(searchRef.child(reference.key).child("timestamp")).$add(timestamp)
					deferred.resolve('added keyword to search Collection successfully')
				})
				.catch(function(error){
					console.log('error adding new keyword to search Collection ', error)
					deferred.reject('error adding new keyword to search Collection')
				})
			}
			else
			{
				similarBooks.sort(dynamicSortMultiple("-similarity"));

				var similarity = similarBooks[0].similarity
				var index = similarBooks[0].index
				var key = similarBooks[0].key
				var searches = similarBooks[0].searches

				if(similarity>99){
					console.log('book made 100% hit, counter increasing')
					searches.count++;
					searchCollection.$save(index)
					$firebaseArray(searchRef.child(searchCollection.$keyAt(index)).child("timestamp")).$add(timestamp)
					console.log("logSearch - keyword exists in searchCollection")
					deferred.resolve("keyword exists in searchCollection");
					keywordExist = true;
				}
				//if the word doesnt exist, but a simmilar one does, the add it to the similar keywords
				else if(similarity>=81 && similarity<100){
					console.log('book made >81% hit, checking if the same keyword exist or new one should be added')
					keywordExist = true;

					$firebaseArray(searchRef.child(searchCollection.$keyAt(index)).child("similarKeywords")).$loaded()
					.then(function(similarKeywords){
						console.log('similarKeywords', similarKeywords)
						var secondKeywordExist = false;
						angular.forEach(similarKeywords, function(similarKeyword, secondIndex){
							var secondSimilarity = levenshtein(similarKeyword.keyword, keyword)

							//if the keyword exist in the similar keyword sectio, increase the counter by one
							if(secondSimilarity == 100){
								similarKeyword.count++;
								similarKeywords.$save(secondIndex)
								$firebaseArray(searchRef.child(searchCollection.$keyAt(index)).child("similarKeywords").child(similarKeywords.$keyAt(secondIndex)).child("timestamp")).$add(timestamp)
								console.log("logSearch - keyword matches similar keyword")
								secondKeywordExist = true;

								//if the similar keyword has greater counts than the keyword itself, the program reconfigures firebase to make the similar keyword the actual keyword
								if(similarKeyword.count >= (searches.count+5) && searches.verified == false){
									angular.forEach(similarKeyword, function(objValue, objName){
										if(objName.charAt(0)!='$'){
											console.log("similarKeyword."+objName+" : ",similarKeyword[objName]);
											console.log("searches."+objName+" : ",searches[objName]);
											var temp1 = similarKeyword[objName];
											var temp2 = searches[objName]
											similarKeyword[objName] = temp2;
											similarKeywords.$save(secondIndex)
											searches[objName] = temp1;
											searchCollection.$save(index)
										}
									})

									//we delete all the similar keywords relevant to the old keyword but not to the new keyword
									angular.forEach(similarKeywords, function(similarKeywordList, thirdIndex){
										var thirdSimilarity = levenshtein(similarKeywordList.keyword, searches.keyword)
										if(thirdSimilarity>=81){
											console.log("similar keyword -> "+similarKeywordList.keyword+" = can stay ")
										}
										else{
											console.log("similar keyword -> "+similarKeywordList.keyword+" = will be removed ")
											similarKeywords.$remove(thirdIndex);
										}
									})
								}

								deferred.resolve("keyword matches similar keywords")
							}
						})

						//if the keyword is new in the similar Keywords section, add a new one
						if(!secondKeywordExist){
							$firebaseArray(searchRef.child(searchCollection.$keyAt(index)).child("similarKeywords")).$add({
								keyword : keyword,
								count : 1
							})
							.then(function(secondRef){
								$firebaseArray(searchRef.child(searchCollection.$keyAt(index)).child("similarKeywords").child(secondRef.key).child("timestamp")).$add(timestamp)
								console.log("logSearch - added similar Keyword successfully")
							})
							.catch(function(error){
								console.log('logSearch - failed to add similar keyword')
								deferred.reject("failed to add similar keyword")
							})
						}
					})
					.catch(function(error){
						console.log('logSearch - failed to load similarKeywords ', error)
						deferred.reject("failed to load similarKeywords")
					})
				}
			}
		})
		.catch(function(error){
			console.log("failed to load search collection : ", error)
			deferred.reject("failed to load search collection")
		})
		return deferred.promise;

		//2. Log to user's searchHistory
			//check if it exists
			//if exists ,increase the counter
			//if it doesnt, add it with a counter of 1
	}
	function suggestSearch(text){
		var deferred = $q.defer()
		var similarWords = [];
		if(text.length ==0 || /\w/.test(text)==false) deferred.resolve(similarWords)
		getSearchCollection()
		.then(function(searchCollection){
			angular.forEach(searchCollection,function(searches, index){
				var similarity = levenshtein(searches.keyword, text)
				if(similarity>=81 || searches.keyword.startsWith(text.toLowerCase())){
					//console.log("searches.keyword : "+searches.keyword)
					similarWords.push({
						keyword : searches.keyword,
						similarity : similarity
					})
				}
			})
			similarWords.sort(dynamicSortMultiple("-similarity"))
			deferred.resolve(similarWords)
		})
		.catch(function(error){
			console.log("failed to load search collection : ", error)
			deferred.reject("failed to load search collection")
		})
		return deferred.promise;
	}
	function didYouMean(text){
		var deferred = $q.defer()
		getSearchCollection()
		.then(function(searchCollection){
			
		})
		.catch(function(error){
			console.log("failed to load search collection : ", error)
			deferred.reject("failed to load search collection")
		})
		return deferred.promise;
	}
	function bookExists (bookList, newBook){
		var similar = searchSrv.findSimilarName(bookList, newBook)
		console.log('findSimilarname ', similar)
		return similar;
	}

}