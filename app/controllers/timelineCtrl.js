sourceApp
.controller('TimelineCtrl', ['Upload','$window', 'configService','timelineService', 
    function (Upload, $window, configService, timelineService) {
    var vm = this;

    showMissions();
    showList();

    vm.submit = function(){ 
        // Call uploadimage if form is valid
        if(vm.timelinedataupload_form.$valid) {
            if(vm.uploads.filename && vm.uploads.missionName && vm.uploads.file){
                vm.uploadTimelineData(); 
            }else if(!vm.uploads.filename){
                $window.alert('Please enter a name for the file');
            }else if(!vm.uploads.missionName){
                $window.alert('Please select the mission');
            }else if(!vm.uploads.file){
                $window.alert('No file uploaded. Please upload an excel file.');
            }
        }
    }

    vm.uploadTimelineData = function() {
        Upload.upload({
            url: '/saveTimelineData', 
            data: { 
                filename : vm.uploads.filename, 
                file : vm.uploads.file,
                mission : vm.uploads.missionName
            } 
        }).then(function (resp) { 

            //validate success
            if(resp.data.status === "ok"){
                showList();
                $window.alert(resp.data.message);
                //reset the input fields on the form
                vm.uploads = {};
                vm.timelinedataupload_form.$setPristine();
            }
            else {
                $window.alert(resp.data.message);
            }
              
        }, function (resp) { //catch error
            $window.alert('Error status: ' + resp.status);
        });
    };

    vm.removeTimeline = function(filename, mission){
        if($window.confirm('Are you sure you want to delete this file?')){
            timelineService.removeTimeline(filename, mission)
            .then(function(response) {
                if(response.status == 200) {
                    $window.alert('Timeline File: ' + response.config.data.filename +' for mission ' + response.config.data.mission +' is deleted.');
                    showList();
                }
            })
        }
    }

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
        timelineService.getMissionTimelines()
        .then(function(response) {
            vm.timelinelist = response.data;
        });
    }

}]);
