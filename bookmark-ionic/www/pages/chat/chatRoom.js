angular.module('bookmark.controllers')

.controller('chatRoomCtrl', function($rootScope, $timeout, $q,$ionicScrollDelegate, $ionicHistory, $scope, $stateParams, $state,$ionicModal, firebaseSrv) { 
	console.log('chatRoomCtrl - loaded')
	var vm = this;
	$scope.currentUser = $stateParams.currentUser;
	vm.inputMessage = {};
	vm.inputMessage.text = "";
	$scope.users = [];
	$scope.chatIcon = "";
	$scope.hasInactiveUsers = false;
	$scope.showDates = {};
	$scope.footerHeight = "44px";
	$scope.inputFooterHeight = "44px";

	$scope.scrollToBottom = function() {
		$timeout(function(){
			$ionicScrollDelegate.$getByHandle('chatRoomScroll').scrollBottom();
		}, 1);
	};

	function resizeFooter(){
		var taHeight = document.querySelector('#inputTextArea').style.height;
		var currentHeight = parseInt(taHeight.substring(0,taHeight.indexOf('px')))
		$scope.inputFooterHeight = (currentHeight<=100?(currentHeight+5):105);
		$scope.footerHeight = $scope.inputFooterHeight +(vm.inputMessage.location?100:0)+'px';
		$scope.inputFooterHeight += 'px';
		console.log('textarea height updated ',$scope.footerHeight);
		$scope.scrollToBottom();
	}

	$('textarea').each(function(){
		autosize(this);
	}).on('autosize:resized', function(e){
		if(document.querySelector('#inputTextArea')){
			resizeFooter();
		}
		else{
			$scope.scrollToBottom();
		}
	});

	$scope.$on("$ionicView.enter", function(event, data){
		var getLocation = $rootScope.$on('location-changed chatRoom', function(event, location){
			console.log('chatRoom received change in address ',location)
			var arr = []
			arr.push(location.lat);
			arr.push(location.lng);
			location.center = arr
			vm.inputMessage.location = location;
			resizeFooter();

			getLocation();
		})
	});

	$q.all([firebaseSrv.getChat($stateParams.chatId), firebaseSrv.getUser()])
	.then(function(data){
		var chatObj = data[0]
		chatObj.$bindTo($scope, "chat");
		$scope.currentUser = data[1];

		chatObj.$watch(function(event) {
		  $scope.scrollToBottom();
		});

		var users = chatObj.users;
		console.log('chat ',chatObj)
		angular.forEach(users, function(user){
			if(user.uid != $scope.currentUser.$id){
				$scope.users[$scope.users.length] = user;
			}
			if(user.isActive==false){
				$scope.hasInactiveUsers = true;
			}
		})
		console.log('chatting with 1 : ', $scope.users)
		if($scope.users.length > 1)
		{
			firebaseSrv.getProfilePicture("defaultGroupImage")
			.then(function(url){
				$scope.chatIcon = url
				angular.forEach($scope.users, function(user, key){
					firebaseSrv.getProfilePicture(user.uid)
					.then(function(url){
						user.profilePictureUrl = url;
					})
				})
			})
			.catch(function(err){
				$scope.chatIcon = firebaseSrv.defaultGroupImage;
				console.err("failed to load group chat icon from the chatObj")
			})
		}
		else
		{
			firebaseSrv.getProfilePicture($scope.users[0].uid)
			.then(function(url){
				$scope.chatIcon = url;
				$scope.users[0].profilePictureUrl = url;
			})
			.catch(function(err){
				$scope.chatIcon = firebaseSrv.defaultPersonImage;
				console.err("failed to load chat Icon image from the user's profile photo")
			})
		}
		$scope.scrollToBottom();
	})
	.catch(function(err){
		console.log("failed to load chat");
		$scope.chat= [];
	})
	.finally(function(){
		var users = $scope.chat.users;
		angular.forEach($scope.users, function(user){
			if(user.uid != currentUser.$id){
				firebaseSrv.getProfilePicture(user.uid)
				.then(function(url){
					user.profilePictureUrl = url;
					$scope.users[$scope.users.length] = user;
				})
			}
		})
		console.log('chatting with 2 : ', $scope.users)
	})

	$scope.goBack = function() {
		// $ionicHistory.goBack();
	    $state.go('tab.chatList');
	};

	$scope.goToProfile = function(user){
		console.log('user', user)
		if(!user.profilePictureUrl){
			user.profilePictureUrl = $scope.getProfilePicture(user.uid)
		}
		$state.go('userProfile', {user : user})
	}

	$scope.sendMessage = function(obj){
		console.log('sending message ', vm.inputMessage)
		firebaseSrv.sendMessage(vm.inputMessage, $scope.chat)
		.then(function(){
			firebaseSrv.sendNotification($scope.currentUser.firstName+" "+$scope.currentUser.lastName, vm.inputMessage.text, $scope.users[0].uid)
			delete vm.inputMessage;
			vm.inputMessage = {};
			vm.inputMessage.text = "";
			document.querySelector('textarea').style.height = '35px';
			resizeFooter();
		})
	}

	$scope.getProfilePicture = function(uid){
		for(var i = 0; i< $scope.users.length; i++){
			if($scope.users[i].uid == uid){
				return $scope.users[i].profilePictureUrl
			}
		}
	} 

	$scope.removeLocation = function(){
		delete vm.inputMessage.location;
		resizeFooter();
	}

	$scope.viewUser = function(){
		$state.go("userProfile",{user : user})
	}

	function onProfilePicError(ele) {
	  this.ele.src = firebaseSrv.defaultImage; // set a fallback
	}

	$scope.showModal = function(userId) {
		console.log('viewing picture of ',userId)
		if(userId == $scope.chatIcon){
			$scope.viewPicture = $scope.chatIcon
		}
		else{
			angular.forEach($scope.users, function(user){
				if(user.uid == userId)
					$scope.viewPicture = user.profilePictureUrl;
			})
		}
		var templateUrl = 'directives/viewProfilePicture.html'
		$ionicModal.fromTemplateUrl(templateUrl, {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
			$scope.modal.show();
		});
	}

	$scope.showDate = function(message)
	{
		$scope.showDates[message.$id] = true;
	}

	$scope.pressLocation = function(location){
		if(location){
			$state.go('location', {location : [location], editable : false})
		}
		else{
			console.log('location is pressed')
			var locations = [];
			locations.push($scope.currentUser.location)
			angular.forEach($scope.users, function(user){
				firebaseSrv.getAnotherUser(user.uid)
				.then(function(userData){
					locations.push(userData.location)
				})
			})
			$state.go('location', {location : locations})
		}
	}

	// Close the modal
	$scope.closeModal = function() {
		$scope.modal.hide();
		$scope.modal.remove()
	}
})
// fitlers
.filter('nl2br', ['$filter',
  function($filter) {
    return function(data) {
      if (!data) return data;
      return data.replace(/\n\r?/g, '<br />');
    };
  }
])