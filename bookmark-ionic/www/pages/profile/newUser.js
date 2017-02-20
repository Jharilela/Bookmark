angular.module('bookmark.controllers')
.controller('newUserCtrl', function($scope,$rootScope, $state,countryList, firebaseSrv, $firebaseObject, $ionicHistory, $q) {
  	console.log('newUserCtrl - loaded')
  	var vm = this;
  	$scope.auth = firebaseSrv.auth;
  	vm.user = {};
  	vm.user.location={};
  	$scope.errorMessage = "";
    $scope.location = {};

    countryList.get().then(function(countryList){
    	$scope.countryList = countryList.data
    })

    $scope.$on("$ionicView.enter", function(event, data){
	   // handle event
	    $scope.step = 1;
	    // vm.user={};
	    var auth = $scope.auth.$getAuth()
	    console.log('$scope.auth ',$scope.auth.$getAuth())
	    console.log('scope.step ', $scope.step)

	    if(auth){
	    	if(auth.email)
		    	vm.user.email = auth.email
		    if(auth.providerData[0].email)
		    	vm.user.email = auth.providerData[0].email
		    if(auth.providerData[0].displayName){
		    	var name = breakName(auth.providerData[0].displayName)
		    	if(name.firstName)
			    	vm.user.firstName = name.firstName
			    if(name.lastName)
			    	vm.user.lastName = name.lastName
		    }
		    if(auth.displayName){
		    	var name = breakName(auth.displayName)
		    	if(name.firstName)
			    	vm.user.firstName = name.firstName
			    if(name.lastName)
			    	vm.user.lastName = name.lastName
		    }
	    }

        var getLocation = $rootScope.$on('location-changed newUser', function(event, location){
	        console.log('newUser received change in address ',location)
	        vm.user.location = location;

	        getLocation();
	    })
	});

	firebaseSrv.auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser) {
      	$scope.createNewUser = false;
      	firebaseSrv.getProfilePicture("defaultPersonImage")
		   .then(function(url){
		   	$scope.profilePicture = url
		   })
		   .catch(function(error){
		   	$scope.profilePicture='';
		   })
      } 
      else {
        $scope.createNewUser = true;
      } 
    });

  	$scope.goBack = function() {
  		if($scope.step == 1)
		    $ionicHistory.goBack();
		else if($scope.step == 2)
			$scope.step = 1;
	};

	$scope.display = function(){
		console.log('ng-option : ', vm.user.location.country)
	}


	$scope.takePicture = function(source){
		firebaseSrv.takePicture(source)
		.then(function(url){
			$scope.profilePicture = url;
		})
		.cannot(function(err){
			console.error('cannot update profiile picture')
		})
	}

	$scope.isEmpty = function(value, def){
		if(value == null || value == '' || value==" "){
			if(def !== "")
				$scope.errorMessage = def+" cannot be empty"
			return true;
		}
		else{
			return false;
		}
	} 

	$scope.validateFirstName = function(){
		if($scope.isEmpty(vm.user.firstName, "First name")){
			return false;
		}
		else if(!firebaseSrv.validateName(vm.user.firstName)){
			$scope.errorMessage = "First name cannot contain numbers or unique characters"
			return false;
		}
		else{
			return true;
		}
	}

	$scope.validateLastName = function(){
		if($scope.isEmpty(vm.user.lastName, "Last name")){
			return false;
		}
		else if(!firebaseSrv.validateName(vm.user.lastName)){
			$scope.errorMessage = "Last cannot contain numbers or unique characters"
			return false;
		}
		else{
			return true;
		}
	}

	$scope.validateEmail = function(){
		if($scope.isEmpty(vm.user.email, "Email")){
			return false;
		}
		else if(!firebaseSrv.validateEmail(vm.user.email)){
			$scope.errorMessage = "Invalid email"
			return false;
		}
		else{
			return true;
		}
	}

	$scope.validatePhoneNumber = function(){
		if($scope.isEmpty(vm.user.phoneNumber, "Phone Number")){
			return false;
		}
		else if(!firebaseSrv.validatePhoneNumber(vm.user.phoneNumber)){
			$scope.errorMessage = "Invalid phone number"
			return false;
		}
		else{
			return true;
		}
	}
	$scope.validateCountry = function(){
		if ($scope.isEmpty(vm.user.location.country, "Country")) {
			return false;
		}
		else if($scope.isEmpty(vm.user.location.address, "Address")){
			return false;
		}
		else{
			return true;
		}
	}

	$scope.validatePassword = function(){
		if ($scope.createNewUser && $scope.isEmpty(vm.user.password, "password")) {
			return false
		}
		else if($scope.createNewUser && vm.user.password.length<6){
			$scope.errorMessage = "password must contain atleast 6 characters"
			return false;
		}
		else{
			return true;
		}
	}

	$scope.saveData = function(){
		console.log('saving', vm.user)
		if(!vm.user){
			$scope.errorMessage = "Please enter your details";
		}
		else if($scope.validateFirstName() && $scope.validateLastName() && $scope.validateEmail() && $scope.validatePhoneNumber() && $scope.validateCountry() && $scope.validatePassword()){
			$scope.errorMessage = "";
			console.log('no errorMessage')
			if($scope.createNewUser){
				emailRegister()
				.then(function(authData){
					vm.user.hasProfilePicture = false;
					$scope.step = 2;
				})
			}
			else{
				$scope.step = 2;
			}
		}
	}

	$scope.saveUser = function(){
		vm.user.provider = $scope.auth.$getAuth().providerData[0].providerId
		vm.user.type = "individual"
		delete vm.user.password;
		console.log('NEWUSER - saving user data ',vm.user)
		firebaseSrv.saveUser(vm.user)
		.then(function(log){
			console.log('saved user data successfully \n',log)
			$state.go("tab.profile");
			$scope.step = 1;
			vm.user = {};
		})
		.catch(function(err){
			console.error('failed to save user data \n',err)
		})
	}

	function emailRegister(){
	  	console.log('email register')
	  	var deffered = $q.defer();
	  	if(firebaseSrv.validateEmail(vm.user.email) && vm.user.password.length>=6)
		{
	  		$scope.auth.$createUserWithEmailAndPassword(vm.user.email, vm.user.password)
	  		.then(function(authData){
	  			console.log('created new user successfully')
	  			deffered.resolve(authData)
	  		})
	  		.catch(function(error){
	  			console.error("error creating new user")
	  			deffered.reject(error)
	  		});
		}
		else if(firebaseSrv.validateEmail(vm.user.email)==false)
		{
			$scope.errorMessage = 'Invalid email'
			deffered.reject();
		}
		else if(vm.user.password.length<6)
		{
			$scope.errorMessage = "password must contain atleast 6 characters"
			deffered.reject();
		}
		return deffered.promise;
	}
})