angular.module('hardwareReports', [])
    .component('hardwareReports', {
        templateUrl: 'app/hardware-reports/hardware-reports.template.html',
        controller: ['$rootScope', 'opsHardwareReports', '$state', 'token', '$location', function ($rootScope, opsHardwareReports, $state, token, $location) {
         
            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();
            self.societa = self.profilo == 'ALL_USERS' ? token.getSocieta() : '';
            self.dipendente = '';
            self.colonna = 'all'; // Default per tutte le colonne
            self.selectedColumns = []; // Colonne da mostrare nella tabella

            // Ottieni i dati delle statistiche
            self.getHardwareReports = function () {
                if (!self.colonna) {
                    return;
                }
            
                opsHardwareReports.getHardwareReports(self.societa, self.dipendente, self.colonna).then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.statistiche = result.data.data;
                        self.impiegati = result.data.data.length;
            
                        // Log per verificare cosa contiene impiegati
                        // console.log('impiegati:', self.impiegati);
            
                        // Verifica se impiegati è un array
                        if (Array.isArray(self.impiegati)) {
                            console.log()
                            self.impiegatiCount = self.impiegati.length; // Conta gli elementi nell'array
                        } else if (typeof self.impiegati === 'number') {
                            self.impiegatiCount = self.impiegati; // Se impiegati è un numero, usa direttamente il valore
                        } else if (typeof self.impiegati === 'object' && self.impiegati !== null) {
                            self.impiegatiCount = Object.keys(self.impiegati).length; // Se impiegati è un oggetto, conta le chiavi
                        } else {
                            self.impiegatiCount = 0; // Default in caso di formati inaspettati
                        }
            
                        // Log per vedere il conteggio
                        // console.log('Impiegati count:', self.impiegatiCount);
            
                        // Aggiorna le colonne selezionate
                        if (self.colonna === 'all') {
                            self.selectedColumns = Object.keys(self.statistiche[0] || {}); // Usa tutte le colonne
                        } else {
                            self.selectedColumns = ['nome', 'cognome', self.colonna]; // Aggiungi nome e cognome
                        }
            
                        // Modifica i valori per monitor_esterno, tastiera_mouse_esterni, stampante
                        self.statistiche.forEach(function(stat) {
                            ['monitor_esterno', 'tastiera_mouse_esterni', 'stampante'].forEach(function(col) {
                                if (stat[col] === 1) {
                                    stat[col] = 'Sì';
                                } else if (stat[col] === 0) {
                                    stat[col] = 'No';
                                }
                            });
                        });
                    }
                }).catch(function (error) {
                    console.error('Errore nella chiamata a getHardwareReports', error);
                });
            };
        
            self.getHardwareReports();

            self.formatStatName = function (name, colonna, index) {
                // Per le colonne monitor_esterno, tastiera_mouse_esterni, stampante
                if (colonna === 'monitor_esterno' || colonna === 'tastiera_mouse_esterni' || colonna === 'stampante') {
                    return name === 1 ? 'Sì' : (name === 0 ? 'No' : name);
                }
            
                // Ritorna il valore originale per colonne diverse
                return name;
            };

            // Restituisce l'etichetta leggibile per la colonna selezionata
            self.formatColumnLabel = function (col) {
                const formattedLabels = {
                    nome: 'Nome',
                    cognome: 'Cognome',
                    nome_dispositivo: 'Nome Dispositivo',
                    marca_modello_notebook: 'Marca/Modello',
                    serial_number: 'Serial Number',
                    product_key: 'Product Key',
                    mac_address: 'MAC Address',
                    processore: 'Processore',
                    memoria_ram: 'Memoria RAM',
                    tipo_storage: 'Tipo Storage',
                    capacita_storage: 'Capacità Storage',
                    monitor_esterno: 'Monitor Esterno',
                    tastiera_mouse_esterni: 'Tastiera/Mouse Esterni',
                    stampante: 'Stampante',
                    data_compilazione: 'Data Compilazione'
                };
                return formattedLabels[col] || col.replace(/_/g, ' ').toUpperCase(); // Replace underscores with space and capitalize
            };

            // Ottieni il profilo dell'utente
            if (self.profilo === 'ADMINISTRATOR') {
                opsHardwareReports.getSocieta().then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.listaSoc = result.data;
                    }
                });
            }
      
        
            self.printReport = function () {
                // Crea un overlay grigio chiaro
                var overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(200, 200, 200, 1)';
                overlay.style.zIndex = '9999';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.fontSize = '20px';
                overlay.style.color = '#333';
                document.body.appendChild(overlay);
            
                // Nascondi gli elementi della pagina
                $('#container').hide();
                $('#logoutBar').hide();
                $('#header').hide();
                $('#body').hide();
                $('#tableContainer').hide();
                $('#printButton').hide();
            
                // Crea l'intestazione del report con il titolo, la data odierna e il conteggio degli impiegati
                var printContent = `
                    <div style="text-align: center;">
                        <h1>Report Hardware</h1>
                        <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Totale Impiegati considerati:</strong> ${self.impiegatiCount}</p>
                    </div>
                    <style>
                        body {
                            margin: 20px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            table-layout: fixed;
                            margin-top: 20px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                            word-wrap: break-word;
                        }
                        th {
                            background-color: #f4f4f4;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            table {
                                width: 100%;
                                table-layout: fixed;
                                margin: 0;
                                padding: 0;
                            }
                            td, th {
                                word-wrap: break-word;
                            }
                        }
                    </style>
                    <table class="table table-striped table-bordered col-xs-10" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                ${self.selectedColumns.map(function (col) {
                                    return `<th>${self.formatColumnLabel(col)}</th>`;
                                }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                `;
            
                // Aggiungi le righe della tabella con i dati già formattati
                self.statistiche.forEach(function (stat) {
                    printContent += '<tr>';
                    self.selectedColumns.forEach(function (col) {
                        var statValue = self.formatStatName(stat[col], col);
                        printContent += `<td>${statValue}</td>`;
                    });
                    printContent += '</tr>';
                });
            
                printContent += '</tbody></table>';
            
                // Crea un contenitore temporaneo per la stampa
                var printWindow = document.createElement('div');
                printWindow.innerHTML = printContent;
                document.body.appendChild(printWindow);
            
                // Stampa il contenuto
                setTimeout(function () {
                    window.print();
            
                    // Rimuovi l'overlay
                    document.body.removeChild(overlay);
            
                    // Rimuovi il contenitore di stampa dopo che la stampa è avvenuta
                    document.body.removeChild(printWindow);
            
                    // Ripristina gli elementi originali della pagina
                    $('#container').show();
                    $('#logoutBar').show();
                    $('#header').show();
                    $('#body').show();
                    $('#tableContainer').show();
                    $('#printButton').show();
                }, 100); // Ritardo per garantire che l'overlay sia visibile
            };
            
        }]
    })

    .factory('opsHardwareReports', ['$http', 'token', function ($http, token) {
        return {
            getHardwareReports: function getHardwareReports(societa, dipendente, colonna) {
                var options = getOptions();
                options.params = { societa, dipendente, colonna };
                return $http.get(serviceConfig.getHardwareReports, options);
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
    }]);
