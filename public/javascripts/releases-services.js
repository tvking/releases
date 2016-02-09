/* global window: false */
(function(angular, Firebase) {
    "use strict";

    var services = angular.module('releaseApp.services', [
        'firebase'
    ]);

    services.service('FirebaseConfig', function($http) {
        return $http.get('/config').then(function(res) {
            return {
                get: function(key) {
                    if (false === res.data.hasOwnProperty(key)) {
                        throw "Invalid config key `" + key + "`";
                    }
                    return res.data[key];
                }
            };
        });
    });


    services.service('Releases', function($q, $firebaseArray, FirebaseConfig) {
        var deferred = $q.defer();
        FirebaseConfig.then(function(config) {
            var releasesRef = new Firebase(config.get('FirebaseUrl') + '/releases');
            var firebaseSecret = config.get('FirebaseSecret');
            if (firebaseSecret) {
                releasesRef.authWithCustomToken(firebaseSecret, function(error, authData) {
                    if (error) {
                        deferred.reject("Login Failed! " + error);
                    } else {
                        deferred.resolve($firebaseArray(releasesRef));
                    }
                    return;
                });
            }
            deferred.resolve($firebaseArray(releasesRef));
        });
        return deferred.promise;
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
