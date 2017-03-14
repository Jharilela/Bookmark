angular.module('bookmark.controllers')
.controller('locationCtrl', function($scope, NgMap, LocationService, $stateParams, $rootScope, $timeout, $ionicHistory) {
  console.log('locationCtrl Loaded ', $stateParams);
  var vm = this;
  $scope.search = {};
  $scope.search.suggestions = [];
  $scope.zoom = 11;
  $scope.markerPositions = [];
  vm.markers = [];
  $scope.circlePositions = [];
  $scope.search.query = "";
  var first = 0;
  var choose = 0;
  $scope.editable = $stateParams.editable;

  $scope.$on("$ionicView.enter", function(event, data){
     // handle event
     console.log("State Params: ", data.stateParams);
  });

  function init(refresh){
    if($stateParams.location){
      if($stateParams.location.length == 1){
        var location = $stateParams.location[0]
        first = 1;
        if(refresh){
          assignCenter(location);
          $scope.search.query = location.address;
        }
        assignShapes([location], "marker")
      }
      else if($stateParams.location.length>1){
        if(refresh){
          var totalLat=0, totalLng=0;
          angular.forEach($stateParams.location, function(location){
            totalLat += location.lat;
            totalLng += location.lng;
          })
          var avgLat = totalLat/$stateParams.location.length;
          var avgLng = totalLng/$stateParams.location.length;
          assignCenter({lat : avgLat, lng: avgLng})  
        }
        assignShapes($stateParams.location, "circle")
        $scope.zoom = 13;
      }
    }
    else{
      if(refresh){
        var initPosition = {lat : 22.2783151, lng:114.17469499999993};
        assignCenter(initPosition);
      }
    }
  }
  

  $scope.$watch('search.query', function(newValue) {
    if(first == 0){
      if(choose == 0){
         if (newValue) {
          LocationService.searchAddress(newValue).then(function(result) {
            $scope.search.error = null;
            $scope.search.suggestions = result;
          }, function(status){
            $scope.search.error = "There was an error :( " + status;
          });
        };
      }
      else{
        choose = 0;
      }
    }
    else{
      first = 0;
    }
  });

  $scope.close = function() {
    resetMarkers();
    delete vm.markers;
    $ionicHistory.goBack();
  };
  $scope.finish = function(){
    if(vm.address){
      console.log('sending location to '+$ionicHistory.backTitle())
      if($ionicHistory.backTitle() == "chatRoom"){
        $rootScope.$broadcast('location-changed chatRoom', vm.address)
      }
      else if($ionicHistory.backTitle() == "profileHome"){
        $rootScope.$broadcast('location-changed profileHome', vm.address)
      }
      else if($ionicHistory.backTitle() == "newUser"){
        $rootScope.$broadcast('location-changed newUser', vm.address)
      }
    }
    $scope.close();
  }

  $scope.choosePlace = function(place) {
    LocationService.getDetails(place.place_id)
    .then(function(location) {
      $scope.location = location;
      $scope.search.suggestions = [];
      changeLocation(location);
    });
  };

  function assignCenter(location){
     $scope.centerPosition = [];
     $scope.centerPosition.push(location.lat)
     $scope.centerPosition.push(location.lng)
     console.log('assigning center',$scope.centerPosition)
  }

  function assignShapes(locations, shape){
    console.log('assigning ',shape)
    angular.forEach(locations, function(location){
      var arr = [];
      arr.push(location.lat);
      arr.push(location.lng);
      if(shape == "marker"){
        var marker = new google.maps.Marker({
          position : {
            lat : location.lat,
            lng : location.lng
          },
          map : $scope.map
        })
        vm.markers.push(marker)
      }
      if(shape == "circle"){
        $scope.circlePositions[$scope.circlePositions.length] = arr;
      }
    })
  }
  function resetMarkers(){
    angular.forEach(vm.markers, function(marker){
      marker.setMap(null);
    })
  };
  function resetCircles(){$scope.circlePositions=[]};
  
  NgMap.getMap({id:'locationMap'}).then(function(map) {
    console.log('map Loaded',map)

    $scope.map = map;

   init(true);
  });

  function changeLocation(location) {
    $scope.location = location

    // console.log('location ',$scope.location)
    console.log('indexOf ', $scope.location.formatted_address.indexOf($scope.location.name))
    if($scope.location.formatted_address.indexOf($scope.location.name)==-1)
      $scope.location.address = $scope.location.name + ($scope.location.formatted_address?", ":"") +$scope.location.formatted_address
    else
      $scope.location.address = $scope.location.formatted_address

    choose = 1;
    $scope.search.query = $scope.location.address;

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

    vm.address = {
      lat : $scope.location.geometry.location.lat(),
      lng : $scope.location.geometry.location.lng(),
      address : $scope.location.address,
      country : $scope.location.country
    }
    console.log('address ',vm.address);

    resetMarkers();
    assignShapes([vm.address], "marker");    
    // init(false);
    assignCenter(vm.address);
  }
})