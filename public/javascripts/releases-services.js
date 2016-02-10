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

    services.factory('ReleasesFactory', function($firebaseArray, $firebaseUtils) {
        return $firebaseArray.$extend({
                $$added: function() {
                    var self = this;
                    var record = $firebaseArray.prototype.$$added.apply(self, arguments);
                    record.toJSON = function() {
                    return $firebaseUtils.toJSON(this);
                };
                return record;
            }
        });
    });

    services.service('Releases', function($q, ReleasesFactory, FirebaseConfig) {
        var deferred = $q.defer();
        FirebaseConfig.then(function(config) {
            var releasesRef = new Firebase(config.get('FirebaseUrl') + '/releases');
            var firebaseSecret = config.get('FirebaseSecret');
            if (firebaseSecret) {
                releasesRef.authWithCustomToken(firebaseSecret, function(error, authData) {
                    if (error) {
                        deferred.reject("Login Failed! " + error);
                    } else {
                        deferred.resolve(new ReleasesFactory(releasesRef.orderByChild('releaseDate')));
                    }
                });
            } else {
                deferred.resolve(new ReleasesFactory(releasesRef.orderByChild('releaseDate')));
            }
        });
        return deferred.promise;
    });

    services.factory('ReleaseFactory', function($firebaseObject, $firebaseUtils) {
        return $firebaseObject.$extend({
            toJSON: function() {
                return $firebaseUtils.toJSON(
                    angular.extend({}, this, {
                        releaseDate: this.releaseDate? this.releaseDate.getTime() : null
                    })
                );
            }
        });
    });

    services.factory('Release', [
        'ReleaseFactory', 'FirebaseConfig', '$q',
        function(ReleaseFactory, FirebaseConfig, $q) {
            return function(releaseId) {
                return FirebaseConfig.then(function(config) {
                    // create a reference to the database node where we will store our data
                    var releasesRef = new Firebase(config.get('FirebaseUrl') + '/releases');

                    var firebaseSecret = config.get('FirebaseSecret');
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
                            var release = new ReleaseFactory(releaseRef);
                            release.$loaded().then(function(data) {
                                deferred.resolve(release);
                            }, function() {
                                deferred.resolve(null);
                            });
                        }
                    });

                    return deferred.promise;
                });
            };
        }
    ]);
})(window.angular, window.Firebase);
