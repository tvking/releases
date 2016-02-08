/* global window: false */
(function(angular, Firebase) {
    "use strict";

    var services = angular.module('releaseApp.services', [
        'firebase'
    ]);

    services.service('FirebaseConfig', function() {
        var config = {
            'url': 'https://sweltering-heat-5768.firebaseio.com',
            'secret': false
        };
        return {
            get: function(key) {
                if (false === config.hasOwnProperty(key)) {
                    throw "Invalid config key `" + key + "`";
                }
                return config[key];
            }
        };
    });


    services.service('Releases', function($firebaseArray, FirebaseConfig) {
        var releasesRef = new Firebase(FirebaseConfig.get('url') + '/releases');

        var firebaseSecret = FirebaseConfig.get('secret');
        if (firebaseSecret) {
            releasesRef.authWithCustomToken(firebaseSecret, function(error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                    return;
                }
            });
        }
        return $firebaseArray(releasesRef);
    });

    services.factory('Release', ['$firebaseObject', 'FirebaseConfig', '$q',
      function($firebaseObject, FirebaseConfig, $q) {
          return function(releaseId) {
              // create a reference to the database node where we will store our data
              var releasesRef = new Firebase(FirebaseConfig.get('url') + '/releases');

              var firebaseSecret = FirebaseConfig.get('secret');
              if (firebaseSecret) {
                  releasesRef.authWithCustomToken(firebaseSecret, function(error, authData) {
                      if (error) {
                          console.log("Login Failed!", error);
                          return;
                      }
                  });
              }

              var releaseRef = releasesRef.child(releaseId);

              var deferred = $q.defer();
              releaseRef.once('value', function(snapshot) {
                  if (snapshot.val() !== null) {
                      var release = $firebaseObject(releaseRef);

                      release.$loaded().then(function(data) {
                          deferred.resolve(release);
                      }, function() {
                        deferred.resolve(null);
                      });
                  } else {
                      deferred.resolve(null);
                  }
              });
              return deferred.promise;
          };
      }
    ]);
})(window.angular, window.Firebase);
