angular.module('softwareStats', [])
    .component('softwareStats', {
        templateUrl: 'app/software-stats/software-stats.template.html',
        controller: ['$rootScope', 'opsSoftwareStats', 'drawSoftwareChart', '$state', 'token', '$location', function ($rootScope, opsStats, drawSoftwareChart, $state, token, $location) {
            var self = this;

            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();
            self.societa = self.profilo === 'ALL_USERS' ? token.getSocieta() : '';
            self.dipendente = '';
            self.colonna = 'sistema_operativo';

            // Ottieni i dati delle statistiche
            self.getSoftwareStats = function () {
                if (!self.colonna) {
                    // console.log('Nessuna colonna selezionata');
                    return;
                }
                opsStats.getSoftwareStats(self.societa, self.dipendente, self.colonna).then(function (result) {
                    // console.log('colonna', self.colonna)
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        // console.log('getSoftwareStats', result.data);
                        self.statistiche = result.data.data;
                        drawSoftwareChart.draw(result.data.data, self.colonna);
                        self.impiegati = result.data.imp;
                    }
                }).catch(function (error) {
                    console.error('Errore nella chiamata a getSoftwareStats', error); // In caso di errore
                });
            };

            self.getSoftwareStats();

            // Restituisce l'etichetta leggibile per la colonna selezionata
            self.getColonnaLabel = function () {
                const labels = {
                    sistema_operativo: 'Sistema Operativo',
                    office_suite: 'Office Suite',
                    browser: 'Browser',
                    antivirus: 'Antivirus',
                    software_comunicazione: 'Software Comunicazione',
                    software_crittografia: 'Software Crittografia',
                };
                return labels[self.colonna] || '';
            };

            // Carica la lista delle società solo per gli amministratori
            if (self.profilo === 'ADMINISTRATOR') {
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

    .factory('opsSoftwareStats', ['$http', 'token', function ($http, token) {
        return {
            getSoftwareStats: function getSoftwareStats(societa, dipendente, colonna) {
                var options = getOptions();
                options.params = { societa, dipendente, colonna };
                return $http.get(serviceConfig.getSoftwareStats, options);
            },

            getSocieta: function getSocieta() {
                return $http.get(serviceConfig.getSocieta, getOptions());
            }
        };

        function getOptions() {
            return {
                headers: {
                    'session-user': token.getUser(),
                    'session-token': token.getToken(),
                }
            };
        }
    }])

    .factory('drawSoftwareChart', [function () {
        return {
            draw: function (softwareStats, colonna) {
                google.charts.load('current', { packages: ['corechart'] });
                google.charts.setOnLoadCallback(function () {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', colonna);
                    data.addColumn('number', 'Count');
                    softwareStats.forEach(function (element) {
                        data.addRow([element.name, element.count]);
                    });
                    var options = {
                        title: `Statistiche per ${colonna.replace('_', ' ')}`,
                        width: 800,
                        height: 700,
                        is3D: true,
                    };
                    var chart = new google.visualization.PieChart(document.getElementById('tortaSoftware'));
                    chart.draw(data, options);
                });
            }
        };
    }]);
