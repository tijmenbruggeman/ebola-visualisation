angular.module( 'ngEbola.service', [])
    .factory('notify', ['$http', '$q', function($http, $q, day) {
        return function(day) {
            var temp = {};
            var defer = $q.defer();

            $http.get('ebola-300914.json').
                success(function (data) {
                    temp = data;
                    defer.resolve(data);
                }).
                error(function (data) {
                    console.log(data);
                    console.log('Something went wrong!');
                });

            return defer.promise;
        };
    }]);