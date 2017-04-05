angular.module('bookmark.controllers')
.factory('countryList', function($http, $q) {
	return{
		get : function(){
			return $http.get('directives/countryList.json');
		},
		getCurrency : function(country){
			var deferred = $q.defer();
			console.log('getting currency of ',country);

			$http.get('directives/countryList.json')
			.then(function(countryList){				
				angular.forEach(countryList.data, function(countryData){
					if(countryData.name == country || countryData.code==country){
						deferred.resolve(countryData.currency);
					}
				})
			})
			.catch(function(err){
				console.error("error fetching currency of location "+country+" : ", err);
				deferred.reject("error fetching currency of location");
			})
			return deferred.promise;
		}
	}
})