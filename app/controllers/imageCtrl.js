sourceApp
.controller('ImageCtrl', ['Upload','$window', 'configService','imageService','$scope', function (Upload, $window, configService, imageService, $scope) {
    var vm = this;

    showMissions();
    showList();

    vm.submit = function(){ 
        // Call uploadimage if form is valid
        if(vm.imageupload_form.$valid) {

            var imagenamestatus = uniqueImageName(vm.uploads.imagename,vm.uploads.selectedName);
            var imagefilestatus = uniqueImageFile(vm.uploads.image.name,vm.uploads.selectedName);

            if(imagenamestatus !== false && imagefilestatus !== false){

                if(vm.uploads.image && vm.uploads.contents && vm.uploads.selectedName && vm.uploads.imagename && vm.uploads.contents.size !== 0){
                    vm.uploadimage(); 
                } else if(!vm.uploads.image){
                    $window.alert('No image uploaded. Please upload a jpeg file.');
                }else if(!vm.uploads.contents){
                    $window.alert('No contents file uploaded. Please upload a json file for the image contents.');
                }else if(!vm.uploads.selectedName){
                    $window.alert('Please select the mission');
                }else if(vm.uploads.contents.size === 0){
                    $window.alert('Please upload a non empty file');
                }

            }else {
                if(imagenamestatus === false){
                    $window.alert('Image Name already exists.Please enter a unique name for the image!');
                    vm.uploads.imagename = "";
                }
                if(imagefilestatus === false){
                    if($window.confirm('This image already exists for the mission with a different Image name!Do you want to still add?')){
                          vm.uploadimage(); 
                    }else{
                        vm.uploads.image = {};
                    }
                }
            }
        }
    }

    vm.uploadimage = function(image,contents) {
        Upload.upload({
            url: '/saveImages', 
            data: { 
                imageid : vm.uploads.imagename, 
                image : vm.uploads.image,
                mission : vm.uploads.selectedName,
                contents : vm.uploads.contents
            } 
        }).then(function (resp) { 

            //validate success
            if(resp.data.error_code === 0){
                showList();
                $window.alert('Success: ' + resp.config.data.imageid +' for mission ' + resp.config.data.mission +' is uploaded.');

                //reset the input fields on the form
                vm.uploads = {};
                vm.imageupload_form.$setPristine();
            }
            else if(resp.data.err_desc === "bad json"){
                $window.alert('The json file does not has all the required properties');
                vm.uploads.contents = {};
            }
            else {
                $window.alert('an error occured');
            }
              
        }, function (resp) { //catch error
            $window.alert('Error status: ' + resp.status);
        });
            

    };

    function showMissions(){
        configService.getConfig()
        .then(function(response) {
            vm.missionNames = [];
            for(var i=0;i<response.data.length;i++){
                vm.missionNames.push(response.data[i].mission);
            }
        });
    }

    function showList(){
        imageService.getImageList()
        .then(function(response) {
            vm.imagelist = response.data;
        });
    }

    function uniqueImageName(mname,mission){
        for(var i=0;i<vm.imagelist.length;i++){
            if(mname === vm.imagelist[i].imageid && mission === vm.imagelist[i].mission){
                return false;
            }
        }
    }

    function uniqueImageFile(filename,mission){
        for(var i=0;i<vm.imagelist.length;i++){
            if(filename === vm.imagelist[i].imagefile && mission === vm.imagelist[i].mission){
                return false;
            }
        }
    }

    vm.removeImage = function(iname,mission){
        if($window.confirm('Are you sure you want to delete this image?')){
            removeImageMap(iname,mission);
        }else {

        }
    }

    function removeImageMap(iname,mission){
        imageService.removeImageMap(iname,mission)
            .then(function(response) {
                 if(response.data.error_code === 0){
                     $window.alert('Image map: ' + response.config.data.imageid +' for mission ' + response.config.data.mission +' is deleted.');
                     showList();
                 }
        });
    }

}]);
