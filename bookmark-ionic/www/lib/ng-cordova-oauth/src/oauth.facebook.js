(function() {
  'use strict';

  angular.module('oauth.facebook', ['oauth.utils'])
    .factory('$ngCordovaFacebook', facebook);

  function facebook($q, $http, $cordovaOauthUtility) {
    return { signin: oauthFacebook };

    /*
     * Sign into the Facebook service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthFacebook(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var flowUrl = "https://www.facebook.com/v2.6/dialog/oauth?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=token&scope=" + appScope.join(",");
          if(options !== undefined && options.hasOwnProperty("auth_type")) {
            flowUrl += "&auth_type=" + options.auth_type;
          }
          var browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = [];
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }
              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
              } else {
                if ((event.url).indexOf("error_code=100") !== 0) {
                  deferred.reject("Facebook returned error_code=100: Invalid permissions");
                } else {
                  deferred.reject("Problem authenticating");
                }
              }
            }
          });
          browserRef.addEventListener('exit', function(event) {
            deferred.reject("The sign in flow was canceled");
          });
        } else {
          deferred.reject("Could not find InAppBrowser plugin");
        }
      } else {
        deferred.reject("Cannot authenticate via a web browser");
      }
      return deferred.promise;
    }
  }

  facebook.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

/* available details to be requested via appScope. It is found here https://developers.facebook.com/docs/facebook-login/permissions
public_profile
user_friends
email
user_about_me
user_actions.books
user_actions.fitness
user_actions.music
user_actions.news
user_actions.video
user_actions:{app_namespace}
user_birthday
user_education_history
user_events
user_games_activity
user_hometown
user_likes
user_location
user_managed_groups
user_photos
user_posts
user_relationships
user_relationship_details
user_religion_politics
user_tagged_places
user_videos
user_website
user_work_history
read_custom_friendlists
read_insights
read_audience_network_insights
read_page_mailboxes
manage_pages
publish_pages
publish_actions
rsvp_event
pages_show_list
pages_manage_cta
pages_manage_instant_articles
ads_read
ads_management
business_management
pages_messaging
pages_messaging_phone_number*/
