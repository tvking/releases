/* global window: false */
(function(angular, Firebase) {
    "use strict";

    var services = angular.module('releaseApp.services', [
        'firebase'
    ]);


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

    services.service('Releases', function(ReleasesFactory, FirebaseUrl, FirebaseSecret) {
        var releasesRef = new Firebase(FirebaseUrl + '/releases');

        if (FirebaseSecret) {
            releasesRef.authWithCustomToken(FirebaseSecret, function(error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                    return;
                }
            });
        }
        return new ReleasesFactory(releasesRef.orderByChild('releaseDate'));
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

    services.factory('RepositoriesFactory', function($firebaseArray, $firebaseUtils) {
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

    services.service('Repositories', function(RepositoriesFactory, FirebaseUrl, FirebaseSecret) {
        var reposRef = new Firebase(FirebaseUrl + '/repos');

        if (FirebaseSecret) {
            reposRef.authWithCustomToken(FirebaseSecret, function(error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                    return;
                }
            });
        }
        return new RepositoriesFactory(reposRef.orderByChild('name'));
    });

    services.factory('RepositoryFactory', function($firebaseObject, $firebaseUtils) {
        return $firebaseObject.$extend({
            toJSON: function() {
                return $firebaseUtils.toJSON(angular.extend({}, this, {}));
            }
        });
    });

    services.factory('Repository', ['RepositoryFactory', 'FirebaseUrl', 'FirebaseSecret', '$q',
        function(RepositoryFactory, FirebaseUrl, FirebaseSecret, $q) {
            return function(repoId) {
                // create a reference to the database node where we will store our data
                var reposRef = new Firebase(FirebaseUrl + '/repos');

                if (FirebaseSecret) {
                    reposRef.authWithCustomToken(FirebaseSecret, function(error, authData) {
                        if (error) {
                            console.log("Login Failed!", error);
                            return;
                        }
                    });
                }

                var repoRef = reposRef.child(repoId);

                var deferred = $q.defer();
                repoRef.once('value', function(snapshot) {
                    if (snapshot.val() !== null) {
                        var repo = new RepositoryFactory(repoRef);

                        repo.$loaded().then(function(data) {
                            deferred.resolve(repo);
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
