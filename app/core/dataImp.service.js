angular.module('dataImp')
    .service('dataImp', [function() {

        var self = this;

        var dati, /*foto,*/ path;

        self.getDati = function(saving = false) {
            if (saving) {
                var data = {};
                data.pInfo = angular.copy(dati.pInfo);
                data.pInfo.dipendente = boolToInt(data.pInfo.dipendente);
                data.pInfo.selezionato = boolToInt(data.pInfo.selezionato);

                

                data.exp = angular.copy(dati.exp);
                data.exp.forEach(function (element) {
                    element.selezionato = boolToInt(element.selezionato);
                    if (!(element.azienda || element.mansione || element.annoIn || element.annoFine || element.descrizione)) {
                        data.exp.splice(data.exp.indexOf(element), 1);
                    }
                }, this);

                data.form = angular.copy(dati.form);
                data.form.forEach(function (element) {
                    element.selezionato = boolToInt(element.selezionato);
                    if (!(element.ente || element.certificazione || element.annoIn || element.annoFine)) {
                        data.form.splice(data.form.indexOf(element), 1);
                    }
                }, this);

                data.lang = angular.copy(dati.lang);
                data.lang.forEach(function (element) {
                    element.selezionato = boolToInt(element.selezionato);
                    if (!(element.lingua || element.ascoltato || element.parlato || element.scritto)) {
                        data.lang.splice(data.lang.indexOf(element), 1);
                    }
                }, this);


                data.tags = angular.copy(dati.tags).sort((a, b) => a.tag.toLowerCase() > b.tag.toLowerCase());
                
                console.log('dati hardware', dati.hardware);
                data.hardware = angular.copy(dati.hardware);

                console.log('data hardware', data.hardware);

                // if (!data.hardware.memoria_ram) data.hardware.memoria_ram = "N/A";
                // if (!data.hardware.tipo_storage) data.hardware.tipo_storage = "N/A";
                // if (!data.hardware.capacita_storage) data.hardware.capacita_storage = "0";
                // if (data.hardware.monitor_esterno === undefined || data.hardware.monitor_esterno === null) {
                //     data.hardware.monitor_esterno = 0;
                // }
                // if (data.hardware.tastiera_mouse_esterni === undefined || data.hardware.tastiera_mouse_esterni === null) {
                //     data.hardware.tastiera_mouse_esterni = 0;
                // }
                
                // if (data.hardware && data.hardware.data_compilazione) {
                //     var date = new Date(data.hardware.data_compilazione);
                
                //     var year = date.getFullYear();
                //     var month = (date.getMonth() + 1).toString().padStart(2, '0');
                //     var day = date.getDate().toString().padStart(2, '0');
                
                //     data.hardware.data_compilazione = `${year}-${month}-${day}`;
                // }

                // data.hardware.monitor_esterno = boolToInt(dati.hardware.monitor_esterno);
                // data.hardware.tastiera_mouse_esterni = boolToInt(dati.hardware.tastiera_mouse_esterni);
                // data.hardware.stampante = boolToInt(dati.hardware.stampante);

                data.software = angular.copy(dati.software);

                console.log('oggetto data inviato', data);
                return data;
            }
            return dati;
        };


        function boolToInt(bb) {
            return (bb ? 1 : 0);
        }

        function intToBool(int) {
            return int == true;
        }

        self.setDati = function(d) {
            dati = d;
        };
/*
        self.getFoto = function() {
            return foto;
        };

        self.setFoto = function(f) {
            foto = f;
        };
*/
        self.getPath = function() {
            return path;
        }

        self.setPath = function(p) {
            path = p;
        }

    }]);