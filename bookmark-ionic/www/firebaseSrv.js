'use strict'
angular.module('bookmark.services')
.factory('firebaseSrv', firebaseSrv)

function firebaseSrv (searchSrv,LocationService, $firebaseAuth, $firebaseObject, $firebaseArray, $q, Auth, $state, $cordovaCamera){
	console.log('firebaseSrv - loaded')
	var vm = this;
	var auth = $firebaseAuth();
	var ref = firebase.database().ref()
	var userRef, allUserRef,bookRef,searchRef, chatRef, storageRef;

	auth.$onAuthStateChanged(function(firebaseUser) {
	  if (firebaseUser) {
	    console.log("FIREBASE onAuthStateChanged \n Signed in as:", firebaseUser.uid);
	    userRef = ref.child("users").child(auth.$getAuth().uid)
	    allUserRef = ref.child("users");
	    bookRef = ref.child("books")
	    searchRef = ref.child("search")
	    chatRef = ref.child("chat")
	    storageRef = storage.ref()
	  } else {
	    console.log("profileSrv - Signed out");
	    $state.go("register")
	  }
	}); 

	var images = {
		defaultPersonImage : "img/defaultPersonImage.png",
		inactivePersonImage : "img/inactivePersonImage.png",
		defaultGroupImage : "img/defaultGroupImage.png"
	}
	
	return{
		auth : auth,
		ref : ref,
		isNewUser : isNewUser,
		getUser : getUser,
		getAnotherUser : getAnotherUser,
		userHaveProfilePicture : userHaveProfilePicture,
		getProfilePicture : getProfilePicture,
		takePicture : takePicture,
		uploadPicture : uploadPicture,
		setUserProfileStatus : setUserProfileStatus,
		saveUser : saveUser,
		updateUserInfo : updateUserInfo,
		deleteUser : deleteUser,
		searchUser : searchUser,
		searchBookOwners : searchBookOwners,
		getBooksNearby : getBooksNearby,
		validateName : validateName,
		validatePhoneNumber : validatePhoneNumber,
		validateEmail : validateEmail,
		getSearchCollection : getSearchCollection,
		getBooksOwned : getBooksOwned,
		getWishList : getWishList,
		logSearch : logSearch,
		suggestSearch : suggestSearch,
		ownBook : ownBook,
		removeUserBook : removeUserBook,
		lendBook : lendBook,
		receiveOwnedBook : receiveOwnedBook,
		borrowBook : borrowBook,
		addToWishList : addToWishList,
		newChat : newChat,
		getChatRooms : getChatRooms,
		getChat : getChat,
		doesChatExist : doesChatExist,
		sendMessage : sendMessage,
		images : images
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
			console.log("users Data loaded successfully ",user)
			if(user.firstName == null || user.firstName == undefined){
				console.log('new user')
				deferred.reject("new user")
			}
			else{
				console.log('user exists')

				getProfilePicture(user.$id)
				.then(function(url){
					user.profilePictureUrl = url;
				})
				.catch(function(err){
					console.error("failed to fetch user's profile Picture");
				})
				.finally(function(){
					deferred.resolve(user)
				})
			}
		})
		.catch(function(error){
			console.log("user's data cannot be loaded")
			deferred.reject("user's data cannot be loaded.\n Please try again")
		})

		return deferred.promise
	}
	function getAnotherUser(id){
		var deferred = $q.defer();
		$firebaseArray(allUserRef).$loaded()
		.then(function(allUsers){
			deferred.resolve(allUsers.$getRecord(id));
		})
		.catch(function(error){
			console.log("user's data cannot be loaded")
			deferred.reject("user's data cannot be loaded.\n Please try again")
		})

		return deferred.promise
	}
	function deleteUser(){
		console.log('deleting user');
		$q.all([deleteProfilePicture(), removeUserFromChats(), deleteUserData()])
		.then(function(data){
			console.log("removing user from firebase ")
			auth.$deleteUser()
			.then(function() {
			  console.log("User removed successfully!");
			}).catch(function(error) {
			  console.error("Error: ", error);
			});
		})
		.catch(function(err){
			console.log('error deleting user ',err)
		})
	}
	function deleteProfilePicture(){
		var deferred = $q.defer();
		storageRef.child('profilePicture').child(auth.$getAuth().uid+".png").delete()
		.then(function() {
		  console.log("deleted user's profile picture successfully")
		  deferred.resolve('profile picture deleted successfully');
		})
		.catch(function(error) {
		  if(error.code && error.code=="storage/object-not-found"){
		  	console.log('user does not have profile picture')
		  	deferred.resolve('profile picture did not exist');
		  }
		  else{
		  	console.log('error deleting profile picture ',error)
		  	deferred.reject('error deleting profile picture');
		  }
		});
		return deferred.promise;
	}
	function removeUserFromChats(){
		var deferred = $q.defer();
		var errorFound = false;
		$firebaseArray(chatRef).$loaded()
		.then(function(chatRooms){
			angular.forEach(chatRooms, function(chatRoom, key1){
				var chatContainsUser=false;
				angular.forEach(chatRoom.users, function(user, key2){
					if(user.uid == auth.$getAuth().uid){
						chatContainsUser = true;
						user.isActive = false;
					}
				})
				if(chatContainsUser){
					console.log('saving status for ', chatRoom)
					chatRooms.$save(key1)
					.then(function(){
						console.log('saved successfully')
					})
					.catch(function(err){
						console.error('failed to change user status to isActive : false \n',err);
						errorFound = true;
					})
				}
			})
			if(!errorFound){
				console.log('made user inactive in all chats')
				deferred.resolve('made chat users inactive');
			}
			else{
				deferred.reject('error occuerd in making chat users inactive')
			}
		})
		.catch(function(error){
			console.error("failed to load chatRooms ",error)
			deferred.reject('failed to load chatRooms')
		})
		return deferred.promise;
	}
	function deleteUserData(){
		var deferred = $q.defer();
		$firebaseArray(allUserRef).$loaded()
		.then(function(allUsers){
			allUsers.$remove(allUsers.$indexFor(auth.$getAuth().uid))
			.then(function(){
				console.log('remove user data successfully')
				deferred.resolve('remove user data successfully')
			})
			.catch(function(err){
				console.error('failed to remove user data ',err)
				deferred.reject('failed to remove user data')
			})
		})
		.catch(function(err){
			console.error('error loading allUsers ',err)
			deferred.reject('error loading allUsers')
		})
		return deferred.promise;
	}
	function searchUser(name){
		console.log("searching for user "+name);
		var deferred = $q.defer();

		$firebaseArray(allUserRef).$loaded()
		.then(function(allUsers){
			var returnUsers = [];
			angular.forEach(allUsers, function(allUser, key){
				if((allUser.firstName.substring(0,name.length).toLowerCase() == name.toLowerCase() ||
				   allUser.lastName.substring(0,name.length).toLowerCase() == name.toLowerCase() || 
				   name.toLowerCase() == (allUser.firstName.toLowerCase()+" "+allUser.lastName.toLowerCase()).substring(0,name.length)) &&
					allUser.$id != auth.$getAuth().uid)
				{
					allUser.profilePictureUrl="";
					returnUsers[returnUsers.length] = allUser
				}
			})
			deferred.resolve(returnUsers)
		})
		.catch(function(error){
			console.log("bookmark users data cannot be loaded")
			deferred.reject("user's data cannot be loaded.\n Please try again")
		})

		return deferred.promise
	}

	function searchBookOwners(book){
		console.log('searching users with book ', book.title);
		var deferred = $q.defer();
		$firebaseArray(allUserRef).$loaded()
		.then(function(allUsers){
			var returnUsers = [];
			angular.forEach(allUsers, function(allUser, key1){
				if(allUser.$id != auth.$getAuth().uid)
				angular.forEach(allUser.booksOwned, function(bookOwned, key2){
					if(bookOwned.title && levenshtein(bookOwned.title, book.title)>90){
						getProfilePicture(allUser.$id)
						.then(function(url){
							allUser.profilePictureUrl = url
						})
						returnUsers[returnUsers.length]=allUser;
					}
				})
			})
			deferred.resolve(returnUsers)
		})
		.catch(function(error){
			console.log("bookmark users data cannot be loaded")
			deferred.reject("user's data cannot be loaded.\n Please try again")
		})
		return deferred.promise;
	}
	function getBooksNearby(radius, numberOfResults){
		radius = LocationService.stringToDistance(radius);
		console.log('radius ',radius)
		console.log('getting #'+numberOfResults+' books nearby');
		var deferred = $q.defer();
		$q.all([getUser(), getBookCollection(), $firebaseArray(allUserRef).$loaded()])
		.then(function(data){
			var currentUser = data[0];
			var bookCollections = data[1];
			var allUsers = data[2];
			var returnBooks = [];

			for(var i= allUsers.length-1; i>=0; i--){
				var allUser = allUsers[i];
				var distance = LocationService.inProximity(currentUser, allUser, radius)
				if(distance){
					allUser.distance = distance;
				}
				else{
		        	allUsers.splice(i,1);
		        }
			}
			allUsers.sort(dynamicSortMultiple("distance"))

			angular.forEach(allUsers, function(allUser){
				if(allUser.booksOwned != undefined){
					angular.forEach(allUser.booksOwned, function(book){
						if(returnBooks.length < numberOfResults){
        					var bookExists = false;
	        				angular.forEach(returnBooks, function(returnBook){
	        					if(returnBook.$id == book.key)
	        						bookExists = true;
	        				})
	        				if(!bookExists){
        						returnBooks.push(bookCollections.$getRecord(book.key));
							}
        				}
        			})
				}
			})

			deferred.resolve(returnBooks)
		})
		.catch(function(error){
			console.error("bookmark users data cannot be loaded")
			deferred.reject("user's data cannot be loaded.\n Please try again")
		})
		return deferred.promise;
	}

	function userHaveProfilePicture(uid){
		var deferred = $q.defer();
		storageRef.child("profilePicture").child(uid+".png").getMetadata()
		.then(function(metadata){
			deferred.resolve(true);
		})
		.catch(function(err){
			if(err.code == "storage/object-not-found"){
				deferred.resolve(false);
			}
			else{
				console.error('failed to obtain metadata of profile picture ',err)
				deferred.reject('failed to obtain metadata of profile picture')
			}
		})
		return deferred.promise;
	}

	function getProfilePicture(uid){
		if(!uid)
			uid = auth.$getAuth().uid

		var deferred = $q.defer();

		function getDefaultPicture(name){
			deferred.resolve(images[name]);
		}

		if(uid == "defaultPersonImage" || uid == "defaultGroupImage" || uid=="inactivePersonImage"){
			getDefaultPicture(uid)
		}
		else{
			$firebaseArray(allUserRef).$loaded()
			.then(function(allUsers){
				var profilePictureExists = allUsers.$getRecord(uid) && allUsers.$getRecord(uid).hasProfilePicture

				if(allUsers.$getRecord(uid)){
					if(allUsers.$getRecord(uid).hasProfilePicture){
						var profilePicRef = storageRef.child("profilePicture").child(uid+".png")
						profilePicRef.getDownloadURL()
						.then(function(url){
							deferred.resolve(url)
						})
						.catch(function(err){
							getDefaultPicture("defaultPersonImage");
						})
					}
					else{
						getDefaultPicture("defaultPersonImage");
					}
				}
				else{
					getDefaultPicture("inactivePersonImage");
				}
			})
			.catch(function(err){
				console.error('failed to load allUsers ',err);
				deferred.reject('failed to laod allUsers')
			})
		}
		return deferred.promise;
	}

	function takePicture(source){
		var deferred = $q.defer();
		var options = {
            quality : 75,
            destinationType : Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            sourceType : Camera.PictureSourceType.CAMERA,
            correctOrientation: true,
            allowEdit : true,
            saveToPhotoAlbum: false
        };

        if(source == "camera"){
        	options.sourceType = Camera.PictureSourceType.CAMERA
        	options.targetWidth= 300
            options.targetHeight= 300
        }
        else if(source=="photoLibrary"){
        	options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY
        }
        else{
        	console.error('invalid source '+source)
        	deferred.reject("invalid source")
        }

        $cordovaCamera.getPicture(options)
        .then(function(imageData) {
            console.log('taking image successful ')
            uploadPicture(imageData)
            .then(function(snapshot){
            	setUserProfileStatus(true);

            	getProfilePicture()
            	.then(function(url){
            		console.log("uploaded Picture successfully")
            		deferred.resolve(url);
            	})
            	.catch(function(err){
            		console.log("error retreiving user's new data", err)
            		deferred.reject(err);
            	})
            })
            .catch(function(err){
            	console.log("error uploading image" , err)
            	deferred.reject(err);
            })
        })
        .catch(function(error) {
            console.error('error taking image',error);
            deferred.reject(error);
        });
        return deferred.promise
	}

	function uploadPicture(imageData){
		var deferred = $q.defer();
		storageRef.child("profilePicture").child(auth.$getAuth().uid+".png")
		.putString(imageData, 'base64')
		.then(function(snapshot) {
			console.log('Uploaded a base64 string!');
			deferred.resolve(snapshot);
		})
		.catch(function(err){
			console.log('Error uploading base64 string!');
			deferred.reject(err);
		})
		return deferred.promise;
	}

	function setUserProfileStatus(value){
		var deferred = $q.defer();
		$firebaseObject(userRef).$loaded()
		.then(function(user){
			console.log('user ',user);
			user.hasProfilePicture = value;
			user.$save()
			.then(function(){
				console.log('changed user profile status successfully');
				deferred.resolve("changed user profile status successfully")
			})
			.catch(function(err){
				console.log('error saving profile picture status ',err)
				deferred.reject("error saving profile picture status")
			})
		})
		.catch(function(err){
			console.log('error changing status for user profile picture');
			deferred.reject('error changing status for user profile picture')
		})
		return deferred.promise;
	}

	function saveUser(user){
		var deferred = $q.defer();
		console.log('FIREBASE - saving user data ',user);
	    userRef = ref.child("users").child(auth.$getAuth().uid)

	    $firebaseObject(userRef).$loaded()
		.then(function(data){
			addObj(data, user).$save()
			.then(function() {
				console.log('Profile saved!');
		        deferred.resolve('Profile saved!');
		        var developer = {
			    	$id : "Fv9l8YjeigQpKlmOFzMluHYyPwl2", 
			        firstName : "Bookmark", 
			        lastName : "Bookmark"
				}
			    newChat([developer])
			    .then(function(chat){
		    	console.log('newChat created ',chat);
		    	var message = {
					timestamp : Date.now()/1000 | 0,
					from : developer.$id,
					content : "Hi, how can I help you ?"
				}

				$firebaseArray(chatRef.child(chat.$id).child("messages")).$add(message);

	    })
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
	function updateUserInfo(userInfo){
		var deferred = $q.defer();
		console.log('updating user information ',userInfo)
		$firebaseObject(userRef).$loaded()
		.then(function(user){
			if(user == userInfo){
				deferred.resolve('nothing changed');
			}
			else{
				if(userInfo.email && userInfo.email!=user.email)
					user.email = userInfo.email
				if(userInfo.firstName && userInfo.firstName!=user.firstName)
					user.firstName = userInfo.firstName
				if(userInfo.lastName && userInfo.lastName!=user.lastName)
					user.lastName = userInfo.lastName
				if(userInfo.phoneNumber && userInfo.phoneNumber!=user.phoneNumber)
					user.phoneNumber = userInfo.phoneNumber
				if(userInfo.location && userInfo.location!=user.location)
					user.location = userInfo.location
				user.$save()
				.then(function(ref) {
				  console.log('user information updated successfully')
				  deferred.resolve('user information updated successfully')
				})
				.catch(function(err) {
				  console.log("Error updating user info", err);
				  deferred.reject("Error updating user info")
				});
			}
		})
		.catch(function(err){
			console.log('failed to load user ',err);
			deferred.reject('failed to load user')
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
	function getWishList(uid,type){
		var deferred = $q.defer();
		var user;
		if(uid == "currentUser")
			user = userRef
		else
			user = ref.child("users").child(uid)

	    $firebaseArray(user.child("wishList")).$loaded()
	    .then(function(wishListKeys){
	    	console.log('wish list loaded successfully ',wishListKeys)
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
		    else if(type=="full+keys"){
		    	getBookCollection()
		    	.then(function(bookCollections){
		    		angular.forEach(bookCollections, function(bookCollection) {
			          	angular.forEach(wishListKeys, function(wishListKey){
			          		if(bookCollection.$id == wishListKey.key){
			          			wishListKey.book = bookCollection
			          		}
			          	})
			       	});
			       	deferred.resolve(wishListKeys)
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
	function getBooksOwned(uid, type){
		var deferred = $q.defer();
		var user;
		if(uid == "currentUser")
			user = userRef
		else
			user = ref.child("users").child(uid)

	    $firebaseArray(user.child("booksOwned")).$loaded()
	    .then(function(bookKeys){
	    	console.log('booksOwned loaded successfully', bookKeys)
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
		    else if(type == "full+keys"){
		    	getBookCollection()
		    	.then(function(bookCollections){
		    		angular.forEach(bookCollections, function(bookCollection) {
			          	angular.forEach(bookKeys, function(bookKey, key){
			          		if(bookCollection.$id == bookKey.key){
			          			bookKey.book = bookCollection
			          		}
			          	})
			       	});
			       	deferred.resolve(bookKeys)
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
			console.log('adding ownedBooks')
			$q.all([getWishList('currentUser','keys'), getBooksOwned('currentUser','keys')])
			.then(function(data){
				console.log('data', data)
				var wishListKeys = data[0]
				var ownedBookKeys = data[1]

				console.log('ownedBookKeys ', ownedBookKeys)
				var userHasBook = false;
				var userWishesBook = false;

				
		        angular.forEach(ownedBookKeys, function(ownedBookKey) {
		        	if(ownedBookKey.key == refKey){
		        		userHasBook = true;
		        		console.log('user already has the book');
		        		deferred.reject("book already in library")
		        	}
		        });
		        angular.forEach(wishListKeys, function(wishListKey) {
		        	if(wishListKey.key == refKey){
		        		userWishesBook = true;
		        		console.log('user already wishes the book')
		        		deferred.reject('book already in wishList')
		        	}
		        });
		        if(!userHasBook && !userWishesBook){
		        	console.log('adding book to user\'s library')
			        ownedBookKeys.$add({
						key : refKey,
						title : book.title,
						status : "available"
					})
					//if another person is borrowing the book, their details is stored in secondParty
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
			console.log('book collection loaded ', bookCollection)
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
	function removeUserBook(book){
		var deferred = $q.defer();
		console.log('removing book ',book)
		$q.all([getWishList('currentUser','keys'), getBooksOwned('currentUser','keys')])
		.then(function(data){
			var wishListKeys = data[0]
			console.log('wishListKeys', wishListKeys)
			angular.forEach(wishListKeys, function(wishListKey, key){
				if(wishListKey.key == book.$id){
					console.log('removing book from wishList')
					wishListKeys.$remove(key)
					.then(function(ref) {
						deferred.resolve("book removed from wishList")
					})
					.catch(function(error){
						console.log("error removing book from wishList", error)
						deferred.reject("error removing book from wishList");
					})
				}
			})

			var ownedBookKeys = data[1]
			console.log('ownedBookKeys', ownedBookKeys)
			angular.forEach(ownedBookKeys, function(ownedBookKey, key){
				if(ownedBookKey.key == book.$id){
					console.log('removing book from ownedBook')
					ownedBookKeys.$remove(key)
					.then(function(ref) {
						deferred.resolve("book removed from ownedBooks")
					})
					.catch(function(error){
						console.log("error removing book from ownedBooks", error)
						deferred.reject("error removing book from ownedBooks");
					})
				}
			})
		})
		.catch(function(error){
			console.log('failed to load wishList and booksOwned while removing')
			deferred.reject(error);
		})
		return deferred.promise;
	}
	function lendBook(form, ownedBook){
		var deferred = $q.defer();
		console.log('lending book to ', form);
		var secondParty = {};
		secondParty.name = form.name;
		secondParty.type = form.type
		if(form.type=='rent'&&form.initialDate)
			secondParty.initialDate = new Date(form.initialDate).getTime();
		if(form.type=='rent'&&form.returnDate)
			secondParty.returnDate = new Date(form.returnDate).getTime();
		if(form.type=='rent' && form.rentPrice){
			secondParty.rentPrice = form.rentPrice;
			secondParty.rentPeriod = form.rentPeriod;
		}
		if(form.type=='sell' && form.sellPrice)
			secondParty.sellPrice = form.sellPrice;
		console.log('secondParty ',secondParty)

		getBooksOwned('currentUser','keys')
		.then(function(ownedBookKeys){
			console.log('ownedBookKeys', ownedBookKeys)
			var bookFound = false;
			angular.forEach(ownedBookKeys, function(ownedBookKey, index){
				if(ownedBookKey.$id == ownedBook.$id){
					bookFound = true;
					console.log('index of ownedBook : '+index)
					ownedBookKeys[index].secondParty = secondParty;
					ownedBookKeys.$save(index)
					.then(function(ref){
						console.log('lend book successful')
						deferred.resolve('lend book successful')
					})
					.catch(function(error){
						console.error('error lending/selling book ',error)
						deferred.reject('error lending/selling book')
					})
				}
			})
			if(!bookFound){
				console.error('failed to find book key with book to be lent/sold')
				deferred.reject('failed to lend/sell book')
			}
		})
		.catch(function(error){
			console.error('failed to get booksOwned ', error)
			deferred.reject('failed to lend/sell book');
		})
		return deferred.promise;
	}
	function receiveOwnedBook(ownedBook){
		var deferred = $q.defer();
		getBooksOwned('currentUser','keys')
		.then(function(ownedBookKeys){
			console.log('ownedBookKeys', ownedBookKeys)
			var bookFound = false;
			angular.forEach(ownedBookKeys, function(ownedBookKey, index){
				if(ownedBookKey.$id == ownedBook.$id){
					bookFound = true;
					console.log('index of ownedBook : '+index)
					ownedBookKeys[index].secondParty = null;
					ownedBookKeys.$save(index)
					.then(function(ref){
						console.log('remove secondParty from ownedBook successful')
						deferred.resolve('received owned Book successful')
					})
					.catch(function(error){
						console.error('error receiving book back',error)
						deferred.reject('error receiving book')
					})
				}
			})
			if(!bookFound){
				console.error('failed to find book key for book being received')
				deferred.reject('failed to receive book')
			}
		})
		.catch(function(error){
			console.error('failed to get booksOwned ', error)
			deferred.reject('failed to receive book');
		})
		return deferred.promise;
	}
	function borrowBook(){
		//borrow a book from another user
	}
	function addToWishList(book){
		book = cleanObj(book)
		console.log('adding book to wish list')
		var deferred = $q.defer();

		function addBookToWishList(refKey){
			$q.all([getWishList('currentUser','keys'), getBooksOwned('currentUser','keys')])
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
						title : book.title,
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
		var wordFound = false;
		getSearchCollection()
		.then(function(searchCollection){
			angular.forEach(searchCollection, function(searches, index){
				angular.forEach(seaches.similarWords, function(similarWords, secondIndex){
					if(similarWords.keyword.toLowerCase() == text.toLowerCase()){
						wordFound = true;
						deferred.resolve(searches.keyword);
					}
				})
			})
			if(!wordFound)
				deferred.reject("");
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

	function newChat(users){
		var deferred = $q.defer();
		var uids=[];
		angular.forEach(users, function(user, key){
			var message = {
				uid : user.$id , 
				name: user.firstName+" "+user.lastName
			}
			uids[uids.length] = message;
		})

		console.log("establishing a new message connection with uid:",uids)
		console.log("getting users uid ")
		
		getUser()
		.then(function(currentUser){
			var chat = {};
			chat.timestamp = Date.now()/1000 | 0

			uids[uids.length] = 
			{
				uid : currentUser.$id, 
				name: currentUser.firstName+" "+currentUser.lastName
			}
			chat.users = uids;

			$firebaseArray(chatRef).$loaded()
			.then(function(chatRooms){
				console.log("chatRooms ",chatRooms);

				chatRooms.$add(chat)
				.then(function(chatRoom){
					console.log("successfully establishing new message connection")
					deferred.resolve($firebaseObject(chatRoom))
				})
				.catch(function(error){
					console.log("error establishing new message connection")
					deferred.reject(error)
				})
			})
			.catch(function(error){
				console.log('Failed to load chat database ', error)
				deferred.reject(error);
			})
		})
		.catch(function(error){
			console.log("newMessage error : failed to fetch user's data", error)
			deferred.reject(error);
		})
		return deferred.promise;
	}

	function getChatRooms(){
		var deferred = $q.defer();
		console.log("getting user's messages")
		var returnChatRooms=[];

		$firebaseArray(chatRef).$loaded()
		.then(function(chatRooms){
			var chatsRef = $firebaseArray(chatRef);

			angular.forEach(chatRooms, function(chatRoom, key) {
				var userIsInChat = false;
	          	angular.forEach(chatRoom.users, function(user){
	          		if(user.uid == auth.$getAuth().uid){
	          			userIsInChat = true;
	          			user.visible = false
	          		}
	          		else{
	          			user.visible = false;
	          		}
	          	})
	          	if(userIsInChat){
	          		$firebaseArray(chatRef.child(chatRoom.$id).child("messages")).$loaded()
	          		.then(function(messages){
	          			chatRoom.latestMessage = messages[messages.length-1];
	          			if(chatRoom.latestMessage){
		          			chatRoom.latestMessageTimestamp = chatRoom.latestMessage.timestamp
	          			}
	          			else{
	          				chatRoom.latestMessage = {}
	          				chatRoom.latestMessage.timestamp = Math.floor(Date.now() / 1000);
	          			}
	          		})
		          	returnChatRooms[returnChatRooms.length] = chatRoom;
	          	}
	       	});

	       	var returnObj = {
	       		chatRooms : returnChatRooms,
	       		chatRoomsRef : chatRooms
	       	}

			deferred.resolve(returnObj);
		})
		.catch(function(error){
			console.log('Failed to load chat database ', error)
			deferred.reject(error);
		})
		return deferred.promise;
	}

	function getChat(chatId){
		var deferred = $q.defer();
		$firebaseObject(chatRef.child(chatId)).$loaded()
		.then(function(chat){
			deferred.resolve(chat);
		})
		.catch(function(chat){
			deferred.reject(chat);
		})

		return deferred.promise;
	}

	function doesChatExist(uid){
		var deferred = $q.defer();
		$firebaseArray(chatRef).$loaded()
		.then(function(chatRooms){
			console.log('chatRooms', chatRooms)
			angular.forEach(chatRooms, function(chatRoom, key1){
				var containsCurrentUser = false;
				var containsUID = false
				angular.forEach(chatRoom.users, function(user, key2){
					if(user.uid == auth.$getAuth().uid)
						containsCurrentUser = true;
					else if(user.uid == uid)
						containsUID = true;
				})
				if(containsCurrentUser && containsUID){
					var returnObj = {
						bool : true,
						chatRoom : chatRoom
					}
					deferred.resolve(returnObj)
				}
			})
			deferred.resolve({bool : false});
		})
		.catch(function(error){
			console.log("unable to fetch all chats ");
			deferred.reject(error);
		})
		return deferred.promise;
	}

	function sendMessage(obj, destinationChat){
		var deferred = $q.defer()
		var message = {
			timestamp : Date.now()/1000 | 0,
			from : auth.$getAuth().uid,
		}
		if(obj.text){
			message.content = obj.text;
		}
		if(obj.location){
			message.location = obj.location;
		}
		$firebaseArray(chatRef.child(destinationChat.$id).child("messages")).$add(message)
		.then(function(){
			deferred.resolve('send message successfully');
		})
		.catch(function(err){
			console.error('failed to send message ',err);
			deferred.reject('failed to send message');
		})
		return deferred.promise;
	}

}