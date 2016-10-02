angular.module('bookmark.controllers')

.controller('registerCtrl', function($scope, profileSrv, $firebaseObject, $firebaseAuth, $ionicHistory) {
  console.log('registerCtrl - loaded')
  $scope.auth = profileSrv.auth;
  $scope.user;

  var vm = this;
  vm.email;
  vm.password;
  vm.errorMessage='';
  $scope.validateEmail = profileSrv.validateEmail

	$scope.goBack = function() {
	    $ionicHistory.goBack();
	  };

	function authSuccess(authData) {
	    console.log("Authenticated successfully with payload:", authData);
	    if(authData.user!=null)
		    $scope.user = authData.user.providerData[0];
		else
			$scope.user = authData.providerData[0];
	}
	function authFail(error){
		console.log("Login Failed!", error);
	    vm.errorMessage = error.message;
	}

  	$scope.fbLogin = function(){
	  	// login with Facebook
	  	$scope.auth.$signInWithPopup("facebook").then(authSuccess).catch(authFail);
  	}

  	$scope.googleLogin = function(){
  		$scope.auth.$signInWithPopup("google").then(authSuccess).catch(authFail);
  	}

  	$scope.devLogin = function(){
  		$scope.auth.$signInWithEmailAndPassword("testing@bookmark.com", "bookmark").then(authSuccess).catch(authFail);
  	}

  	$scope.emailLogin = function()
  	{
	  	console.log('email login '+ vm.email + " " + typeof vm.email)
		if(profileSrv.validateEmail(vm.email) && vm.password.length>=6)
		{
		  	$scope.auth.$signInWithEmailAndPassword(vm.email, vm.password).then(authSuccess).catch(authFail);
		}
		else if(profileSrv.validateEmail(vm.email)==false)
		{
			vm.errorMessage = 'Invalid email'
		}
		else if(vm.password.length<6)
		{
			vm.errorMessage = "password must contain atleast 6 characters"
		}
	}

	$scope.emailRegister = function(){
	  	console.log('email register')
	  	if(profileSrv.validateEmail(vm.email) && vm.password.length>=6)
		{
	  		$scope.auth.$createUserWithEmailAndPassword(vm.email, vm.password).then(authSuccess).catch(authFail);
		}
		else if(profileSrv.validateEmail(vm.email)==false)
		{
			vm.errorMessage = 'Invalid email'
		}
		else if(vm.password.length<6)
		{
			vm.errorMessage = "password must contain atleast 6 characters"
		}
	}
})