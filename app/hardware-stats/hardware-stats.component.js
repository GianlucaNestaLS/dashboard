angular.module('hardwareStats', [])
    .component('hardwareStats', {
        templateUrl: 'app/hardware-stats/hardware-stats.template.html',
        controller: ['$rootScope', 'opsHardwareStats', 'drawHardwareChart', '$state', 'token', '$location', function ($rootScope, opsHardwareStats, drawHardwareChart, $state, token, $location) {
         
            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();
            self.societa = self.profilo == 'ALL_USERS' ? token.getSocieta() : '';
            self.dipendente = '';
            self.colonna = 'marca_modello_notebook';

            // Ottieni i dati delle statistiche
            self.getHardwareStats = function () {
                if (!self.colonna) {
                    // console.log('Nessuna colonna selezionata');
                    return;
                }
                opsHardwareStats.getHardwareStats(self.societa, self.dipendente, self.colonna).then(function (result) {
                    // console.log('colonna', self.colonna)
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        // console.log('getHardwareStats', result.data);
                        self.statistiche = result.data.data;
                        drawHardwareChart.draw(result.data.data, self.colonna);
                        self.impiegati = result.data.imp;
                    }
                }).catch(function (error) {
                    console.error('Errore nella chiamata a getHardwareStats', error); // In caso di errore
                });
            };

            self.getHardwareStats();

            // Restituisce l'etichetta leggibile per la colonna selezionata
            self.getColonnaLabel = function () {
                const labels = {
                    marca_modello_notebook: 'Marca/Modello',
                    processore: 'Processore',
                    memoria_ram: 'Memoria RAM',
                    tipo_storage: 'Tipo Storage',
                    capacita_storage: 'Capacita Storage',
                    monitor_esterno: 'Monitor Esterno',
                    tastiera_mouse_esterni: 'Tastiera/Mouse Esterni',
                    stampante: 'Stampante'
                };
                return labels[self.colonna] || '';
            };

            self.formatStatName = function (name, colonna, index) {
                if (colonna === 'monitor_esterno' || colonna === 'tastiera_mouse_esterni' || colonna === 'stampante') {
                    // Per il primo elemento, mappiamo direttamente il valore
                    if (index === 0) {
                        self.firstStatValue = name ? 'Sì' : 'No'; // Memorizza il valore del primo elemento
                        return self.firstStatValue;
                    }
            
                    // Per il secondo elemento, deduciamo il valore dal primo
                    if (index === 1) {
                        return self.firstStatValue === 'Sì' ? 'No' : 'Sì';
                    }
                }
            
                // Ritorna il valore originale per colonne diverse
                return name;
            };
            
            

            // Ottieni il profilo dell'utente
            self.profilo = token.getProfile();

            if (self.profilo == 'ADMINISTRATOR') {
                opsHardwareStats.getSocieta().then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.listaSoc = result.data;
                    }
                });
            }
        }]
    })

    .factory('opsHardwareStats', ['$http', 'token', function ($http, token) {
        return {
            getHardwareStats: function getHardwareStats(societa, dipendente, colonna) {
                var options = getOptions();
                options.params = { societa, dipendente, colonna };
                return $http.get(serviceConfig.getHardwareStats, options);
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

    .factory('drawHardwareChart', [function () {
        return {
            draw: function (hardwareStats, colonna) {
                google.charts.load('current', { packages: ['corechart'] });
                google.charts.setOnLoadCallback(function () {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', colonna);
                    data.addColumn('number', 'Count');
    
    
                    if (colonna === 'monitor_esterno' || colonna === 'tastiera_mouse_esterni' || colonna === 'stampante') {
                        // Deduzione del valore del secondo elemento basata sul primo
                        let firstValue = hardwareStats[0]?.name === 0 ? 'No' : 'Sì'; // Valore del primo elemento
                        let secondValue = firstValue === 'No' ? 'Sì' : 'No'; // Valore dedotto per il secondo elemento
    
                        hardwareStats.forEach(function (element, index) {
                            let displayValue = index === 0 ? firstValue : secondValue;
    
                            console.log(`Elemento ${index}:`, {
                                originale: element,
                                displayValue,
                            });
    
                            data.addRow([displayValue, element.count]);
                        });
                    } else {
                        // Altre colonne, usa direttamente i valori
                        hardwareStats.forEach(function (element) {
                            data.addRow([element.name, element.count]);
                        });
                    }
    
                    // console.log('Dati trasformati per il grafico:', data);
    
                    var options = {
                        title: `Statistiche per ${colonna.replace('_', ' ').replace('_', ' ')}`,
                        width: 800,
                        height: 700,
                        is3D: true,
                    };
    
                    var chart = new google.visualization.PieChart(document.getElementById('tortaHardware'));
                    chart.draw(data, options);
                });
            }
        };
    }]);
    
       
