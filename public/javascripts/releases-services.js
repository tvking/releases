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
        return $firebaseArray(releasesRef.orderByChild('releaseDate'));
    });

    services.factory('ReleaseFactory', function($firebaseObject, $firebaseUtils) {
        return $firebaseObject.$extend({
            toJSON: function() {
                return $firebaseUtils.toJSON(
                    angular.extend({}, this, {
                        releaseDate: this.releaseDate ?
                            (this.releaseDate instanceof Date ? this.releaseDate.getTime() : this.releaseDate) : null
                    })
                );
            }
        });
    });

    services.factory('Release', ['ReleaseFactory', 'FirebaseUrl', 'FirebaseSecret', '$q',
        function(ReleaseFactory, FirebaseUrl, FirebaseSecret, $q) {
            return function(releaseId) {
                // create a reference to the database node where we will store our data
                var releasesRef = new Firebase(FirebaseUrl + '/releases');

                if (FirebaseSecret) {
                    releasesRef.authWithCustomToken(FirebaseSecret, function(error, authData) {
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
                        var release = new ReleaseFactory(releaseRef);

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
