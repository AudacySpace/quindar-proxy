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

    it('should get all the attachments for a configuration', function () {
        var configuration;
        var result = {
            mission: "ATest",
            source: {
                filename: "GMAT-6.xlsx",
                ipaddress: "10.0.0.16",
                name: "GMAT"
            },attachments: [
                {
                    id: "100",
                    filename: "testAggConfig.csv",
                    data: [
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam32",
                            "Bits": 16
                        },
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam32",
                            "Bits": 16
                        },
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam16",
                            "Bits": 16
                        },
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam8",
                            "Bits": 8
                        }
                    ]
                },
                {
                    id: "101",
                    filename: "testAggConfig copy.csv",
                    data: [
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam32",
                            "Bits": 16
                        },
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam32",
                            "Bits": 16
                        },
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam16",
                            "Bits": 16
                        },
                        {
                            "Parameter": "cdh.DataPool.platform.DummySubsys1.dummyParam8",
                            "Bits": 8
                        }
                    ]
                }
            ]
        };
 
        httpBackend.expectGET('/getAttachments?sourceip=10.0.0.16').respond(200, result);
 
        configService.getAttachments("10.0.0.16").then( function(response){
            configuration = response.data;
            expect(response.status).toBe(200);
            expect(configuration).toBeDefined();
            expect(configuration.attachments.length).toEqual(2);
            expect(configuration.attachments).toEqual(result.attachments);
        });

        httpBackend.flush();
    });

    it('should be able to delete an aggregator(.csv) file from list of files', function () {
        var sourceip = "10.0.0.16";
        var id = 100;

        httpBackend.expectPOST("/removeAttachment")
            .respond(200, {error_code: 0, err_desc : null});

        configService.removeAttachment(id, sourceip).then( function(response){
            expect(response.status).toBe(200);
            expect(response.data.error_code).toBe(0);
        });

        httpBackend.flush();
    });
 
});