/* global window: false */
(function(angular, Firebase) {
    "use strict";

    var services = angular.module('releaseApp.services', [
        'firebase'
    ]);

    services.service('AppConfig', function($http) {
        var appConfig;
        var config = {
            get: function(key) {
                if (false === appConfig.hasOwnProperty(key)) {
                    throw "Invalid config key `" + key + "`";
                }
                return appConfig[key];
            }
        };

        return $http.get('/config').then(function(res) {
            appConfig = res.data;
            return config;
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

    services.service('Releases', function($q, ReleasesFactory, AppConfig) {
        var deferred = $q.defer();
        AppConfig.then(function(config) {
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
        'ReleaseFactory', 'AppConfig', '$q',
        function(ReleaseFactory, AppConfig, $q) {
            return function(releaseId) {
                return AppConfig.then(function(config) {
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
