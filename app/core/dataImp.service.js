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
                return data;
            }
            return dati;
        };

        function boolToInt(bb) {
            return (bb ? 1 : 0);
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