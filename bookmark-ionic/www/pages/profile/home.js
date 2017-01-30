angular.module('bookmark.controllers')

.controller('profileCtrl', function($scope,$ionicActionSheet, $timeout,$ionicPopup,firebaseSrv, LocationService, tempStorageSrv, $firebaseObject, $firebaseAuth, $firebaseArray, $ionicLoading,$cordovaCamera) {
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
      var hideSheet = $ionicActionSheet.show({
       titleText: 'Settings',
       buttons: [
         { text: 'Edit information' },
         { text: $scope.user.hasProfilePicture?'Remove picture':'Restore picture'},
         { text: 'Log out' }
       ],
       destructiveText: 'Delete account',
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
         else if(index==1){
          changeProfilePictureStatus();
         }
         if(index == 2){
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

    $scope.$on('location-changed', function(evt, args){
        $scope.location = args.location
        console.log('indexOf ', $scope.location.formatted_address.indexOf($scope.location.name))
        if($scope.location.formatted_address.indexOf($scope.location.name)==-1)
          $scope.location.address = $scope.location.name + ($scope.location.formatted_address?", ":"") +$scope.location.formatted_address
        else
          $scope.location.address = $scope.location.formatted_address

        for(var i = 0; i<$scope.location.address_components.length; i++){
          for(var j=0; j<$scope.location.address_components[i].types.length; j++){
            if($scope.location.address_components[i].types[j] == "country"){
              $scope.location.country = $scope.location.address_components[i].long_name
              $scope.location.country_short = $scope.location.address_components[i].short_name
            }
          }
        }

        if(isEmpty($scope.location.country,"") && !isEmpty($scope.location.country_short,"")){
          for(var i =0; i< $scope.countryList.length; i++){
            if($scope.countryList[i].code == $scope.location.country_short){
              $scope.location.country = $scope.countryList[i].name;
              break;
            }
        }
        }
        else if(isEmpty($scope.location.country,"") && isEmpty($scope.location.country_short,"")){
          var possibleCountries = []
          for(var i =0; i< $scope.countryList.length; i++){
            // console.log("comparing 1:"+$scope.location.address+" 2:"+$scope.countryList[i].name+" index: "+$scope.location.address.indexOf($scope.countryList[i].name))
            if($scope.location.address.indexOf($scope.countryList[i].name)!=-1){
              possibleCountries[possibleCountries.length] = {
                index : $scope.location.address.indexOf($scope.countryList[i].name),
                name : $scope.countryList[i].name
              }
            }
        }
        possibleCountries.sort(dynamicSortMultiple("-index"))
        console.log('possibleCountries', possibleCountries)
        if(possibleCountries.length>0){
          $scope.location.country = possibleCountries[0].name;
        }
      }

        console.log('location ',$scope.location);
        var address = {
          lat : $scope.location.geometry.location.lat(),
          lng : $scope.location.geometry.location.lng(),
          address : $scope.location.address,
          country : $scope.location.country
        }
        $scope.user.location = address;
    })
})