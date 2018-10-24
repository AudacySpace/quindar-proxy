describe('Testing timelineService', function () {
    var timelineService, httpBackend;

    beforeEach(function () {
        // load the module with a mock window object
        module('sourceApp');
 
        // get your service, also get $httpBackend
        // $httpBackend will be a mock.
        inject(function (_$httpBackend_, _timelineService_) {
            timelineService = _timelineService_;
            httpBackend = _$httpBackend_;
        });
    });
 
    // make sure no expectations were missed in your tests.
    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    //userService should exist in the application
    it('should define the timelineService', function() {
    	expect(timelineService).toBeDefined();
    });


    it('should get all the timelines as a list', function () {
    	var timelineList;
    	var result = [{
    		filename: "Timeline",
    		file: "timeline.xlsx",
            mission: "ATest" 
    	}];
 
        httpBackend.expectGET('/getMissionTimelines').respond(200, result);
 
        timelineService.getMissionTimelines().then( function(response){
        	timelineList = response.data;
        	expect(response.status).toBe(200);
        	expect(timelineList).toBeDefined();
        	expect(timelineList.length).toEqual(1);
            expect(timelineList).toEqual(result);
    	});

    	httpBackend.flush();
    });

    it('should be able to delete the timeline file from list of timelines', function () {
        var mission = "ATest";
        var filename = "Timeline";

        httpBackend.expectPOST("/removeTimeline")
            .respond(200, {error_code: 0, err_desc : null});

        timelineService.removeTimeline(filename, mission).then( function(response){
            expect(response.status).toBe(200);
            expect(response.data.error_code).toBe(0);
        });

        httpBackend.flush();
    });
 
});