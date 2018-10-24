describe('Testing timeline controller', function () {
    var controller, scope, configService, timelineService, deferredConfig, deferredTimeline, deferredRemoval, $q, httpBackend;

    var windowMock = {
        alert: function(message) {
            
        },
        confirm: function(message){

        }
    };

    beforeEach(function () {
        // load the module
        module('sourceApp', function ($provide) {
            $provide.value('$window', windowMock);
        });

        spyOn(windowMock, 'alert');

        inject(function($controller, $rootScope, _$q_, _configService_, _$httpBackend_, _timelineService_){
            scope = $rootScope.$new();
            $q = _$q_;
            httpBackend = _$httpBackend_;
            configService = _configService_;
            timelineService = _timelineService_;

            deferredConfig = _$q_.defer();
            spyOn(configService, "getConfig").and.returnValue(deferredConfig.promise);

            deferredTimeline = _$q_.defer();
            deferredRemoval = _$q_.defer();
            spyOn(timelineService, "getMissionTimelines").and.returnValue(deferredTimeline.promise);
            spyOn(timelineService, "removeTimeline").and.returnValue(deferredRemoval.promise);

            controller = $controller('TimelineCtrl', {
                $scope: scope,
                configService: configService,
                timelineService: timelineService
            });
        });
    });

    it('should define the timeline controller', function() {
        expect(controller).toBeDefined();
    });

    it('should define the function submit()', function(){
        expect(controller.submit).toBeDefined();
    });

    it('should define the function uploadTimelineData()', function(){
        expect(controller.uploadTimelineData).toBeDefined();
    });

    it('should define the function removeTimeline()', function(){
        expect(controller.removeTimeline).toBeDefined();
    })

    it('should call the service to get list of missions', function() {
        var missions = [ "ATest", "AZero"];
        var configlist = [{
            mission: "ATest",
            source: {
                filename: "GMAT-6.xlsx",
                ipaddress: "10.0.0.16",
                name: "GMAT"
            }
        },{
            mission: "AZero",
            source: {
                filename: "SIM.xlsx",
                ipaddress: "10.0.0.11",
                name: "Julia"
            }
        }];
        deferredConfig.resolve({ data : configlist });
        // call digest cycle for this to work
        scope.$digest();

        expect(configService.getConfig).toHaveBeenCalled();
        expect(controller.missionNames).toBeDefined();
        expect(controller.missionNames).toEqual(missions);
    });

    it('should call the service to get list of timelines to be displayed', function() {
        var timelineList = [{
            filename: "Timeline",
            file: "timeline.xlsx",
            mission: "ATest" 
        }];
        deferredTimeline.resolve({ data : timelineList });
        // call digest cycle for this to work
        scope.$digest();

        expect(timelineService.getMissionTimelines).toHaveBeenCalled();
        expect(controller.timelinelist).toBeDefined();
        expect(controller.timelinelist).toEqual(timelineList);
        expect(controller.timelinelist.length).toEqual(1);
    });

    it('should call the upload function when upload form is valid', function(){
        controller.timelinedataupload_form = {
            $valid: true
        };

        controller.uploads = {
            file : "timeline.xlsx",
            filename : "Timeline",
            missionName : "ATest"
        };

        spyOn(controller, "uploadTimelineData");

        controller.submit();
        expect(controller.uploadTimelineData).toHaveBeenCalled();
    });

    it('should alert the user when filename is empty', function(){
        controller.timelinedataupload_form = {
            $valid: true
        };

        controller.uploads = {
            file : "timeline.xlsx",
            filename : "",
            missionName : "ATest"
        };

        spyOn(controller, "uploadTimelineData");

        controller.submit();
        expect(controller.uploadTimelineData).not.toHaveBeenCalled();
        expect(windowMock.alert).toHaveBeenCalledWith('Please enter a name for the file');
    });

    it('should alert the user when file is not selected/browsed', function(){
        controller.timelinedataupload_form = {
            $valid: true
        };

        controller.uploads = {
            file : "",
            filename : "Timeline",
            missionName : "ATest"
        };

        spyOn(controller, "uploadTimelineData");

        controller.submit();
        expect(controller.uploadTimelineData).not.toHaveBeenCalled();
        expect(windowMock.alert).toHaveBeenCalledWith('No file uploaded. Please upload an excel file.');
    });

    it('should alert the user when mission is not selected', function(){
        controller.timelinedataupload_form = {
            $valid: true
        };

        controller.uploads = {
            file : "timeline.xlsx",
            filename : "Timeline",
            missionName : ""
        };

        spyOn(controller, "uploadTimelineData");

        controller.submit();
        expect(controller.uploadTimelineData).not.toHaveBeenCalled();
        expect(windowMock.alert).toHaveBeenCalledWith('Please select the mission');
    });

    it('should upload file when uploadTimelineData() is called and successfully alert the user', function(){
        controller.timelinedataupload_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.uploads = {
            file : "timeline.xlsx",
            filename : "Timeline",
            missionName : "ATest"
        };

        var response = {
            status : "ok",
            message : "Timeline data saved successfully for ATest"
        }


        httpBackend.when('POST', '/saveTimelineData').respond(200, response);
        controller.uploadTimelineData();    
        httpBackend.flush();

        expect(windowMock.alert).toHaveBeenCalledWith('Timeline data saved successfully for ATest');
        expect(controller.uploads).toEqual({});
    });

    it('should show the list of files when file is successfully uploaded', function(){
        controller.timelinedataupload_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.uploads = {
            file : "timeline.xlsx",
            filename : "Timeline",
            missionName : "ATest"
        };

        var response = {
            config: {
                data: {
                    filename: "Timeline",
                    mission: "ATest"
                }
            },
            error_code : 0
        }

        var timelineList = [{
            filename: "Timeline",
            file: "timeline.xlsx",
            mission: "ATest" 
        }];

        httpBackend.when('POST', '/saveTimelineData').respond(200, response);
        controller.uploadTimelineData();    
        httpBackend.flush();

        deferredTimeline.resolve({ data : timelineList });
        // call digest cycle for this to work
        scope.$digest();

        expect(timelineService.getMissionTimelines).toHaveBeenCalled();
        expect(controller.timelinelist).toBeDefined();
        expect(controller.timelinelist).toEqual(timelineList);
        expect(controller.timelinelist.length).toEqual(1);
    });

    it('should alert error to user when uploading file is not successful', function(){
        controller.timelinedataupload_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.uploads = {
            file : "timeline.xlsx",
            filename : "Timeline",
            missionName : "ATest"
        };

        var response = {
            status: "error",
            message: "Invalid files: Sheet1/Sheet2 is empty"
        }


        httpBackend.when('POST', '/saveTimelineData').respond(200, response);
        controller.uploadTimelineData();    
        httpBackend.flush();

        expect(windowMock.alert).toHaveBeenCalledWith('Invalid files: Sheet1/Sheet2 is empty');
    });

    it('should remove timeline from timelinelist when removeTimeline() is called', function(){
        controller.timelinelist = [{
            filename: "Timeline",
            file: "timeline.xlsx",
            mission: "ATest" 
        }];

        spyOn(windowMock, 'confirm').and.returnValue(true);

        deferredRemoval.resolve({ data : {error_code : 0}, status : 200, 
            config : { data : { mission : "ATest", filename : "timeline.xlsx" }} });
        controller.removeTimeline("Timeline", "ATest");
        // call digest cycle for this to work
        scope.$digest();
        
        expect(timelineService.removeTimeline).toHaveBeenCalledWith("Timeline", "ATest");
        expect(windowMock.alert).toHaveBeenCalledWith('Timeline File: timeline.xlsx for mission ATest is deleted.');
    })
});
