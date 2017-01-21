angular.module('bookmark.controllers')
.factory('countryList', function($http) {
	return{
		get : function(){
			return $http.get('directives/countryList.json');
		}
	}
})