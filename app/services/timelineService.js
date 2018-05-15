sourceApp
.factory('timelineService', ['$http', function($http) {
    function getMissionTimelines() {
    	return $http({
    		url: "/getMissionTimelines",
    		method: "GET"
    	});
    }
    function removeTimeline(filename,mission) {
    	return $http({
    		url: "/removeTimeline",
    		method: "POST",
    		data : {"filename":filename,"mission":mission}
    	});
    }
    return { 
        getMissionTimelines : getMissionTimelines,
        removeTimeline : removeTimeline
    }
}]);