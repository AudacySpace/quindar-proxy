describe('Testing images controller', function () {
    var controller, scope, configService, imageService, deferredConfig, deferredImages, deferredRemoval, $q, httpBackend;

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

        inject(function($controller, $rootScope, _$q_, _configService_, _$httpBackend_, _imageService_){
            scope = $rootScope.$new();
            $q = _$q_;
            httpBackend = _$httpBackend_;
            configService = _configService_;
            imageService = _imageService_;

            deferredConfig = _$q_.defer();
            spyOn(configService, "getConfig").and.returnValue(deferredConfig.promise);

            deferredImages = _$q_.defer();
            deferredRemoval = _$q_.defer();
            spyOn(imageService, "getImageList").and.returnValue(deferredImages.promise);
            spyOn(imageService, "removeImageMap").and.returnValue(deferredRemoval.promise);

            controller = $controller('ImageCtrl', {
                $scope: scope,
                configService: configService,
                imageService: imageService
            });
        });
    });

    it('should define the image controller', function() {
        expect(controller).toBeDefined();
    });

    it('should define the function submit()', function(){
        expect(controller.submit).toBeDefined();
    })

    it('should define the function uploadimage()', function(){
        expect(controller.uploadimage).toBeDefined();
    })

    it('should define the function removeImage()', function(){
        expect(controller.removeImage).toBeDefined();
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

    it('should call the service to get list of images to be displayed', function() {
        var imagelist = [{
            contentsfile: "image.json",
            imagefile: "system.jpg",
            imageid: "Test",
            mission: "ATest" 
        }];
        deferredImages.resolve({ data : imagelist });
        // call digest cycle for this to work
        scope.$digest();

        expect(imageService.getImageList).toHaveBeenCalled();
        expect(controller.imagelist).toBeDefined();
        expect(controller.imagelist).toEqual(imagelist);
        expect(controller.imagelist.length).toEqual(1);
    });

    it('should call the upload function when upload form is valid/file name is different from uploaded files', function(){
        controller.imagelist = [{
            contentsfile: "image.json",
            imagefile: "system.jpg",
            imageid: "Test",
            mission: "ATest" 
        }];

        controller.imageupload_form = {
            $valid: true
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            contents: {
                name: "map.json",
                size: 19900
            },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        spyOn(controller, "uploadimage");

        controller.submit();
        expect(controller.uploadimage).toHaveBeenCalled();
    })

    it('should not call the upload function when same imagename has been uploaded for the same mission', function(){
        controller.imagelist = [{
            contentsfile: "image.json",
            imagefile: "system.jpg",
            imageid: "SYS",
            mission: "ATest" 
        }];

        controller.imageupload_form = {
            $valid: true
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            contents: {
                name: "map.json",
                size: 19900
            },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        spyOn(controller, "uploadimage");

        controller.submit();
        expect(controller.uploadimage).not.toHaveBeenCalled();
        expect(windowMock.alert).toHaveBeenCalledWith('Image Name already exists.Please enter a unique name for the image!');
        expect(controller.uploads.imagename).toBe("");
    })

    it('should alert the user in case of no mission name selected', function(){
        controller.imageupload_form = {
            $valid: true
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            contents: {
                name: "map.json",
                size: 19900
            },
            //selectedName: "ATest",
            imagename:  "SYS" 
        };

        spyOn(controller, "uploadimage");

        controller.submit();
        expect(controller.uploadimage).not.toHaveBeenCalled();
        expect(windowMock.alert).toHaveBeenCalledWith('Please select the mission');
    })

    it('should alert the user in case of no image uploaded', function(){
        controller.imageupload_form = {
            $valid: true
        };

        controller.uploads = {
            //image : {
                //name: "sys.jpg"
            //}
            contents: {
                name: "map.json",
                size: 19900
            },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        spyOn(controller, "uploadimage");

        controller.submit();
        expect(controller.uploadimage).not.toHaveBeenCalled();
        expect(windowMock.alert).toHaveBeenCalledWith('No image uploaded. Please upload a jpeg file.');
    })

    it('should alert the user in case of no contents file uploaded', function(){
        controller.imageupload_form = {
            $valid: true
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            // contents: {
            //     name: "map.json",
            //     size: 19900
            // },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        spyOn(controller, "uploadimage");

        controller.submit();
        expect(controller.uploadimage).not.toHaveBeenCalled();
        expect(windowMock.alert)
            .toHaveBeenCalledWith('No contents file uploaded. Please upload a json file for the image contents.');
    })

    it('should alert the user in case of contents file with a size of 0', function(){
        controller.imageupload_form = {
            $valid: true
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            contents: {
                name: "map.json",
                size: 0
            },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        spyOn(controller, "uploadimage");

        controller.submit();
        expect(controller.uploadimage).not.toHaveBeenCalled();
        expect(windowMock.alert).toHaveBeenCalledWith('The file has no contents.Please upload a non empty file.');
    })

    it('should upload file when uploadimage() is called and successfully alert the user', function(){
        controller.imageupload_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            contents: {
                name: "map.json",
                size: 19900
            },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        var response = {
            config: {
                data: {
                    imageid: "SYS",
                    mission: "ATest"
                }
            },
            error_code : 0
        }


        httpBackend.when('POST', '/saveImages').respond(200, response);
        controller.uploadimage();    
        httpBackend.flush();

        expect(windowMock.alert).toHaveBeenCalledWith('Success: SYS for mission ATest is uploaded.');
        expect(controller.uploads).toEqual({});
    })

    it('should alert user on bad json file error', function(){
        controller.imageupload_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            contents: {
                name: "map.json",
                size: 19900
            },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        var response = {
            config: {
                data: {
                    imageid: "SYS",
                    mission: "ATest"
                }
            },
            error_code : 1,
            err_desc : "bad json"
        }

        httpBackend.when('POST', '/saveImages').respond(200, response);
        controller.uploadimage();    
        httpBackend.flush();

        expect(windowMock.alert).toHaveBeenCalledWith('The json file does not has all the required properties');
        expect(controller.uploads.contents).toEqual({});
    })

    it('should alert user on upload file', function(){
        controller.imageupload_form = {
            $valid: true,
            $setPristine : function(){}
        };

        controller.uploads = {
            image: {
                name :  "system1.jpg"
            },
            contents: {
                name: "map.json",
                size: 19900
            },
            selectedName: "ATest",
            imagename:  "SYS" 
        };

        var response = {
            config: {
                data: {
                    imageid: "SYS",
                    mission: "ATest"
                }
            },
            error_code : 1,
            err_desc : "XYZ reason"
        }

        httpBackend.when('POST', '/saveImages').respond(200, response);
        controller.uploadimage();    
        httpBackend.flush();

        expect(windowMock.alert).toHaveBeenCalledWith('an error occured');
    })

    it('should remove image from imagelist when removeImage() is called', function(){
        controller.imagelist = [{
            contentsfile: "image.json",
            imagefile: "system.jpg",
            imageid: "Test",
            mission: "ATest" 
        },{
            contentsfile: "image1.json",
            imagefile: "system1.jpg",
            imageid: "SYS",
            mission: "AZero" 
        }];

        spyOn(windowMock, 'confirm').and.returnValue(true);

        deferredRemoval.resolve({ data : {error_code : 0}, 
            config : { data : { mission : "AZero", imageid : "SYS" }} });
        controller.removeImage("SYS", "AZero");
        // call digest cycle for this to work
        scope.$digest();

        expect(imageService.removeImageMap).toHaveBeenCalledWith("SYS", "AZero");
        expect(windowMock.alert).toHaveBeenCalledWith('Image map: SYS for mission AZero is deleted.');
    })
});
