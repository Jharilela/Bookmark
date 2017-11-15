var firebaseConfig = 
{
    apiKey: "AIzaSyA2LUTJpW7oGxg-hgBijd4zoaS6BqIDzts",
    authDomain: "bookmark-140216.firebaseapp.com",
    databaseURL: "https://bookmark-140216.firebaseio.com",
    storageBucket: "bookmark-140216.appspot.com",
    messagingSenderId: "316498021139"
};
firebase.initializeApp(firebaseConfig);
var ref = firebase.database().ref();
var storage = firebase.storage();
