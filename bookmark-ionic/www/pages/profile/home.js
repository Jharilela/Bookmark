angular.module('bookmark.controllers')

.controller('profileCtrl', function($scope,firebaseSrv, LocationService, tempStorageSrv, $firebaseObject, $firebaseAuth, $firebaseArray, $ionicLoading,$cordovaCamera) {
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

    $scope.$on('location-changed', function(evt, args){
      if(!$scope.location1.geometry){
        $scope.location1 = args.location
      }
      else{
        $scope.location2 = args.location
        console.log('location1 ',$scope.location1);
        console.log('location2 ', $scope.location2);
        var position1 = {}; var position2={};
        position1.lat = $scope.location1.geometry.location.lat()
        position1.lng = $scope.location1.geometry.location.lng()
        position2.lat = $scope.location2.geometry.location.lat()
        position2.lng = $scope.location2.geometry.location.lng()
        console.log('location1 lat', position1.lat)
        console.log('location1 lng', position1.lng)
        console.log('location2 lat', position2.lat)
        console.log('location2 lng', position2.lng)
        $scope.distance = LocationService.calculateDistance(position1, position2)
        $scope.distance = Math.round($scope.distance);
        console.log('distance ', $scope.distance);
      }
    })

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
        console.log('loading user', $scope.user)
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
})