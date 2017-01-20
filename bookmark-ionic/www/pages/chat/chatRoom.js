angular.module('bookmark.controllers')

.controller('chatRoomCtrl', function($q, $scope, $stateParams, $state, firebaseSrv) { 
	console.log('chatRoomCtrl - loaded')
	var vm = this;
	$scope.currentUser = $stateParams.currentUser;
	$scope.inputMessage = "";
	$scope.users = [];
	$scope.chatIcon = "";


	$q.all([firebaseSrv.getChat($stateParams.chatId), firebaseSrv.getUser()])
	.then(function(data){
		var chatObj = data[0]
		chatObj.$bindTo($scope, "chat");
		$scope.currentUser = data[1];

		var users = chatObj.users;
		angular.forEach(users, function(user){
			if(user.uid != $scope.currentUser.$id)
				$scope.users[$scope.users.length] = user;
		})
		console.log('chatting with ', $scope.users)
		if($scope.users.length > 1)
		{
			firebaseSrv.getProfilePicture("defaultGroupImage")
			.then(function(url){
				$scope.chatIcon = url
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
			if(user.uid != currentUser.$id)
				$scope.users[$scope.users.length] = user;
		})
		console.log('chatting with ', $scope.users)
	})

	$scope.goBack = function() {
	    $state.go('tab.chatList');
	};

	$scope.sendMessage = function(obj){
		console.log('inputMessage '+ $scope.inputMessage)
		firebaseSrv.sendMessage($scope.inputMessage, $scope.chat);
		$scope.inputMessage = "";
	}

	$scope.getProfilePicture = function(uid){
		for(var i = 0; i< $scope.chat.users.length; i++){
			if($scope.chat.users[i].uid == uid){
				return $scope.chat.users[i].profilePictureUrl
			}
		}
	} 

	function onProfilePicError(ele) {
	  this.ele.src = firebaseSrv.defaultImage; // set a fallback
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