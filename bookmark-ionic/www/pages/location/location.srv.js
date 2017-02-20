angular.module('bookmark.services')
.service('LocationService', function($q){
  var autocompleteService = new google.maps.places.AutocompleteService();
  var detailsService = new google.maps.places.PlacesService(document.createElement("input"));
  // var distanceService = new google.maps.geometry.spherical;
  function calculateDistance(position1, position2){
    var marker1 = new google.maps.Marker({
      position: position1
    });
    var marker2 = new google.maps.Marker({
      position: position2
    });

    var distance = google.maps.geometry.spherical.computeDistanceBetween(marker1.getPosition(), marker2.getPosition())
    return distance;
  }

  return {
    searchAddress: function(input) {
      var deferred = $q.defer();

      autocompleteService.getPlacePredictions({
        input: input
      }, function(result, status) {
        if(status == google.maps.places.PlacesServiceStatus.OK){
          console.log(status);
          deferred.resolve(result);
        }else{
          deferred.reject(status)
        }
      });

      return deferred.promise;
    },
    getDetails: function(placeId) {
      var deferred = $q.defer();
      detailsService.getDetails({placeId: placeId}, function(result) {
        deferred.resolve(result);
      });
      return deferred.promise;
    },
    stringToDistance : function(str){
      str = str.toLowerCase();
      if(str.indexOf("km")!=-1){
        return parseInt(str.substring(0, str.indexOf("km")))*1000
      }
      else if(str.toLowerCase().indexOf("m")!=-1){
        return parseInt(str.substring(0, str.indexOf("m")))
      }
      else{
        return parseInt(str)
      }
    },
    inProximity : function(currentUser, otherUser, radius){

      if(otherUser.location.country != currentUser.location.country){
        return false
      }
      else if(otherUser.$id==currentUser.$id){
        return false;
      }
      else{
        var distance = calculateDistance(
        {lat : currentUser.location.lat,
        lng : currentUser.location.lng},
        {lat: otherUser.location.lat,
        lng : otherUser.location.lng})
        if(distance<=radius){
          return distance
        }
        else{
          return false;
        }
      }
    },
    calculateDistance : calculateDistance
  };
})