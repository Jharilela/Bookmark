angular.module('bookmark.controllers')
.controller('newUserCtrl', function($scope, $state, firebaseSrv, $firebaseObject, $ionicHistory, $q) {
  	console.log('newUserCtrl - loaded')
  	var vm = this;
  	$scope.auth = firebaseSrv.auth;
  	$scope.errorMessage = "";
  	$scope.step = 1;
    $scope.profilePicture='';


	firebaseSrv.auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser) {
      	$scope.createNewUser = false;
      	firebaseSrv.getProfilePicture("defaultPersonImage")
		   .then(function(url){
		   	$scope.profilePicture = url
		   })
		   .catch(function(error){

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

	$scope.finish = function(){
		$state.go("tab.profile");
		$scope.step=1;
		vm.user={};
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
		if ($scope.isEmpty(vm.user.country, "Country")) {
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
					saveUser();
				})
			}
			else{
				saveUser();
			}
		}
	}

	function saveUser(){
		vm.user.provider = $scope.auth.$getAuth().providerData[0].providerId
		vm.user.type = "individual"
		delete vm.user.password;
		firebaseSrv.saveUser(vm.user)
		.finally(function(){
			$scope.step+=1;
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
	  			console.err("error creating new user")
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