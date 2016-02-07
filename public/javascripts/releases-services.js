/* global window: false */
(function(angular, Firebase) {
    "use strict";

    var services = angular.module('releaseApp.services', [
        'firebase'
    ]);

    services.service('Releases', function($firebaseArray, FirebaseUrl, FirebaseSecret) {
        var releasesRef = new Firebase(FirebaseUrl + '/releases');

        if (FirebaseSecret) {
            releasesRef.authWithCustomToken(FirebaseSecret, function(error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                    return;
                }
            });
        }
        return $firebaseArray(releasesRef);
    });

    services.factory('Release', ['$firebaseObject', 'FirebaseUrl', '$q',
      function($firebaseObject, FirebaseUrl, $q) {
          return function(releaseId) {
              // create a reference to the database node where we will store our data
              var releasesRef = new Firebase(FirebaseUrl + '/releases');
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
