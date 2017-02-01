angular.module('bookmark.controllers')

.controller('chatRoomCtrl', function($q,$ionicHistory, $scope, $stateParams, $state,$ionicModal, firebaseSrv) { 
	console.log('chatRoomCtrl - loaded')
	var vm = this;
	$scope.currentUser = $stateParams.currentUser;
	$scope.inputMessage = "";
	$scope.users = [];
	$scope.chatIcon = "";
	$scope.hasInactiveUsers = false;

	$q.all([firebaseSrv.getChat($stateParams.chatId), firebaseSrv.getUser()])
	.then(function(data){
		var chatObj = data[0]
		chatObj.$bindTo($scope, "chat");
		$scope.currentUser = data[1];

		var users = chatObj.users;
		console.log('users ',users)
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

	$scope.sendMessage = function(obj){
		console.log('inputMessage '+ $scope.inputMessage)
		firebaseSrv.sendMessage($scope.inputMessage, $scope.chat);
		$scope.inputMessage = "";
	}

	$scope.getProfilePicture = function(uid){
		for(var i = 0; i< $scope.users.length; i++){
			if($scope.users[i].uid == uid){
				return $scope.users[i].profilePictureUrl
			}
		}
	} 

	$scope.viewUser = function(){
		$state.go("userProfile",{user : user})
	}

	function onProfilePicError(ele) {
	  this.ele.src = firebaseSrv.defaultImage; // set a fallback
	}

	$scope.showModal = function() {
		var templateUrl = 'directives/viewProfilePicture.html'
		$ionicModal.fromTemplateUrl(templateUrl, {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
			$scope.modal.show();
		});
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
]);