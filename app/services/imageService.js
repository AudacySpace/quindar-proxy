sourceApp
.factory('imageService', ['$http', function($http) {
    function getImageList() {
    	return $http({
    		url: "/getImageList",
    		method: "GET"
    	});
    }
    function removeImageMap(iname,mission) {
    	return $http({
    		url: "/removeImageMap",
    		method: "POST",
    		data : {"imageid":iname,"mission":mission}
    	});
    }
    return { 
        getImageList : getImageList,
        removeImageMap : removeImageMap
    }
}]);