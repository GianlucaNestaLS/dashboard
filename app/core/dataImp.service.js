angular.module('dataImp')
    .service('dataImp', [function() {

        var self = this;

        var dati, /*foto,*/ path;

        self.hardware = {};
        self.software = {};

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
                
                data.hardware = angular.copy(dati.hardware);
                
                if (data.hardware && data.hardware.data_compilazione) {
                    var date = new Date(data.hardware.data_compilazione);
                
                    var year = date.getFullYear();
                    var month = (date.getMonth() + 1).toString().padStart(2, '0');
                    var day = date.getDate().toString().padStart(2, '0');
                
                    data.hardware.data_compilazione = `${year}-${month}-${day}`;
                    console.log('data', data.hardware.data_compilazione);
                }

                data.hardware.monitor_esterno = intToBool(data.hardware.monitor_esterno);
                data.hardware.stampante = intToBool(data.hardware.stampante);
                data.hardware.tastiera_mouse_esterni = intToBool(data.hardware.tastiera_mouse_esterni);

                data.software = angular.copy(dati.software);

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