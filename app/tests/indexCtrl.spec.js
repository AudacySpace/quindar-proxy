describe('Testing index controller', function () {
    var controller, scope;

    beforeEach(function () {
        // load the module
        module('app');

        inject(function($controller, $rootScope){
            scope = $rootScope.$new();

            controller = $controller('IndexCtrl', {
                $scope: scope
            });
        });

    });

    it('should define the index controller', function() {
        expect(controller).toBeDefined();
    });

    it('should define default source as sources', function(){
        expect(scope.source).toBeDefined();
        expect(scope.source).toEqual('/sources');
    })

    it('should define the number of tabs (5) on the web page', function(){
        expect(scope.tabs).toBeDefined();
        expect(scope.tabs.length).toEqual(5);
    })

    it('should define the function changeSource()', function(){
        expect(scope.changeSource).toBeDefined();
    })

    it('should update scope source variable when changeSource() is called', function(){
        scope.changeSource('/sources');
        expect(scope.source).toEqual('/sources');
        expect(scope.source).not.toEqual('/adminMongo');
    })

});
