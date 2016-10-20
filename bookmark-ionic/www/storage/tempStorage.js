'use strict'
angular.module('bookmark.services')
.factory('tempStorageSrv', tempStorage)

function tempStorage($http) {

	var tempStorage;
	$http.get("storage/tempStorage.json")
	.success(function(data){
		tempStorage = data;
	})
	.catch(function(error){
		console.log('Cannot fetch JSON : ', error)
		tempStorage = {"error" : error};
	})

	return {
		getUser : getUser,
		userLogin : userLogin
	}

	function getUser(){
		console.log('data', tempStorage)
	}
	function userLogin(user){

	}
}
