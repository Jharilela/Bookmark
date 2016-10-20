angular.module('bookmark.controllers')
.controller('newUserCtrl', function($scope, $state, profileSrv, $firebaseObject, $ionicHistory) {
  	console.log('newUserCtrl - loaded')
  	var vm = this;
  	$scope.auth = profileSrv.auth;
  	$scope.errorMessage = "";
  	

  	$scope.goBack = function() {
	    $ionicHistory.goBack();
	};

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
		else if(!profileSrv.validateName(vm.user.firstName)){
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
		else if(!profileSrv.validateName(vm.user.lastName)){
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
		else if(!profileSrv.validateEmail(vm.user.email)){
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
		else if(!profileSrv.validatePhoneNumber(vm.user.phoneNumber)){
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

	$scope.save = function(){
		console.log('saving', vm.user)
		if($scope.validateFirstName() && $scope.validateLastName() && $scope.validateEmail() && $scope.validatePhoneNumber() && $scope.validateCountry()){
			$scope.errorMessage = "";
			console.log('no errorMessage')
			vm.user.provider = $scope.auth.$getAuth().providerData[0].providerId
			
			profileSrv.saveUser(vm.user)
			.then(function(){
				$state.go("tab.profile");
			})
			.catch(function(error){

			})
		}
	}
})