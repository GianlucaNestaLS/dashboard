angular.module('sidebarHome')
    // .config(['$animateProvider', function ($animateProvider) {
    //     $animateProvider.classNameFilter(/^(?!.*submenu).*$/); // Esclude le animazioni per il sottomenu
    // }])
    .component('sidebarHome', {
        templateUrl: 'app/sidebar-home/sidebar-home.template.html',
        controller: ['token', '$state', '$location', '$timeout', function (token, $state, $location, $timeout) {
            var self = this;

            // console.log('[sidebarHome] Controller inizializzato');

            self.societa = $state.get('logout.sidebarHome.societa').profili.includes(token.getProfile());
            // console.log('[sidebarHome] Accesso società:', self.societa);

            self.activeMenu = null;
            self.activeSubmenu = null;

            // Funzione per gestire il comportamento di toggle tra statistiche e reports
            self.toggleSubmenu = function (menu) {
                // console.log('[toggleSubmenu] Menu selezionato:', menu);
                if (self.activeSubmenu === menu) {
                    self.activeSubmenu = null;
                } else {
                    // Chiudi il menu opposto se aperto
                    if (menu === 'stats' && self.activeSubmenu === 'reports') {
                        self.activeSubmenu = null; // Chiudi "Reports" se è aperto
                    }
                    if (menu === 'reports' && self.activeSubmenu === 'stats') {
                        self.activeSubmenu = null; // Chiudi "Statistiche" se è aperto
                    }

                    self.activeSubmenu = menu; // Apri il menu selezionato
                }
                // console.log('[toggleSubmenu] Stato aggiornato - activeSubmenu:', self.activeSubmenu);
            };

            // Funzione per gestire l'inizializzazione del componente
            self.$onInit = function () {
                // console.log('[onInit] Inizializzazione del componente');
                self.updateStateForMenu('stats'); // Imposta lo stato predefinito
            };

            // Gestisce eventuali cambiamenti nel componente
            // self.$onChanges = function () {
                // console.log('[onChanges] Cambiamenti rilevati nel componente');
            // };

        }]
    });
