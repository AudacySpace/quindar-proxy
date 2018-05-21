describe('Testing aggregator file upload controller', function () {
    var controller, configService, deferred, $q, httpBackend;

    var windowMock = {
        alert: function(message) {
        },
        confirm: function(message){

        }
    };
    var modalInstance = { dismiss: function() {} };
    var mission = 'AZero';
    var sourceip = '100.100.100.100';

    beforeEach(function () {
        // load the module
        module('sourceApp', function ($provide) {
            $provide.value('$window', windowMock);
        });

        spyOn(windowMock, 'alert');

        inject(function($controller, $rootScope, _$q_, _configService_, _$httpBackend_){
            scope = $rootScope.$new();
            $q = _$q_;
            httpBackend = _$httpBackend_;
            configService = _configService_;

            deferred = _$q_.defer();
            spyOn(configService, "getAttachments").and.returnValue(deferred.promise);

            deferredRmvAtchmt = _$q_.defer();
            spyOn(configService, "removeAttachment").and.returnValue(deferredRmvAtchmt.promise);

            controller = $controller('aggFileUploadController', {
                $scope: scope,
                configService: configService,
                $uibModalInstance: modalInstance,
                mission: mission,
                sourceip: sourceip
            });
        });
    });

    it('should define the aggFileUpload controller', function() {
        expect(controller).toBeDefined();
    });

    it('should define the function submit()', function(){
        expect(controller.submit).toBeDefined();
    });

    it('should define the function upload()', function(){
        expect(controller.uploadCsv).toBeDefined();
    });

    it('should define the function upload()', function(){
        expect(controller.close).toBeDefined();
    });

    it('should define the function upload()', function(){
        expect(controller.removeAttachment).toBeDefined();
    });

    it('should call the service to get attachments list', function() {
        var result = [
                {
                    id: "100",
                    filename: "testAggConfig.csv"                
                },
                {
                    id: "101",
                    filename: "testAggConfig copy.csv"
                }
            ]
        
        deferred.resolve({ data : result,status:200 });
        // We have to call digest cycle for this to work
        scope.$digest();

        expect(configService.getAttachments).toHaveBeenCalledWith("100.100.100.100");
        expect(controller.list).toBeDefined();
        expect(controller.list).toEqual(result);
    });

    it('should call the upload function when aggregator upload form is valid', function(){
        var args = {
            name :  "aggTest.csv"
        };

        controller.uploadAggFile_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.formDetails = {
            file: {
                name :  "aggTest.csv"
            },
            id:102
        };
        var result = [
            {
                id: "100",
                filename: "testAggConfig.csv"                
            },
            {
                id: "101",
                filename: "testAggConfig copy.csv"
            }
        ]
        spyOn(controller, "uploadCsv");
        
        deferred.resolve({ data :result,status:200 });

        controller.submit();
        scope.$digest();
        expect(configService.getAttachments).toHaveBeenCalledWith("100.100.100.100");
        expect(controller.uploadCsv).toHaveBeenCalled();
        expect(controller.uploadCsv).toHaveBeenCalledWith(args);
    });

    it('should call the upload function when aggregator upload form is valid and user wants to update with a new file', function(){
        var args = {
            name :  "aggTest.csv"
        };

        controller.uploadAggFile_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.formDetails = {
            file: {
                name :  "aggTest.csv"
            },
            id:100
        };
        var result = [
            {
                id: "100",
                filename: "testAggConfig.csv"                
            },
            {
                id: "101",
                filename: "testAggConfig copy.csv"
            }
        ]
        spyOn(controller, "uploadCsv");
        spyOn(windowMock, 'confirm').and.returnValue(true);
        deferred.resolve({ data :result,status:200 });

        controller.submit();
        scope.$digest();
        expect(configService.getAttachments).toHaveBeenCalledWith("100.100.100.100");
        expect(controller.uploadCsv).toHaveBeenCalled();
        expect(controller.uploadCsv).toHaveBeenCalledWith(args);
    });


    it('should not call the upload function when aggregator upload form is valid and user does not wants to update with a new file', function(){
        controller.uploadAggFile_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.formDetails = {
            file: {
                name :  "aggTest.csv"
            },
            id:100
        };
        var result = [
            {
                id: "100",
                filename: "testAggConfig.csv"                
            },
            {
                id: "101",
                filename: "testAggConfig copy.csv"
            }
        ]

        spyOn(windowMock, 'confirm').and.returnValue(false);
        deferred.resolve({ data :result,status:200 });

        controller.submit();
        scope.$digest();
        expect(configService.getAttachments).toHaveBeenCalledWith("100.100.100.100");
        expect(controller.formDetails).toEqual({});
    });

    it('should alert the user when no file is selected on upload', function(){
        controller.uploadAggFile_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.formDetails = {
            id:100
        };

        controller.submit();
        scope.$digest();
        expect(windowMock.alert).toHaveBeenCalledWith("No file passed. Please upload a csv file.");
    });

    it('should upload the aggregator file when uploadCsv() is called and successfully alert the user', function(){
        controller.uploadAggFile_form= {
            $valid: true,
            $setPristine : function(){}
        };
        controller.formDetails = {
            file: {
                name :  "aggTest.csv"
            },
            id:100,
            sourceip: '100.100.100.100'
        };

        var resp = {
            config: {
                data: {
                    file:{
                        name: 'aggTest.csv'
                    }
                }
            },
            error_code : 0,
            error_desc : "add"
        }

        var mockFile = {
            "name": "aggTest.csv", 
            "size": 220, 
            "type": "text/csv"
        };

        httpBackend.when('POST', '/saveAggregatorFile').respond(200, resp);
        controller.uploadCsv(mockFile);    
        httpBackend.flush();
        expect(windowMock.alert).toHaveBeenCalledWith('Success: aggTest.csv uploaded.');
        expect(controller.formDetails).toEqual({});
    });

    it('should update the aggregator file when uploadCsv() is called and successfully alert the user', function(){
        controller.uploadAggFile_form= {
            $valid: true,
            $setPristine : function(){}
        };
        controller.formDetails = {
            file: {
                name :  "aggTest.csv"
            },
            id:100,
            sourceip: '100.100.100.100'
        };

        var resp = {
            config: {
                data: {
                    file:{
                        name: 'aggTest.csv'
                    }
                }
            },
            error_code : 0,
            error_desc : "update"
        }

        var mockFile = {
            "name": "aggTest.csv", 
            "size": 220, 
            "type": "text/csv"
        };

        httpBackend.when('POST', '/saveAggregatorFile').respond(200, resp);
        controller.uploadCsv(mockFile);    
        httpBackend.flush();
        expect(windowMock.alert).toHaveBeenCalledWith('Success: aggTest.csv updated.');
        expect(controller.formDetails).toEqual({});
    });

    it('should not upload the aggregator file when all the rows do not have parameter value and bit length value', function(){
        controller.uploadAggFile_form= {
            $valid: true,
            $setPristine : function(){}
        };
        controller.formDetails = {
            file: {
                name :  "aggTest.csv"
            },
            id:100,
            sourceip: '100.100.100.100'
        };

        var resp = {
            config: {
                data: {
                    file:{
                        name: 'aggTest.csv'
                    }
                }
            },
            error_code : 1,
            error_desc : "Does not have all the rows data"
        }

        var mockFile = {
            "name": "aggTest.csv", 
            "size": 220, 
            "type": "text/csv"
        };

        httpBackend.when('POST', '/saveAggregatorFile').respond(200, resp);
        controller.uploadCsv(mockFile);    
        httpBackend.flush();
        expect(windowMock.alert).toHaveBeenCalledWith('All the rows in the file should have both parameter value and bit length value.Please recheck your file.');
        expect(controller.formDetails).toEqual({});
    });

    it('should not upload the aggregator file when some error', function(){
        controller.uploadAggFile_form= {
            $valid: true,
            $setPristine : function(){}
        };
        controller.formDetails = {
            file: {
                name :  "aggTest.csv"
            },
            id:100,
            sourceip: '100.100.100.100'
        };

        var resp = {
            config: {
                data: {
                    file:{
                        name: 'aggTest.csv'
                    }
                }
            },
            error_code : 0,
            error_desc : ""
        }

        var mockFile = {
            "name": "aggTest.csv", 
            "size": 220, 
            "type": "text/csv"
        };

        httpBackend.when('POST', '/saveAggregatorFile').respond(200, resp);
        controller.uploadCsv(mockFile);    
        httpBackend.flush();
        expect(windowMock.alert).toHaveBeenCalledWith('An error occured');
    });

    it('should remove file from list when removeAttachment() is called', function(){
        spyOn(windowMock, 'confirm').and.returnValue(true);

        deferredRmvAtchmt.resolve({ data : {error_code : 0},config:{data:{id:100,sourceip: "100.100.100.100"}}});
        controller.removeAttachment(100, "100.100.100.100");
        // call digest cycle for this to work
        scope.$digest();

        expect(configService.removeAttachment).toHaveBeenCalledWith(100, "100.100.100.100");
        expect(windowMock.alert).toHaveBeenCalledWith('Aggregator File with Id: ' + 100 +' is deleted.');
    });

    it('should call the modalInstance dismiss on close function call', function() {
        spyOn(modalInstance, 'dismiss');

        controller.close();
        expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });

});