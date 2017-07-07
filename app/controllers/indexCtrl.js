app
.controller('IndexCtrl', function ($scope) {
    $scope.source = "/adminMongo";

    $scope.tabs = [ 
        {
            title: 'Database',
            icon: 'media/icons/icon-database-config.svg',
            source: '/adminMongo'
        },
        {
            title: 'Configuration Sources',
            icon: 'media/icons/icon-data-sources.svg',
            source: '/sources'
        },
        {
            title: 'Netdata',
            icon: 'media/icons/icon-server-status.svg',
            source: '/netdata'
        },
        {
            title: 'Documentation',
            icon: 'media/icons/icon-documents.svg',
            source: '/help'
        }
    ];

    $scope.changeSource = function(source){
        $scope.source = source;
    }
});