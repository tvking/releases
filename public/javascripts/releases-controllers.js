/* global window: false */
(function(angular) {
    "use strict";
    var controllers = angular.module('releaseApp.controllers', [
        'ngMessages',
        'ui.bootstrap',
    ]);

    /** Controllers */
    controllers.controller(
        'ReleaseList',
        function($scope, Releases) {
            $scope.releases = Releases;
        }
    );

    controllers.controller(
        'ReleaseView',
        function($scope, release) {
            if ('undefined' === typeof release.tickets) {
                release.tickets = [];
            }
            var ticketCount = release.tickets.length;
            for (var i = 0; i < ticketCount; i++) {
                if ('undefined' === typeof release.tickets[i].diffs) {
                    release.tickets[i].diffs = [];
                }
            }

            $scope.release = release;
            $scope.submit = function(isValid) {
              if ('undefined' === typeof(release.tickets)) {
                release.tickets = [];
              }
              release.tickets.push($scope.newTicket);
                release.$save();
                $scope.newTicket = {};
            };
        }
    );

    controllers.controller(
        'ReleaseEdit',
        function($scope, $window, release) {
            $scope.mode = 'edit';
            $scope.release = release;

            $scope.submit = function(isValid) {
                if (true !== isValid) {
                    return;
                }

                release.$save().then(function() {
                    $window.location.href = '/release/' + $scope.release.$id;
                });
            };
        }
    );

    controllers.controller(
        'ReleaseCreate',
        function($scope, Releases, $window) {
            var NewRelease = function() {
                return {
                    name: '',
                    releaseDate: new Date().getTime(),
                    tickets: []
                };
            };
            $scope.mode = 'create';
            $scope.release = new NewRelease();

            /** date picker setup */
            $scope.minDate = new Date();
            $scope.dateOptions = {
                startingDay: 1
            };
            $scope.datePickerOpen = false;
            $scope.open = function() {
                $scope.datePickerOpen = true;
            };

            $scope.submit = function(isValid) {
                if (true !== isValid) {
                    return;
                }
                Releases.$add($scope.release)
                        .then(function(ref) {
                            $scope.release = new NewRelease();
                            var id = ref.key();
                            $window.location.href = '/release/' + ref.key();
                        });
            };
        }
    );
})(window.angular);
