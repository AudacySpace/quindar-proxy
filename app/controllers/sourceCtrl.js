sourceApp
.controller('SourceCtrl', ['Upload','$window', 'configService', function (Upload, $window, configService) {
    var vm = this;

    showConfig();

    vm.submit = function(){ 
        // Call upload if form is valid
        if(vm.upload_form.$valid) {
            if(vm.config.file){
                vm.upload(vm.config.file); 
            } else {
                $window.alert('No file passed. Please upload an xlsx file.');
            }
        }
    }

    vm.upload = function(file) {
        Upload.upload({
            url: '/upload', 
            data: { 
                file : file, 
                sourcename : vm.config.sourcename, 
                sourceip : vm.config.sourceip,
                mission : vm.config.mission
            } 
        }).then(function (resp) { 
            //validate success
            if(resp.data.error_code === 0){ 
                showConfig();
                $window.alert('Success: ' + resp.config.data.file.name + ' uploaded.');

                //reset the input fields on the form
                vm.config = {};
                vm.upload_form.$setPristine();
            } else {
                $window.alert('an error occured');
            }
        }, function (resp) { //catch error
            $window.alert('Error status: ' + resp.status);
        });
    };

    function showConfig(){
        configService.getConfig()
        .then(function(response) {
            vm.configlist = response.data;
        });
    }
}]);
