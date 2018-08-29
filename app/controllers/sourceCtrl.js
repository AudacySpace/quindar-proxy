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

    //Remove a configuration on the basis of source IP Address
    vm.removeConfig = function(sourceIp) {
        if($window.confirm('Are you sure you want to delete configuration file for source IP : ' + sourceIp + '?')){
            configService.removeConfig(sourceIp)
            .then(function(response) {
                if(response.status == 200) {
                    showConfig();
                }
            })
        }
    }

    //Function to display the list of configurations
    function showConfig(){
        configService.getConfig()
        .then(function(response) {
            vm.configlist = response.data;
        });
    }

    vm.showModal = function(missionName,sourceIP) {
        // Just provide a template url, a controller and call 'open'.
        $uibModal.open({
            templateUrl: "./views/uploadAttachments.html",
            controller: 'aggFileUploadController',
            controllerAs: '$ctrl',
            resolve: {
                mission: function () {
                    return missionName;
                },
                sourceip: function(){
                    return sourceIP;
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

sourceApp.controller('aggFileUploadController', ['$scope','$uibModalInstance','mission','Upload','$window','configService','sourceip', function($scope,$uibModalInstance,mission,Upload,$window,configService,sourceip) {

    var $ctrl = this;
    $ctrl.missionName = mission;
    $ctrl.formDetails = {
        file : "",
        id: ""
    }
    $ctrl.sourceip = sourceip;
    showAttachmentsForConfig(sourceip);
    $ctrl.close = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.submit = function(){ 
        // Call upload if form is valid
        if($ctrl.uploadAggFile_form.$valid) {
            if($ctrl.formDetails.file){
                //get all attachments
                //check for existing id
                //if id already exists ask user if he wants to update
                //if yes upload the file
                //else dont upload
                configService.getAttachments(sourceip).then(function(response){
                    if(response.status === 200){
                        $ctrl.count = 0;
                        if(response.data.length > 0){
                            for(var i=0;i<response.data.length;i++){
                                if(parseInt(response.data[i].id) === $ctrl.formDetails.id){
                                    if($window.confirm("This id already exists in the database.Do you want to update the file?")){
                                        $ctrl.count = 0;
                                        break;
                                    }else {
                                        $ctrl.count = $ctrl.count + 1;
                                        $ctrl.formDetails = {};
                                        $ctrl.uploadAggFile_form.$setPristine();
                                        break;
                                    }
                                }
                            }
                        }else {
                            $ctrl.count = 0;
                        }

                        if($ctrl.count === 0){
                            $ctrl.uploadCsv($ctrl.formDetails.file); 
                        }
                    }
                });
            } else {
                $window.alert('No file passed. Please upload a csv file.');
            }
        }
    }

    $ctrl.uploadCsv = function(file) {
        Upload.upload({
            url: '/saveAggregatorFile', 
            data: { 
                file : file, 
                id : $ctrl.formDetails.id, 
                sourceip : sourceip
            } 
        }).then(function (resp) { 
            //validate success
            if(resp.data.error_code === 0 && resp.data.error_desc === "add"){ 
                showAttachmentsForConfig(sourceip);
                $window.alert('Success: '+resp.config.data.file.name+" uploaded.");

                //reset the input fields on the form
                $ctrl.formDetails = {};
                $ctrl.uploadAggFile_form.$setPristine();
            } else if(resp.data.error_code === 0 && resp.data.error_desc === "update"){
                showAttachmentsForConfig(sourceip);
                $window.alert('Success: '+resp.config.data.file.name+" updated.");

                //reset the input fields on the form
                $ctrl.formDetails = {};
                $ctrl.uploadAggFile_form.$setPristine();
            }else if(resp.data.error_code === 1 && resp.data.error_desc === "Does not have all the rows data"){
                $window.alert("All the rows in the file should have both parameter value and bit length value.Please recheck your file.");
                //reset the input fields on the form
                $ctrl.formDetails = {};
                $ctrl.uploadAggFile_form.$setPristine();
            }else if(resp.data.error_code === 1 && resp.data.error_desc === "Bits column has non numeric data"){
                $window.alert("Bits column has non numeric data");
                //reset the input fields on the form
                $ctrl.formDetails = {};
                $ctrl.uploadAggFile_form.$setPristine();
            }else {
                $window.alert('An error occured');
            }

        }, function (resp) { //catch error
            $window.alert('Error status: ' + resp.status);
        });
    };

    function showAttachmentsForConfig(sourceip){
        configService.getAttachments(sourceip).then(function(response){
            if(response.status === 200){
                $ctrl.list = [];
                if(response.data.length > 0){
                    for(var i=0;i<response.data.length;i++){
                        $ctrl.list.push({
                            'id':response.data[i].id,
                            'filename':response.data[i].filename
                        });
                    }
                }else {
                    $ctrl.list = [];
                }
            }
        });
    }

    $ctrl.removeAttachment = function(id,sourceip){
        if($window.confirm('Are you sure you want to delete this attachment?')){
            configService.removeAttachment(id,sourceip)
            .then(function(response) {
                if(response.data.error_code === 0) {
                    showAttachmentsForConfig(sourceip);
                    $window.alert('Aggregator File with Id: ' + response.config.data.id +' is deleted.');
                }
            })
        }
    }

}]);
