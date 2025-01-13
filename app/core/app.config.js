angular.module('homeApp')
    .config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {

        $stateProvider
            .state('loginState', {
                url: '/login',
                template: '<login></login>',
                title: 'CV aziendali - Login'
            })

            .state('logout', {
                abstract: true,
                template: '<logout></logout><ui-view></ui-view>'
            })

            .state('logout.sidebarHome', {
                abstract: true,
                template: '<sidebar-home></sidebar-home><ui-view></ui-view>'
            })

            .state('logout.sidebarHome.impiegati', {
                url: '^/impiegati',
                template: '<table-impiegati></table-impiegati>',
                title: 'CV aziendali - Home',
                profili: ['ADMINISTRATOR', 'ALL_USERS']
            })

            .state('logout.sidebarHome.tagStats', {
                url: '^/tag-stats',
                template: '<tag-stats></tag-stats>',
                title: 'CV aziendali - Statistiche Tag',
                profili: ['ADMINISTRATOR', 'ALL_USERS']
            })

            .state('logout.sidebarHome.softwareStats', {
                url: '^/software-stats',
                template: '<software-stats></software-stats>',
                title: 'CV aziendali - Statistiche Software',
                profili: ['ADMINISTRATOR', 'ALL_USERS']
            })

            .state('logout.sidebarHome.hardwareStats', {
                url: '^/hardware-stats',
                template: '<hardware-stats></hardware-stats>',
                title: 'CV aziendali - Statistiche Hardware',
                profili: ['ADMINISTRATOR', 'ALL_USERS']
            })

            .state('logout.sidebarHome.hardwareReports', {
                url: '^/hardware-reports',
                template: '<hardware-reports></hardware-reports>',
                title: 'CV aziendali - Reports Hardware',
                profili: ['ADMINISTRATOR', 'ALL_USERS']
            })

            .state('logout.sidebarHome.tag', {
                url: '^/tag',
                template: '<ricerca-tag></ricerca-tag>',
                title: 'CV aziendali - Ricerca competenze',
                profili: ['ADMINISTRATOR', 'ALL_USERS']
            })

            .state('logout.sidebarImpiegato', {
                abstract: true,
                template: '<sidebar-impiegato></sidebar-impiegato><ui-view></ui-view>'
            })

            .state('logout.sidebarImpiegato.impiegato', {
                url: '^/impiegato/:id',
                template: '<impiegato></impiegato>',
                title: 'CV - '
            })

            .state('previewState', {
                url: '/preview',
                template: '<preview></preview>',
                title: 'CV aziendali - Anteprima stampa'
            })
            
            .state('logout.sidebarHome.societa', {
                url: '^/societa',
                template: '<societa></societa>',
                title: 'CV aziendali - Società',
                profili: ['ADMINISTRATOR']
            })
            
            .state('primoAccesso', {
                url: '^/primo-accesso',
                template: '<primo-accesso></primo-accesso>',
                title: 'CV aziendali - Primo accesso'
            });

        $urlRouterProvider.otherwise('/impiegati');

        var blueLinearMap = $mdThemingProvider.extendPalette('blue', {
            '500': '#0073aa'
        });

        $mdThemingProvider.definePalette('blueLinear', blueLinearMap);

        $mdThemingProvider.theme('default').primaryPalette('blueLinear');

    }])
    .run(function($rootScope, $state, token) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            const profilo = token.getProfile();
            if (fromState.name == 'primoAccesso' && token.getPrivacy() == 0 && toState.name != 'loginState') {
                event.preventDefault();
            } else if (toState.name == 'primoAccesso' && token.getPrivacy() == 1) {
                event.preventDefault();
            } else if (toState.profili != undefined && profilo != null && !toState.profili.includes(profilo)) {
                event.preventDefault();
                if (profilo == 'USER') {
                    $state.go('logout.sidebarImpiegato.impiegato', {id: token.getUser()});
                } else {
                    $state.go('logout.sidebarHome.impiegati');
                }
            }
        });
    });
