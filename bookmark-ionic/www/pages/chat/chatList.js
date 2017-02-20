angular.module('bookmark.controllers')

.controller('chatListCtrl', function($scope, $q,  firebaseSrv) { 
	console.log('chatListCtrl - loaded')
	var vm = this;
	$scope.currentUser;
	$scope.showSearch = false;	
	$scope.inputText = "";
	$scope.bookmarkUsers = [];
	$scope.chatUsers = [];
	$scope.loading = true;

	// $scope.$on("$ionicView.beforeEnter", function(event, data){
	    firebaseSrv.auth.$onAuthStateChanged(function(firebaseUser) 
	    {
			if (firebaseUser) 
			{
				$q.all([firebaseSrv.getUser(), firebaseSrv.getChatRooms()])
				.then(function(data)
				{
					$scope.currentUser = data[0];
					$scope.currentUser.fullName = data[0].firstName + " " + data[0].lastName;
					console.log("currentUser " , $scope.currentUser);

					$scope.chats = data[1].chatRooms;
					var chatRef = data[1].chatRoomsRef;
					$scope.loading = false;
					console.log("userChats", data[1]);
					assignUsers();

					chatRef.$watch(function(event){
						$scope.loading = true;
						firebaseSrv.getChatRooms()
						.then(function(userChats){
							$scope.chats = userChats.chatRooms;
							assignUsers();
							$scope.loading = false;
						})
						.catch(function(err){
							console.log("error obtaining changed chats")
						})
					})

				})
				.catch(function(error){
					console.log("error retreiving users chats")
				})
			}
			else 
			{
			    console.log("no user")
			}
		})
	// });

	function assignUsers(){
		$scope.chatUsers = [];
		$scope.chats.sort(dynamicSortMultiple("-latestMessageTimestamp"));
		angular.forEach($scope.chats, function(chatObj, key){
			chatObj.visible = true;
			var users = chatObj.users;
			var userArray = [];

			angular.forEach(users, function(user){
				if(user.uid != $scope.currentUser.$id)
					userArray[userArray.length] = user;
			})
			if(userArray.length > 1)
			{
				firebaseSrv.getProfilePicture("defaultGroupImage")
				.then(function(url){
					$scope.chats[key].icon = url
				})
				.catch(function(err){
					$scope.chats[key].icon = firebaseSrv.defaultGroupImage;
					console.error("failed to load group chat icon from the chatObj")
				})
			}
			else
			{
				$scope.chatUsers[$scope.chatUsers.length] = userArray[0];
				firebaseSrv.getProfilePicture(userArray[0].uid)
				.then(function(url){
					$scope.chats[key].icon = url;
				})
				.catch(function(err){
					$scope.chats[key].icon = firebaseSrv.defaultPersonImage;
					console.error("failed to load chat Icon image from the user's profile photo")
				})
			}
		})
	}

	$scope.newChat = function(user){
		console.log("user ",user)
		$scope.loading = true;
		firebaseSrv.newChat([user])
		.then(function(chat){
			console.log("chat created", chat)
		})
		.catch(function(error){
			console.log("failed to initiate newChat ", error)
		})
	}

	$scope.pressSearchButton = function()
	{
		if($scope.showSearch == true)
		{
			$scope.showSearch = false;
			$scope.bookmarkUsers = [];
			$scope.inputText = "";
			makeChatsVisible();
		}
		else
		{
			$scope.showSearch = true;
		}
	}

	function makeChatsVisible(){
		angular.forEach($scope.chats, function(chat, key){
			chat.visible = true;
		})
	}

	$scope.searching = function()
	{
		if($scope.inputText)
		{
			firebaseSrv.searchUser($scope.inputText)
			.then(function(bookmarkUsers){
				$scope.bookmarkUsers = [];
				
				angular.forEach(bookmarkUsers, function(bookmarkUser, key1){
					var found = false;
					angular.forEach($scope.chatUsers, function(chatUser, key2){
						if(bookmarkUser.$id == chatUser.uid)
							found = true;
					})
					if(!found)
						$scope.bookmarkUsers[$scope.bookmarkUsers.length] = bookmarkUser;
				})
				angular.forEach($scope.bookmarkUsers, function(bookmarkUser, key){
					firebaseSrv.getProfilePicture(bookmarkUser.$id)
					.then(function(url){
						bookmarkUser.profilePictureUrl = url;
					})
					.catch(function(err){
						console.error("failed to fetch user's profile Picture");
					})
				})
				console.log('bookmarkUsers after filtering', $scope.bookmarkUsers)
			})
			angular.forEach($scope.chats, function(chat, key1){
				var found = false;
				angular.forEach(chat.users, function(user, key2){
					if(user.name.substring(0,$scope.inputText.length).toLowerCase() == $scope.inputText.toLowerCase() && user.uid != $scope.currentUser.$id)
						found = true;
				})
				if(found){
					chat.visible = true;
				}
				else{
					chat.visible = false;
				}
			})
		}
		else
		{
			$scope.bookmarkUsers = [];
			makeChatsVisible();
		}
	}

	$scope.openChat = function(chat){
		console.log('going to chat ', chat);
	}

	vm.containsActiveUsers = function(chat){
		var hasActiveUsers = true;
		angular.forEach(chat.users, function(user,key){
			if(user.isActive==false)
				hasActiveUsers = false;
		})
		return hasActiveUsers;
	}
})
