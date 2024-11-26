angular.module('sidebarHome')
    .component('sidebarHome', {
        templateUrl: 'app/sidebar-home/sidebar-home.template.html',
        controller: ['token', '$state', function (token, $state) {
            var self = this;
            self.societa = $state.get('logout.sidebarHome.societa').profili.includes(token.getProfile());
        }]
    });