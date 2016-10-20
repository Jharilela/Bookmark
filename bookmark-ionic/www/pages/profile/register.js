angular.module('bookmark.controllers')

.controller('registerCtrl', function($scope, $cordovaOauth, profileSrv, constants, $firebaseObject, $firebaseAuth, $ionicHistory, $state) {
	console.log('registerCtrl - loaded')
	$scope.auth = profileSrv.auth;
	$scope.user;

	var vm = this;
	vm.email;
	vm.password;
	vm.errorMessage='';
	$scope.validateEmail = profileSrv.validateEmail

	$scope.$on("$ionicView.beforeEnter", function(event, data){
	   // handle event
	   vm.errorMessage='';
	});


  	profileSrv.auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser) {
        profileSrv.getUser()
        .then(function(user){
        	$scope.user = user;
        	$state.go("tab.bookList")
        	console.log('loading user', $scope.user)
        })
        .catch(function(error){
        	if(error=="new user"){
        		$state.go("newUser")
        	}
        	else{
        		$scope.errorMessage = error;
        	}
        })
      } 
      else {
        console.log("Signed out");
      } 
    });

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
	  	if(ionic.Platform.isIOS()){
	  		console.log('loging in with Facebook Oauth')
	  		$cordovaOauth.facebook(constants.facebookAppId, ["email"])
	  		.then(function(result) {
	           console.log("Result "+JSON.stringify(result))
	           console.log('access token '+result.access_token)
	           var credential = firebase.auth.FacebookAuthProvider.credential(result.access_token);
	           $scope.auth.$signInWithCredential(credential).then(authSuccess).catch(authFail);
			})
	  		.catch(function(error){
	  			console.log("Error -> " + error);
	  		})
	  	}
	  	else{
	  		$scope.auth.$signInWithPopup("facebook").then(authSuccess).catch(authFail);
	  	}
  	}

  	$scope.googleLogin = function(){
  		if(ionic.Platform.isIOS()){
  			console.log('loging in with Google Oauth')
	  		$cordovaOauth.google(constants.googleClientId, ["email"])
	  		.then(function(result) {
	           console.log("Result "+JSON.stringify(result))
	            console.log('access token '+result.access_token)
	            var credential = firebase.auth.GoogleAuthProvider.credential(result.id_token);
	        	$scope.auth.$signInWithCredential(credential).then(authSuccess).catch(authFail);
			})
			.catch(function(error) {
			    console.log("Error -> " + error);
			});
  		}
  		else{
  			$scope.auth.$signInWithPopup("google").then(authSuccess).catch(authFail);
  		}
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