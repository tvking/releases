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
        function($scope, $uibModal, $timeout, release) {
            if ('undefined' === typeof release.tickets) {
                release.tickets = [];
            }
            var ticketCount = release.tickets.length;
            for (var i = 0; i < ticketCount; i++) {
                if ('undefined' === typeof release.tickets[i].diffs) {
                    release.tickets[i].diffs = [];
                }
            }

            $scope.addedAfterCutOff = function(date) {
                console.log((new Date(date)).getHours() >= 14);
                return (new Date(date)).getHours() >= 14;
            };
            var pastCutOff = function() {
                return (new Date()).getHours() >= 14;
            };
            var cutOffUpdateInterval = 10 * 1000;
            var updatePastCutOff = function() {
                $scope.pastCutOff = pastCutOff();
                $timeout(updatePastCutOff, cutOffUpdateInterval);
            };

            $scope.pastCutOff = pastCutOff();
            $timeout(updatePastCutOff, cutOffUpdateInterval);

            $scope.release = release;
            $scope.diffsVisible = true;

            $scope.openTicketModal = function() {
                var modalInstance = $uibModal.open({
                    controller: 'ReleaseTicketAdd',
                    templateUrl: '/partials/release-ticket-add',
                    resolve: {
                        release: release
                    }
                });
            };
            $scope.openRemoveTicketModal = function(ticket) {
                var modalInstance = $uibModal.open({
                    controller: 'ReleaseTicketRemove',
                    templateUrl: '/partials/release-ticket-remove',
                    resolve: {
                        release: release,
                        ticket: ticket
                    }
                });
            };
            $scope.openDiffModal = function(ticket) {
                var modalInstance = $uibModal.open({
                    controller: 'ReleaseTicketDiffAdd',
                    templateUrl: '/partials/release-ticket-diff-add',
                    resolve: {
                        release: release,
                        ticket: ticket
                    }
                });
            };
            $scope.openRemoveDiffModal = function(ticket, diff) {
                var modalInstance = $uibModal.open({
                    controller: 'ReleaseTicketDiffRemove',
                    templateUrl: '/partials/release-ticket-diff-remove',
                    resolve: {
                        release: release,
                        ticket: ticket,
                        diff: diff
                    }
                });
            };
            $scope.diffReleased = function(diff) {
                diff.released = true;
                release.$save();
            };
            $scope.isTicketReleased = function(ticket) {
                if ('undefined' === typeof ticket.diffs) {
                    ticket.diffs = [];
                }
                var ticketCount = ticket.diffs.length;
                if (!ticketCount) {
                    return false;
                }
                for (var i = 0; i < ticketCount; i++) {
                    if (!ticket.diffs[i].released) {
                        return false;
                    }
                }
                return true;
            };
            $scope.diffRolledback = function(diff) {
                diff.rolledBack = true;
                release.$save();
            };
            $scope.toggleDiffs = function() {
                $scope.diffsVisible = !$scope.diffsVisible;
            };
        }
    );

    controllers.controller('ReleaseTicketAdd', function($scope, $uibModalInstance, release) {
        var NewTicket = function() {
            return {
                "ticketId": '',
                "description": {
                    "dev": '',
                    "customer": ''
                },
                "devName": '',
                "diffs": []
            };
        };

        $scope.newTicket = new NewTicket();

        $scope.submit = function(isValid) {
            if (true !== isValid) {
                return;
            }

            if ('undefined' === typeof(release.tickets)) {
                release.tickets = [];
            }
            $scope.newTicket.created = Date.now();
            release.tickets.push($scope.newTicket);
            release.$save().then(function() {
                $uibModalInstance.close('success');
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });

    controllers.controller('ReleaseTicketRemove', function(
        $scope,
        $uibModalInstance,
        release,
        ticket
    ) {
        $scope.ticket = ticket;
        $scope.submit = function() {
            var index = release.tickets.indexOf(ticket);
            if (-1 >= index) {
                $uibModalInstance.dismiss('missing-ticket');
                return;
            }
            release.tickets.splice(index, 1);
            release.$save().then(function() {
                $uibModalInstance.close('success');
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });

    controllers.controller( 'ReleaseTicketDiffAdd', function(
        $scope,
        $uibModalInstance,
        release,
        ticket,
        Repositories
    ) {
        var NewDiff = function() {
            return {
                "diffId": '',
                "released": false,
                "rolledBack": false,
                "repoName": '',
                "requirents": {
                }
            };
        };
        $scope.repos = Repositories;
        $scope.newDiff = new NewDiff();
        $scope.submit = function(isValid) {
            if (true !== isValid) {
                return;
            }
            if ('undefined' === typeof(ticket.diffs)) {
                ticket.diffs = [];
            }
            $scope.newDiff.created = Date.now();
            ticket.diffs.push($scope.newDiff);
            release.$save().then(function() {
                $uibModalInstance.close('success');
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });

    controllers.controller('ReleaseTicketDiffRemove', function(
        $scope,
        $uibModalInstance,
        release,
        ticket,
        diff
    ) {
        $scope.ticket = ticket;
        $scope.diff = diff;
        $scope.submit = function() {
            var index = ticket.diffs.indexOf(diff);
            if (-1 >= index) {
                $uibModalInstance.dismiss('missing-diff');
                return;
            }
            ticket.diffs.splice(index, 1);
            release.$save().then(function() {
                $uibModalInstance.close('success');
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });

    controllers.controller(
        'ReleaseEdit',
        function($scope, $window, release) {
            $scope.mode = 'edit';
            $scope.release = release;

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
                    releaseDate: new Date(),
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
                if ($scope.release.releaseDate instanceof Date)
                {
                    $scope.release.releaseDate = $scope.release.releaseDate.getTime();
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

    controllers.controller(
        'RepositoryList',
        function($scope, Repositories) {
            $scope.repos = Repositories;
        }
    );

    controllers.controller(
        'RepositoryView',
        function($scope, repo) {
            $scope.repo = repo;
        }
    );


    controllers.controller(
        'RepositoryEdit',
        function($scope, $window, repo) {
            $scope.mode = 'edit';
            $scope.repo = repo;

            $scope.submit = function(isValid) {
                if (true !== isValid) {
                    return;
                }

                repo.$save().then(function() {
                    $window.location.href = '/repo/' + $scope.repo.$id;
                });
            };
        }
    );

    controllers.controller(
        'RepositoryCreate',
        function($scope, Repositories, $window) {
            var NewRepository = function() {
                return {
                    name: '',
                };
            };
            $scope.mode = 'create';
            $scope.repo = new NewRepository();

            $scope.submit = function(isValid) {
                if (true !== isValid) {
                    return;
                }
                Repositories.$add($scope.repo)
                        .then(function(ref) {
                            $scope.repo = new NewRepository();
                            var id = ref.key();
                            $window.location.href = '/repo/' + ref.key();
                        });
            };
        }
    );

})(window.angular);
