angular.module('sidebarImpiegato')
    .component('sidebarImpiegato', {
        templateUrl: 'app/sidebar-impiegato/sidebar-impiegato.template.html',
        controller: ['$rootScope', '$location', 'token', function($rootScope, $location, token) {

            var self = this;

            self.backHome = function() {
                $rootScope.$broadcast('backHome');
            };

            self.salva = function() {
                $rootScope.$broadcast('salva');
            }

            self.creaCV = function(){
                $location.path('/preview');
            }

            self.showTags = function() {
                $rootScope.$broadcast('tags');
            }

            self.profilo = token.getProfile();
        }]
    });