app
.controller('IndexCtrl', function ($scope) {
    $scope.source = "/sources";

    $scope.tabs = [
        {
            title: 'Configuration Sources',
            icon: 'media/icons/icon-data-sources.svg',
            source: '/sources'
        },
        {
            title: 'Image Upload',
            icon: 'media/icons/icon-upload-image.svg',
            source: '/imageuploads'
        },
        {
            title: 'Timeline',
            icon: 'media/icons/icon-upload-timeline.svg',
            source: '/timelineuploads'
        },
        {
            title: 'Netdata',
            icon: 'media/icons/icon-server-status.svg',
            source: '/netdata'
        },
        // {
        //     title: 'Documentation',
        //     icon: 'media/icons/icon-documents.svg',
        //     source: '/help'
        // }
    ];

    $scope.changeSource = function(source){
        $scope.source = source;
    }
});