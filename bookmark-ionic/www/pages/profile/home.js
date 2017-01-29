angular.module('bookmark.controllers')

.controller('profileCtrl', function($scope,$ionicPopup,firebaseSrv, LocationService, tempStorageSrv, $firebaseObject, $firebaseAuth, $firebaseArray, $ionicLoading,$cordovaCamera) {
  	console.log('profileCtrl - loaded')
    var vm = this;
  	$scope.auth = firebaseSrv.auth;
    $scope.wantToTakePicture = false;
  	$scope.user;
    $scope.newPicture;
    $scope.location1 = {};
    $scope.location2 = {};
    $scope.distance = "";

    vm.width = window.innerWidth;
    vm.height = window.innerHeight;
    vm.editWidth = (vm.width/2)-100;
    vm.cameraWidth = (vm.width/2)-176
    vm.cancelWidth = (vm.width/2) - 36;
    vm.galleryWidth = (vm.width/2)-176;

    console.log('width : '+vm.width+" , height : "+vm.height);

    $scope.takePicture = function(source){
      firebaseSrv.takePicture(source)
      .then(function(url){
        $scope.user.profilePictureUrl = url;
      })
      .catch(function(err){

      })
    }

    $scope.$on("$ionicView.enter", function(event, data){
       firebaseSrv.auth.$onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {
          getUser();
        } else {
          console.log("Signed out");
        } 
      });
    });

    function getUser(){
      firebaseSrv.getUser()
      .then(function(userData){
        $scope.user = userData
        console.log('HOME - loading user', $scope.user)
      })
    }

   	$scope.logout = function(){
  	console.log('logout initiated')
  	firebaseSrv.auth.$signOut()
  		.then(function(){
	  		console.log('logged out', $scope.auth.$getAuth())
	  		$scope.user = null;
  		})
	  	.catch(function(error){
	  		console.log('error to logout', error)
	  	})
  	}

    $scope.deleteUser = function(){
      var confirmPopup = $ionicPopup.confirm({
       title: '<font color="#ef473a">Delete user</font>',
       okType : 'button-assertive',
       template: '<center>Do you want to delete your account?<br>This action is not be recverable</center>'
      });

      confirmPopup.then(function(res) {
       if(res) {
         firebaseSrv.deleteUser()
       }
      });
    }
})