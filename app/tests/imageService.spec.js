describe('Testing imageService', function () {
    var imageService, httpBackend;

    beforeEach(function () {
        // load the module with a mock window object
        module('sourceApp');
 
        // get your service, also get $httpBackend
        // $httpBackend will be a mock.
        inject(function (_$httpBackend_, _imageService_) {
            imageService = _imageService_;
            httpBackend = _$httpBackend_;
        });
    });
 
    // make sure no expectations were missed in your tests.
    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    //userService should exist in the application
    it('should define the imageService', function() {
    	expect(imageService).toBeDefined();
    });


    it('should get all the images as a list', function () {
    	var imageList;
    	var result = [{
    		contentsfile: "image.json",
    		imagefile: "system.jpg",
            imageid: "Test",
            mission: "ATest" 
    	}];
 
        httpBackend.expectGET('/getImageList').respond(200, result);
 
        imageService.getImageList().then( function(response){
        	imageList = response.data;
        	expect(response.status).toBe(200);
        	expect(imageList).toBeDefined();
        	expect(imageList.length).toEqual(1);
            expect(imageList).toEqual(result);
    	});

    	httpBackend.flush();
    });

    it('should be able to delete an image from list of images', function () {
        var mission = "ATest";
        var imageid = "Test";

        httpBackend.expectPOST("/removeImageMap")
            .respond(200, {error_code: 0, err_desc : null});

        imageService.removeImageMap(imageid, mission).then( function(response){
            expect(response.status).toBe(200);
            expect(response.data.error_code).toBe(0);
        });

        httpBackend.flush();
    });
 
});