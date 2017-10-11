describe('Testing configService', function () {
    var configService, httpBackend;

    beforeEach(function () {
        // load the module with a mock window object
        module('sourceApp');
 
        // get your service, also get $httpBackend
        // $httpBackend will be a mock.
        inject(function (_$httpBackend_, _configService_) {
            configService = _configService_;
            httpBackend = _$httpBackend_;
        });
    });
 
    // make sure no expectations were missed in your tests.
    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    //userService should exist in the application
    it('should define configService', function() {
    	expect(configService).toBeDefined();
    });

    it('should get all the configurations as a list', function () {
    	var configurations;
    	var result = [{
    		mission: "ATest",
    		source: {
    			filename: "GMAT-6.xlsx",
    			ipaddress: "10.0.0.16",
    			name: "GMAT"
    		}
    	}];
 
        httpBackend.expectGET('/getConfig').respond(200, result);
 
        configService.getConfig().then( function(response){
        	configurations = response.data;
        	expect(response.status).toBe(200);
        	expect(configurations).toBeDefined();
        	expect(configurations.length).toEqual(1);
        	expect(configurations).toEqual(result);
    	});

    	httpBackend.flush();
    });
 
});