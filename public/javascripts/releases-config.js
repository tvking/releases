/* global window: false */
(function(angular) {
    "use strict";

    var config = angular.module('releaseApp.config', [
        'ngRoute',
    ]);

    /** Where the firebase db is */
    config.constant('FirebaseUrl', 'https://sweltering-heat-5768.firebaseio.com');

    /** Prettify urls by removing the # */
    config.config(function($locationProvider) {
        $locationProvider.html5Mode(true);
    });

    /** Routes */
    config.config(function($routeProvider) {
        $routeProvider.when('/', {
            controller: 'ReleaseList',
            templateUrl: '/partials/release-list'
        })
        .when('/release/create', {
            controller: 'ReleaseCreate',
            templateUrl: '/partials/release-create'
        })
        .when('/release/:releaseId', {
            controller: 'ReleaseView',
            templateUrl: '/partials/release-view',
            resolve: {
                release: function(Release, $route) {
                    return new Release($route.current.params.releaseId);
                }
            }
        })
        .when('/release/:releaseId/edit', {
            controller: 'ReleaseEdit',
            templateUrl: '/partials/release-create',
            resolve: {
                release: function(Release, $route) {
                    return new Release($route.current.params.releaseId);
                }
            }
        });
    });
})(window.angular);
