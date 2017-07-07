sourceApp
.factory('configService', ['$http', function($http) {
    function getConfig() {
        return $http({
            url: "/getConfig", 
            method: "GET"
        });
    }
    return { 
        getConfig : getConfig
    }
}]);