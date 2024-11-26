angular.module('stats')
    .component('stats', {
        templateUrl: 'app/stats/stats.template.html',
        controller: ['opsStats', 'drawChart', '$location', '$rootScope', '$state', 'token', '$scope', function (opsStats, drawChart, $location, $rootScope, $state, token, $scope) {

            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();
            self.societa = self.profilo == 'ALL_USERS' ? token.getSocieta() : '';
            self.dipendente = '';

            self.getStats = function () {
                opsStats.getStats(self.societa, self.dipendente).then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.statistiche = result.data.data;
                        drawChart.draw(result.data.data);
                        self.impiegati = result.data.imp;
                    }
                });
            };
            self.getStats();

            if (self.profilo == 'ADMINISTRATOR') {
                opsStats.getSocieta().then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.listaSoc = result.data;
                    }
                });
            }
        }]

    })

    .factory('opsStats', ['$http', 'token', function ($http, token) {
        return {
            getStats: function getStats(societa, dipendente) {
                var options = getOptions();
                options.params = {
                    societa: societa,
                    dipendente: dipendente
                };
                return $http.get(serviceConfig.getStats, options);
            },

            getSocieta: function getSocieta() {
                return $http.get(serviceConfig.getSocieta, getOptions());
            }
        }

        function getOptions() {
            return options = {
                headers: {
                    'session-user': token.getUser(),
                    'session-token': token.getToken()
                }
            };
        }
    }])

    .factory('drawChart', [function () {
        return {
            draw: function (stats) {
                google.charts.load('current', { 'packages': ['corechart'] });
                google.charts.setOnLoadCallback(function () {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Tag');
                    data.addColumn('number', 'Count');
                    stats.forEach(function (element) {
                        data.addRow([element.name, element.count]);
                    }, this);
                    var options = {
                        'title': 'PieChart',
                        'width': 800,
                        'height': 700,
                        //pieHole: 0.2,
                        is3D: true,
                    };
                    var chart = new google.visualization.PieChart(document.getElementById('torta'));
                    chart.draw(data, options);
                });
            }
        };
    }]);