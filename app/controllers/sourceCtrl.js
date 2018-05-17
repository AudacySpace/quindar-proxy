sourceApp
.controller('SourceCtrl', ['Upload','$window', 'configService','$uibModal', function (Upload, $window, configService, $uibModal) {
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

    vm.showModal = function(missionName) {
        // Just provide a template url, a controller and call 'open'.
        $uibModal.open({
            templateUrl: "./views/uploadAttachments.html",
            controller: 'aggFileUploadController',
            controllerAs: '$ctrl',
            resolve: {
                mission: function () {
                    return missionName;
                }
            }
        }).result.then(function(response){
            //handle modal close with response
        },
        function () {
            //handle modal dismiss
        });
    };
}]);

sourceApp.controller('aggFileUploadController', ['$scope','$uibModalInstance','mission','Upload','$window', function($scope,$uibModalInstance,mission,Upload,$window) {

    var $ctrl = this;
    $ctrl.missionName = mission;
    $ctrl.formDetails = {
        file : "",
        id: ""
    }

    $ctrl.list = [
        {
            id:100,
            filename:'AggFile1.csv'
        },
        {
            id:101,
            filename:'AggFile2.csv'
        }
    ]

    $ctrl.close = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.submit = function(){ 
        // Call upload if form is valid
        if($ctrl.uploadAggFile_form.$valid) {
            if($ctrl.formDetails.file){
                $ctrl.upload($ctrl.formDetails.file); 
            } else {
                $window.alert('No file passed. Please upload a csv file.');
            }
        }
    }

    $ctrl.upload = function(file) {
        Upload.upload({
            url: '/uploadCsv', 
            data: { 
                file : file, 
                id : $ctrl.formDetails.id, 
                mission : $ctrl.missionName
            } 
        }).then(function (resp) { 
            //validate success

        }, function (resp) { //catch error
            
        });
    };

}]);
