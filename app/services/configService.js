sourceApp
.factory('configService', ['$http', function($http) {
    function getConfig() {
        return $http({
            url: "/getConfig", 
            method: "GET"
        });
    }

    function getAttachments(sourceip){
    	return $http({
    		url: "/getAttachments",
    		method: "GET",
    		params: {'sourceip':sourceip}
    	});
    }

    function removeAttachment(id,sourceip) {
    	return $http({
    		url: "/removeAttachment",
    		method: "POST",
    		data : {"id":id,'sourceip':sourceip}
    	});
    }

    function removeConfig(sourceIp) {
        return $http({
            url: "/removeConfig",
            method: "POST",
            data : { 'sourceIp' : sourceIp }
        });
    }

    return { 
        getConfig : getConfig,
        getAttachments : getAttachments,
        removeAttachment : removeAttachment,
        removeConfig : removeConfig
    }
}]);
