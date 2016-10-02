angular.module('bookmark.controllers')

.controller('profileCtrl', function($scope,profileSrv, $firebaseObject, $firebaseAuth, $firebaseArray, $ionicLoading) {
  	console.log('profileCtrl - loaded')
  	$scope.auth = profileSrv.auth;
  	$scope.user;

  	$scope.auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser) {
        $scope.user = profileSrv.getUser()
        $scope.user = $firebaseObject(profileSrv.ref.child('users').child(firebaseUser.uid))
        console.log('loading user', $scope.user)
      } else {
        console.log("Signed out");
      } 
    });

   	$scope.logout = function(){
  	console.log('logout initiated')
  	$scope.auth.$signOut()
  		.then(function(){
	  		console.log('logged out', $scope.auth.$getAuth())
	  		$scope.user = null;
  		})
	  	.catch(function(error){
	  		console.log('error to logout', error)
	  	})
  	}

  	$scope.loadUser = function(){
  	
	  	console.log('user', $scope.auth.$getAuth().uid, $scope.auth.$getAuth().email);
	  	// console.log('firebase', firebase)
	  	// console.log('ref', ref)
	  	var obj = $firebaseObject(ref);
	  	obj.$loaded().then(function() {
        console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

       // To iterate the key/value pairs of the object, use angular.forEach()
       angular.forEach(obj, function(value, key) {
          console.log(key, value);
       });
     });

	  	var array = $firebaseArray(ref.child("users").child($scope.auth.$getAuth().uid).child("booksOwned"));
	  	array.$loaded()
		  .then(function(x) {
		    x === array; // true
		    console.log('x',x)
        console.log('x[0]', x[0])
		  })
		  .catch(function(error) {
		    console.log("Error:", error);
		  });
		
  	}
	$scope.defineUser = function(){

	}

})