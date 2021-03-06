angular.module('bookmark.controllers')

.controller('registerCtrl', function($scope, $cordovaOauth, firebaseSrv, constants, $firebaseObject, $firebaseAuth, $ionicHistory, $state) {
	console.log('registerCtrl - loaded')
	$scope.auth = firebaseSrv.auth;
	$scope.user;

	var vm = this;
	vm.email;
	vm.password;
	vm.errorMessage='';
	$scope.emailChosen = false;
	$scope.validateEmail = firebaseSrv.validateEmail
	$scope.count = 0;

	$scope.$on("$ionicView.beforeEnter", function(event, data){
	   // handle event
		vm.errorMessage='';
		$scope.fbLoggingIn = "no";
		$scope.gpLoggingIn = "no";
		$scope.emailLoggingIn = "no";
	});

	$scope.pressEmail =function(){
		if($scope.emailChosen)
			$scope.emailChosen=false;
		else
			$scope.emailChosen=true;
		vm.errorMessage=""
	}


  	firebaseSrv.auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser) {
        firebaseSrv.getUser()
        .then(function(user){
        	$scope.user = user;
        	console.log('REGISTER.js - loading user', $scope.user)
        	$state.go("tab.bookList")
        })
        .catch(function(error){
        	if(error == 'new user'){
        		console.log('new user')
        		$state.go("newUser")
        	}
        	else {
        		console.error('error getting user data ',error)
	    		vm.errorMessage = error;
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
	  	$scope.fbLoggingIn = "loading";
	  	if(ionic.Platform.isIOS() || ionic.Platform.isAndroid()){
	  		console.log('loging in with Facebook Oauth')
	  		$cordovaOauth.facebook(constants.facebookAppId, ["public_profile","email"])
	  		.then(function(result) {
	           console.log("Result "+JSON.stringify(result))
	           console.log('access token '+result.access_token)
	           var credential = firebase.auth.FacebookAuthProvider.credential(result.access_token);
	           $scope.auth.$signInWithCredential(credential).then(authSuccess).catch(authFail)
	           .finally(function(){
	           	$scope.fbLoggingIn = "finished";
	           })
			})
	  		.catch(function(error){
	  			console.log("Error -> " + error);
	  			$scope.fbLoggingIn = "error";
	  		})
	  	}
	  	else{
	  		$scope.fbLoggingIn = "loading";
	  		$scope.auth.$signInWithPopup("facebook").then(authSuccess).catch(authFail)
	  		.finally(function(){
	           	$scope.fbLoggingIn = "finished";
	        })
	  	}
  	}

  	$scope.googleLogin = function(){
  		$scope.gpLoggingIn = "loading";
  		if(ionic.Platform.isIOS() || ionic.Platform.isAndroid()){
  			console.log('loging in with Google Oauth')
	  		$cordovaOauth.google(constants.googleClientId, ["profile","email"])
	  		.then(function(result) {
	           console.log("Result "+JSON.stringify(result))
	            console.log('access token '+result.access_token)
	            var credential = firebase.auth.GoogleAuthProvider.credential(result.id_token);
	        	$scope.auth.$signInWithCredential(credential).then(authSuccess).catch(authFail)
	        	.finally(function(){
					$scope.gpLoggingIn = "finished";
				})
			})
			.catch(function(error) {
			    console.log("Error -> " + error);
			    $scope.gpLoggingIn = "error";
			});
  		}
  		else{
  			$scope.gpLoggingIn = "loading";
  			$scope.auth.$signInWithPopup("google").then(authSuccess).catch(authFail)
  			.finally(function(){
	           	$scope.gpLoggingIn = "finished";
	        })
  		}
  	}

  	$scope.devLogin = function(){
  		$scope.auth.$signInWithEmailAndPassword("testing@bookmark.com", "bookmark").then(authSuccess).catch(authFail);
  	}

  	$scope.emailLogin = function()
  	{
  		$scope.emailLoggingIn = "loading";
	  	console.log('email login '+ vm.email + " " + typeof vm.email)
		if(firebaseSrv.validateEmail(vm.email) && vm.password.length>=6)
		{
		  	$scope.auth.$signInWithEmailAndPassword(vm.email, vm.password).then(authSuccess).catch(authFail)
		  	.finally(function(){
		  		$scope.emailLoggingIn = "finished";
		  	})
		}
		else if(firebaseSrv.validateEmail(vm.email)==false)
		{
			vm.errorMessage = 'Invalid email'
			$scope.emailLoggingIn = "error";
		}
		else if(vm.password.length<6)
		{
			vm.errorMessage = "password must contain atleast 6 characters"
			$scope.emailLoggingIn = "error";
		}
	}

	$scope.emailRegister = function(){
		console.log('registering via email')
		$state.go("newUser")
		$scope.emailChosen = false;
	}

	$scope.clickText = function(){
		$scope.count++;
		console.log('count : '+$scope.count)
	}
})