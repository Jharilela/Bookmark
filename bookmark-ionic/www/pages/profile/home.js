angular.module('bookmark.controllers')

.controller('profileCtrl', function($q, $scope,$rootScope,$compile,$ionicActionSheet, $timeout,$ionicPopup,firebaseSrv, LocationService, tempStorageSrv, $firebaseObject, $firebaseAuth, $firebaseArray, $ionicLoading,$cordovaCamera,NgMap) {
  	console.log('profileCtrl - loaded')
    var vm = this;
  	$scope.auth = firebaseSrv.auth;
    $scope.wantToTakePicture = false;
  	$scope.user;
    $scope.newPicture;
    $scope.location1 = {};
    $scope.location2 = {};
    $scope.distance = "";
    $scope.isEditingInfo = false;
    $scope.userHaveProfilePicture = true;

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
      getUser();
      var getLocation = $rootScope.$on('location-changed profileHome', function(event, location){
        console.log('profileHome received change in address ',location)
        vm.mapCenter = [];
        vm.mapCenter.push(location.lat)
        vm.mapCenter.push(location.lng)
        $scope.user.location = location;
        $scope.saveUserInfo()
        getLocation();
      })
    });

    function getUser(){
      firebaseSrv.getUser()
      .then(function(userData){
        $scope.user = userData
        vm.mapCenter = [];
        vm.mapCenter.push(userData.location.lat)
        vm.mapCenter.push(userData.location.lng)

        console.log('HOME - loading user', $scope.user)
        firebaseSrv.userHaveProfilePicture($scope.user.$id)
        .then(function(value){
          console.log('userHaveProfilePicture : ',value)
          $scope.userHaveProfilePicture = value;
        })
      })
    }

    function changeProfilePictureStatus(){
      if($scope.user.hasProfilePicture){
        firebaseSrv.setUserProfileStatus(false)
        .then(function(){
          console.log('successfully changed userProfilePictrue status to ',false)
          getUser();
        })
        .catch(function(err){
          console.error('failed to change userProfilePictrue status to ',false)
        })
      }
      else{
        firebaseSrv.setUserProfileStatus(true)
        .then(function(){
          console.log('successfully changed userProfilePictrue status to ',true)
          getUser();
        })
        .catch(function(err){
           console.error('failed to change userProfilePictrue status to ',true)
        })
      }
    }

    $scope.editInformation = function(){
      if(!$scope.isEditingInfo){
        $scope.isEditingInfo = true;
      }
      else{
        $scope.isEditingInfo = false;
        getUser();
      }
    }

    $scope.saveUserInfo = function(){
      firebaseSrv.updateUserInfo($scope.user)
      .then(function(){
        console.log('successfully updated user information')
        $scope.isEditingInfo = false;
      })
      .catch(function(err){
        console.error('failed to update user info ',err)
      })
    }

   	function logout(){
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

    function deleteUser(){
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

    $scope.settings = function(){
      var settingButtons = [
         { text: ionic.Platform.isAndroid()?'<center class="home__settings-blue">Edit information</center>':'Edit information' },
         { text: ((ionic.Platform.isAndroid()?'<center class="home__settings-blue">':'') + ($scope.user.hasProfilePicture?'Remove picture':'Restore picture') + (ionic.Platform.isAndroid()?'</center>':''))},
         { text: ionic.Platform.isAndroid()?'<center class="home__settings-blue">Log out</center>':'Log out'}
       ];
      if(!$scope.userHaveProfilePicture)
       settingButtons.splice(1, 1);
      var hideSheet = $ionicActionSheet.show({
       titleText: ionic.Platform.isAndroid()?'<center>Settings</center>':'Settings',
       buttons: settingButtons,
       destructiveText: ionic.Platform.isAndroid()?'<center class="home__settings-red">Delete account</center>':'Delete account',
       cancelText: 'Cancel',
       cancel: function() {
            // add cancel code..
       },
       destructiveButtonClicked: function(){
        console.log('Deleting account')
        deleteUser();
       },
       buttonClicked: function(index) {
         console.log('button clicked : '+index)
         if(index == 0){
          $scope.editInformation();
         }
         else if($scope.userHaveProfilePicture && index==1){
          changeProfilePictureStatus();
         }
         else if((!$scope.userHaveProfilePicture && index==1) || index == 2){
          logout();
         }
         return true;
       }
     });

     // For example's sake, hide the sheet after two seconds
     $timeout(function() {
       hideSheet();
     }, 10000);
    }

   

    NgMap.getMap().then(function(map) {
        console.log('map ',map)
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
      });
})