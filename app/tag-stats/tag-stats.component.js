angular.module('tagStats')
    .component('tagStats', {
        templateUrl: 'app/tag-stats/tag-stats.template.html',
        controller: ['tagStats', 'drawTagsChart', '$location', '$rootScope', '$state', 'token', '$scope', function (tagStats, drawTagsChart, $location, $rootScope, $state, token, $scope) {

            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();
            self.societa = self.profilo == 'ALL_USERS' ? token.getSocieta() : '';
            self.dipendente = '';

            self.getTagStats = function () {
                tagStats.getTagStats(self.societa, self.dipendente).then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.statistiche = result.data.data;
                        drawTagsChart.draw(result.data.data);
                        self.impiegati = result.data.imp;
                    }
                });
            };
            self.getTagStats();

            if (self.profilo == 'ADMINISTRATOR') {
                tagStats.getSocieta().then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.listaSoc = result.data;
                    }
                });
            }
        }]

    })

    .factory('tagStats', ['$http', 'token', function ($http, token) {
        return {
            getTagStats: function getTagStats(societa, dipendente) {
                var options = getOptions();
                options.params = {
                    societa: societa,
                    dipendente: dipendente
                };
                return $http.get(serviceConfig.getTagStats, options);
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

    .factory('drawTagsChart', [function () {
        return {
            draw: function (tagStats) {
                google.charts.load('current', { 'packages': ['corechart'] });
                google.charts.setOnLoadCallback(function () {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Tag');
                    data.addColumn('number', 'Count');
                    tagStats.forEach(function (element) {
                        data.addRow([element.name, element.count]);
                    }, this);
                    var options = {
                        'title': 'Statistiche per Tags',
                        'width': 800,
                        'height': 700,
                        //pieHole: 0.2,
                        is3D: true,
                    };
                    var chart = new google.visualization.PieChart(document.getElementById('tortaTag'));
                    chart.draw(data, options);
                });
            }
        };
    }]);