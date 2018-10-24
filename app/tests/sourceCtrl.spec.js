describe('Testing source controller', function () {
    var controller, scope, configService, deferred, $q, httpBackend;

    var windowMock = {
        alert: function(message) {},
        confirm: function(message) {}
    };

    var modalInstance = { open: function() {} };

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
            spyOn(configService, "getConfig").and.returnValue(deferred.promise);
            spyOn(configService, "removeConfig").and.returnValue(deferred.promise);

            controller = $controller('SourceCtrl', {
                $scope: scope,
                configService: configService,
                $uibModal : modalInstance
            });
        });
    });

    it('should define the source controller', function() {
        expect(controller).toBeDefined();
    });

    it('should define the function submit()', function(){
        expect(controller.submit).toBeDefined();
    });

    it('should define the function upload()', function(){
        expect(controller.upload).toBeDefined();
    });

    it('should call the service to get configuration list', function() {
        var result = [{
            mission: "ATest",
            simulated: true,
            source: {
                filename: "GMAT-6.xlsx",
                ipaddress: "10.0.0.16",
                name: "GMAT"
            }
        }]
        deferred.resolve({ data : result });
    
        // We have to call digest cycle for this to work
        scope.$digest();

        expect(configService.getConfig).toHaveBeenCalled();
        expect(controller.configlist).toBeDefined();
        expect(controller.configlist).toEqual(result);
    });

    it('should call the upload function when upload form is valid', function(){
        var args = {
            name: "SIM.xlsx"
        };

        controller.upload_form = {
            $valid: true
        };

        controller.config = {
            file: {
                name: "SIM.xlsx"
            },
            mission: "ATest",
            sourceip: "10.0.0.14",
            sourcename: "GMAT",
            simulated : true
        };

        spyOn(controller, "upload");

        controller.submit();
        expect(controller.upload).toHaveBeenCalled();
        expect(controller.upload).toHaveBeenCalledWith(args);
    });

    it('should alert the user when upload form is valid but the file property does not exist', function(){
        controller.upload_form = {
            $valid: true
        };

        controller.config = {
            mission: "ATest",
            sourceip: "10.0.0.14",
            sourcename: "GMAT",
            simulated: true
        }

        controller.submit();
        expect(windowMock.alert).toHaveBeenCalledWith('No file passed. Please upload an xlsx file.');
    });

    it('should upload file when upload() is called and successfully alert the user', function(){
        controller.upload_form = {
            $valid: true,
            $setPristine : function(){}
        };
        controller.config = {
            file: {
                name: "SIM.xlsx"
            },
            mission: "ATest",
            sourceip: "10.0.0.14",
            sourcename: "GMAT",
            simulated: true
        };

        var response = {
            status : "ok",
            message : "Configuration data saved successfully for 10.0.0.14"
        }

        var mockFile = {
            "name": "SIM.xlsx", 
            "size": 10759, 
            "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        httpBackend.when('POST', '/upload').respond(200, response);
        controller.upload(mockFile);    
        httpBackend.flush();

        expect(windowMock.alert).toHaveBeenCalledWith('Configuration data saved successfully for 10.0.0.14');
        expect(controller.config).toEqual({});
    });

    it('should alert user on upload file error(invalid file)', function(){
        controller.config = {
            file: {
                name: "SIM.xlsx"
            },
            mission: "ATest",
            sourceip: "10.0.0.14",
            sourcename: "GMAT",
            simulated: true
        };

        var response = {
            status : "error",
            message : "Invalid File"
        }

        var mockFile = {
            "name": "SIM.xlsx", 
            "size": 10759, 
            "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        httpBackend.when('POST', '/upload').respond(200, response);
        controller.upload(mockFile);    
        httpBackend.flush();
        expect(windowMock.alert).toHaveBeenCalledWith('Invalid File');
    });

    it('should remove file from list when it is deleted', function(){
        spyOn(windowMock, 'confirm').and.returnValue(true);
        var result = {
            'message' : 'Configuration deleted successfully'
        }

        deferred.resolve({ data : result });
        controller.removeConfig("100.100.100.100");

        expect(configService.removeConfig).toHaveBeenCalledWith("100.100.100.100");
    });

    it('should not remove file from list when the user does not confirm to delete', function(){
        spyOn(windowMock, 'confirm').and.returnValue(false);

        controller.removeConfig("100.100.100.100");
        expect(configService.removeConfig).not.toHaveBeenCalled();
    });

    it('should call showModal function on click on attachment svg', function() {
        var fakeModal = {
            result: {
                then: function(cancelCallback) {
                    //Store the callbacks for later when the user clicks on the Cancel button of the dialog
                    this.cancelCallback = cancelCallback;
                }
            }
        };

        var modalResult = {};
        var mockModalInstance = { result: $q.resolve(modalResult) };
        spyOn(mockModalInstance.result, 'then').and.callThrough();
        spyOn(modalInstance, 'open').and.returnValue(mockModalInstance);

        controller.showModal();
        scope.$digest();
        expect(modalInstance.open).toHaveBeenCalled();
    });

});
