angular.module('impiegato')
    .component('impiegato', {
        templateUrl: 'app/impiegato/impiegato.template.html',
        controller: ['impiegatoOp', '$location', 'token', '$stateParams', '$scope', 'dataImp', '$mdDialog', 'md5', '$state', '$stateParams', '$rootScope', '$mdSidenav',
            function (impiegatoOp, $location, token, $stateParams, $scope, dataImp, $mdDialog, md5, $state, $stateParams, $rootScope, $mdSidenav) {
                var self = this;

                $(window).scrollTop(0);

                var id = $stateParams.id;
                const user_id = token.getUser();
                self.profilo = token.getProfile();
                if (id != user_id && self.profilo == 'USER') {
                    $location.path('/impiegato/' + user_id);
                }

                /*$(document).prop('title', 'CV - ' + id);*/
                //$rootScope.title = $state.current.title + $stateParams.id;

                /* ------------------------------------ TASTO TAGS ------------------------------------ */
                self.showTag = false;
                $scope.$on('tags', function (event, args) {
                    buildToggler('right');
                });

                function buildToggler(navID) {
                    $mdSidenav(navID).toggle();
                }

                impiegatoOp.getTags().then(function(result) {
                    result.data.forbidden ? $location.path('/login') : self.all_tags = result.data;
                });

                /* ------------------------------------ TASTO SALVA ------------------------------------ */
                // $scope.$on('salva', function (event, args) {
                //     const email_pers = checkEmailPers();
                //     const lingue = checkLingue();
                //     if (email_pers && lingue) {
                //         impiegatoOp.salvaDati(datiPagina()).then(function (result) {
                //             console.log('impiegatoOp.salvaDati', result);
                //             if (result.data.forbidden) {
                //                 $location.path('/login');
                //             } else if (result.data.success) {
                //                 toastOk.text = 'Salvataggio dati avvenuto con successo.';
                //                 $.toast(toastOk);
                //             } else {
                //                 toastErr(result.data.errorMsg);
                //             }
                //         });
                //     } else {
                //         if (!email_pers) toastErr('Formato e-mail non valido!');
                //         if (!lingue) toastErr('Campi lingua non valorizzati!');
                //     }
                // });

                $scope.$on('salva', function (event, args) {
                    const email_pers = checkEmailPers();
                    const lingue = checkLingue();
                    if (email_pers && lingue) {
                        const dati = datiPagina();

                        const datiHardware = getDatiHardware();
                        console.log('datiHardware', datiHardware);
                        // datiHardwareSoftware.dataCompilazione = datiHardwareSoftware.dataCompilazione.toISOString().split('T')[0];
                        // console.log('datiHardwareSoftware', datiHardwareSoftware);
                        // dataImp.hardwareSoftware = datiHardwareSoftware;

                    console.log('dati', dati);  
                
                        impiegatoOp.salvaDati(dati).then(function (result) {
                            console.log('impiegatoOp.salvaDati', result);
                            if (result.data.forbidden) {
                                $location.path('/login');
                            } else if (result.data.success) {
                                toastOk.text = 'Salvataggio dati avvenuto con successo.';
                                $.toast(toastOk);
                            } else {
                                console.log('Errore durante il salvataggio:', result.data.errorMsg);
                                toastErr(result.data.errorMsg);
                            }
                        });
                    } else {
                        if (!email_pers) toastErr('Formato e-mail non valido!');
                        if (!lingue) toastErr('Campi lingua non valorizzati!');
                    }
                });

                function getDatiHardware() {
                    return {
                        dataCompilazione: self.hardware.data_compilazione,
                        marcaModelloNotebook: self.hardware.marca_modello_notebook,
                        serialNumber: self.hardware.serial_number,
                        
                      
                    };
                }

                function checkEmailPers() {
                    return self.pInfo.email_pers == '' || self.pInfo.email_pers == null || /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}/.test(self.pInfo.email_pers);
                }

                function checkLingue() {
                    var ret = true;
                    self.lang.forEach(function (element) {
                        if ((element.lingua == '' || element.ascoltato == '' || element.parlato == '' || element.scritto == '') && !(element.lingua == '' && element.ascoltato == '' && element.parlato == '' && element.scritto == '')) {
                            ret = false;
                        }
                    }, this);
                    return ret;
                }

                /* ------------------------------------ TASTO HOME ------------------------------------ */
                $scope.$on('backHome', function (event, args) {

                    impiegatoOp.getDataFromDB(id).then(function (result) {
                        if (result.data.forbidden) {
                            $location.path('/login');
                        } else {
                            var md5DB = md5.createHash(JSON.stringify(result.data) || '');
                            var md5Pagina = md5.createHash(JSON.stringify(datiPagina()) || '');
                            if (md5DB === md5Pagina) {
                                $location.path('/impiegati');
                            } else {
                                saveDialog(event);
                            }
                        }
                    });

                });

                /* ------------------------------------ SAVE DIALOG ------------------------------------ */
                function saveDialog(ev) {
                    $mdDialog.show({
                        controller: saveDialogController,
                        templateUrl: 'app/dialogs/saveDialog.template.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    })
                    .then(function (answer) {
                        if (answer != 'annulla') {
                            if (answer == 'salva') {
                                const email_pers = checkEmailPers();
                                const lingue = checkLingue();
                                if (email_pers && lingue) {
                                    impiegatoOp.salvaDati(datiPagina()).then(function (result) {
                                        if (result.data.forbidden) {
                                            $location.path('/login');
                                        } else {
                                            result.data.success ? $location.path('/impiegati') : toastErr(result.data.errorMsg);
                                        }
                                    });
                                } else {
                                    if (!email_pers) toastErr('Formato e-mail non valido!');
                                    if (!lingue) toastErr('Campi lingua non valorizzati!');
                                }
                            } else {
                                $location.path('/impiegati');
                            }
                        }
                    }, function() {});
                }

                function saveDialogController($scope, $mdDialog) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };
                }

                /* ------------------------------------ GET DATI IMPIEGATO ------------------------------------ */
                //if (!dataImp.getDati() || dataImp.getDati().pInfo.id != id) {
                    impiegatoOp.getProfilePicsPath().then(function (result) {
                        if (result.data.forbidden) {
                            $location.path('/login');
                        } else {
                            dataImp.setPath(result.data.path);
                            getDatiImpiegato(id);
                        }
                    });
                /*} else {
                    self.pInfo = dataImp.getDati().pInfo;
                    self.foto = dataImp.getFoto();
                    self.exp = dataImp.getDati().exp;
                    self.form = dataImp.getDati().form;
                    self.lang = dataImp.getDati().lang;
                    self.tags = dataImp.getDati().tags;
                    self.listLvl = dataImp.getDati().listLvl;
                    self.listLang = dataImp.getDati().listLang;
                    self.years = setYears();
                }*/
                
                function getDatiImpiegato(id) {
                    impiegatoOp.getDatiImpiegato(id).then(function (result) {
                        if (result.data.forbidden) {
                            $location.path('/login');
                        } else {
                            dataImp.setDati(result.data);
                
                            if (result.data.pInfo) {
                                self.pInfo = result.data.pInfo;
                                self.pInfo.dipendente = intToBool(self.pInfo.dipendente);
                                self.pInfo.selezionato = intToBool(self.pInfo.selezionato);
                                $rootScope.title = $state.current.title + self.pInfo.nome + ' ' + self.pInfo.cognome;
                            } else {
                                console.error('pInfo is null or undefined');
                            }
                            self.exp = dataImp.getDati().exp;
                            self.exp.forEach(function (element) {
                                element.selezionato = intToBool(element.selezionato);
                            }, this);
                
                            self.form = dataImp.getDati().form;
                            self.form.forEach(function (element) {
                                element.selezionato = intToBool(element.selezionato);
                            }, this);
                
                            self.lang = dataImp.getDati().lang;
                            self.lang.forEach(function (element) {
                                element.selezionato = intToBool(element.selezionato);
                            }, this);
                
                            self.tags = dataImp.getDati().tags;
                            self.listLvl = dataImp.getDati().listLvl;
                            self.listLang = dataImp.getDati().listLang;
                            self.years = setYears();

                            self.hardware = dataImp.getDati().hardware;
                            self.software = dataImp.getDati().software;

                            if (self.hardware && self.hardware.data_compilazione) {
                                var [year, month] = self.hardware.data_compilazione.split('-');
                                var monthIndex = month - 1;
                                self.hardware = angular.copy(self.hardware);
                                self.hardware.data_compilazione = new Date(year, monthIndex, 1);
                                dataImp.getDati().hardware.data_compilazione = self.hardware.data_compilazione; 
                            }
                        }
                
                        if (self.profilo == 'ALL_USERS' && self.pInfo.id_soc != token.getSocieta()) {
                            $location.path('/impiegati');
                        }
                    });
                }
                    

                // function getDatiImpiegato(id) {
                //     impiegatoOp.getDatiImpiegato(id).then(function (result) {
                //         if (result.data.forbidden) {
                //             $location.path('/login');
                //         }
                //         else {

                //             dataImp.setDati(result.data);

                //             self.pInfo = dataImp.getDati().pInfo;
                //             self.pInfo.dipendente = intToBool(dataImp.getDati().pInfo.dipendente);
                //             self.pInfo.selezionato = intToBool(dataImp.getDati().pInfo.selezionato);
                //             $rootScope.title = $state.current.title + self.pInfo.nome + ' ' + self.pInfo.cognome;

                //             //dataImp.setFoto(dataImp.getPath() + '/' + dataImp.getDati().pInfo.foto);// + '.jpg');
                //             //self.foto = dataImp.getFoto();
                //             self.foto = dataImp.getPath() + '/' + dataImp.getDati().pInfo.foto;
                //             if (dataImp.getDati().pInfo.foto == null) {
                //                 self.foto = dataImp.getPath() + '/' + dataImp.getDati().pInfo.logo;
                //             }
                //             self.exp = dataImp.getDati().exp;
                //             self.exp.forEach(function (element) {
                //                 element.selezionato = intToBool(element.selezionato);
                //             }, this);

                //             self.form = dataImp.getDati().form;
                //             self.form.forEach(function (element) {
                //                 element.selezionato = intToBool(element.selezionato);
                //             }, this);

                //             self.lang = dataImp.getDati().lang;
                //             self.lang.forEach(function (element) {
                //                 element.selezionato = intToBool(element.selezionato);
                //             }, this);

                //             self.tags = dataImp.getDati().tags;
                //             self.listLvl = dataImp.getDati().listLvl;
                //             self.listLang = dataImp.getDati().listLang;

                //             self.years = setYears();
                //             //setLang();
                //         }
                //         if (self.profilo == 'ALL_USERS' && self.pInfo.id_soc != token.getSocieta()) {
                //             $location.path('/impiegati');
                //         }
                //     });
                // }


                /* ------------------------------------ DIALOG FOTO PROFILO ------------------------------------ */
                self.changeProfilePic = function (ev) {
                    $mdDialog.show({
                        controller: DialogController,
                        templateUrl: 'app/dialogs/profilePics.template.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: { path: dataImp.getPath() }
                    })
                    .then(function (answer) {
                        self.foto = answer;
                        dataImp.getDati().pInfo.foto = self.foto.split('/').pop();//.split('.')[0];
                        //dataImp.setFoto(dataImp.getPath() + '/' + dataImp.getDati().pInfo.foto);// + '.jpg');
                    }, function() {});
                };

                function DialogController($scope, $mdDialog, path) {

                    $scope.profilePics = [];

                    impiegatoOp.getProfilePics().then(function (result) {
                        if (result.data.forbidden) {
                            $location.path('/login');
                        } else {
                            result.data.forEach(element => {
                                $scope.profilePics.push({
                                    path: path + '/' + element,// + '.jpg',
                                    caption: element
                                });
                            });
                        }
                    });

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                    $scope.caricaFoto = function (files) {
                        var file = files[0];
                        if (file.type.includes('image/')) {
                            impiegatoOp.caricaFoto(file).then(function(result) {
                                if (result.data.forbidden) {
                                    $location.path('/login');
                                } else if (result.data.success) {
                                    $scope.answer(path + '/' + file.name);
                                } else {
                                    toastErr(result.data.msg);
                                }
                            });
                        } else {
                            toastErr('Formato file non valido!');
                        }
                    };
                };


                /* ------------------------------------ MANSIONE DIALOG ------------------------------------ */
                self.mansioneDialog = function(ev) {
                    $mdDialog.show({
                        controller: mansioneDialogController,
                        templateUrl: 'app/dialogs/mansioneDialog.template.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: { mansione: self.pInfo.mansione }
                    });
                };

                function mansioneDialogController($scope, $mdDialog, mansione) {

                    $scope.man = mansione;

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function () {
                        self.pInfo.mansione = $scope.man;
                        $mdDialog.hide();
                    };
                };

                /* ------------------------------------ ESPERIENZA DIALOG ------------------------------------ */
                self.expDialog = function(ev, i) {
                    $mdDialog.show({
                        controller: expDialogController,
                        templateUrl: 'app/dialogs/expDialog.template.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: {
                            modifica: (ev.currentTarget.name == 'modificaExp'),
                            index: i
                        }
                    });
                };

                function expDialogController($scope, $mdDialog, modifica, index) {
                    $scope.modifica = modifica;
                    $scope.titolo = modifica ? 'Modifica Esperienza' : 'Nuova Esperienza';
                    $scope.years = setYears();

                    if (index >= 0) {
                        $scope.mansione = self.exp[index].mansione;
                        $scope.azienda = self.exp[index].azienda;
                        $scope.annoFine = self.exp[index].annoFine;
                        $scope.annoInizio = self.exp[index].annoIn;
                        $scope.descrizione = self.exp[index].descrizione;
                    }

                    $scope.compareDate = function() {
                        $scope.expForm.annoInizio.$setValidity('compareDate', true);
                        $scope.expForm.annoFine.$setValidity('compareDate', true);
                        if ($scope.annoInizio > $scope.annoFine && $scope.annoFine != '') {
                            $scope.expForm.annoInizio.$setValidity('compareDate', false);
                            $scope.expForm.annoFine.$setValidity('compareDate', false);
                        }
                    }

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function () {
                        if (index >= 0) {
                            self.exp[index].mansione = $scope.mansione;
                            self.exp[index].azienda = $scope.azienda;
                            self.exp[index].annoFine = ($scope.annoFine == undefined || $scope.annoFine == '') ? null : $scope.annoFine;
                            self.exp[index].annoIn = $scope.annoInizio;
                            self.exp[index].descrizione = $scope.descrizione;
                        } else {
                            self.exp.push({
                                mansione: $scope.mansione,
                                azienda: $scope.azienda,
                                annoFine: ($scope.annoFine == undefined || $scope.annoFine == '') ? null : $scope.annoFine,
                                annoIn: $scope.annoInizio,
                                descrizione: $scope.descrizione == undefined ? null : $scope.descrizione,
                                selezionato: true
                            });
                        }
                        self.exp.sort((a, b) => {
                            // ordinamento per anno inizio decrescente, mettendo prima l'elemento con anno fine null
                            if (a.annoFine == null && b.annoFine == null) {
                                return b.annoIn > a.annoIn ? 1 : -1;
                            } else if (a.annoFine == null) {
                                return -1;
                            } else if (b.annoFine == null) {
                                return 1;
                            } else if (a.annoIn > b.annoIn) {
                                return -1;
                            } else if (a.annoIn < b.annoIn) {
                                return 1;
                            }
                            return 0;
                        });
                        $mdDialog.hide();
                    };
                };


                /* ------------------------------------ DELETE ESPERIENZA ------------------------------------ */
                self.deleteExp = function (exp) {
                    var index = self.exp.indexOf(exp);
                    self.exp.splice(index, 1);
                }


                /* ------------------------------------ FORMAZIONE DIALOG ------------------------------------ */
                self.formDialog = function(ev, i) {
                    $mdDialog.show({
                        controller: formDialogController,
                        templateUrl: 'app/dialogs/formDialog.template.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: {
                            modifica: (ev.currentTarget.name == 'modificaForm'),
                            index: i
                        }
                    });
                };

                function formDialogController($scope, $mdDialog, modifica, index) {
                    $scope.modifica = modifica;
                    $scope.titolo = modifica ? 'Modifica Formazione' : 'Nuova Formazione';
                    $scope.years = setYears();

                    if (index >= 0) {
                        $scope.certificazione = self.form[index].certificazione;
                        $scope.annoFine = self.form[index].annoFine;
                        $scope.annoInizio = self.form[index].annoIn;
                        $scope.ente = self.form[index].ente;
                    }

                    $scope.compareDate = function() {
                        $scope.formForm.annoInizio.$setValidity('compareDate', true);
                        $scope.formForm.annoFine.$setValidity('compareDate', true);
                        if ($scope.annoInizio > $scope.annoFine) {
                            $scope.formForm.annoInizio.$setValidity('compareDate', false);
                            $scope.formForm.annoFine.$setValidity('compareDate', false);
                        }
                    }

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function () {
                        if (index >= 0) {
                            self.form[index].certificazione = $scope.certificazione;
                            self.form[index].annoFine = $scope.annoFine;
                            self.form[index].annoIn = $scope.annoInizio;
                            self.form[index].ente = $scope.ente;

                        }
                        else {
                            self.form.push({
                                certificazione: $scope.certificazione,
                                annoFine: $scope.annoFine,
                                annoIn: $scope.annoInizio,
                                ente: $scope.ente == undefined ? null : $scope.ente,
                                selezionato: true
                            });
                        }
                        self.form.sort((a, b) => b.annoIn - a.annoIn);
                        $mdDialog.hide();
                    };
                };


                /* ------------------------------------ DELETE FORMAZIONE ------------------------------------ */
                self.deleteForm = function (form) {
                    var index = self.form.indexOf(form);
                    self.form.splice(index, 1);
                }


                /* ------------------------------------ AGGIUNGI LINGUA ------------------------------------ */
                self.addLang = function () {
                    self.lang.push({
                        lingua: '', ascoltato: '', parlato: '',
                        scritto: '', selezionato: true
                    });
                }


                /* ------------------------------------ CANCELLA LINGUA ------------------------------------ */
                self.deleteLang = function (lang) {
                    var index = self.lang.indexOf(lang);
                    self.lang.splice(index, 1);
                }

                /* ------------------------------------ MUOVI LINGUA ------------------------------------ */
                self.moveLang = function (lang) {
                    var index = self.lang.indexOf(lang);
                    if (index != 0) {
                        self.lang.splice(index, 1);
                        self.lang.splice(index - 1, 0, lang);
                    }
                }


                /* ------------------------------------ CONTROLLO DOPPIONI LINGUA ------------------------------------ */
                self.checkLang = function (lang) {
                    var count = 0;
                    for (var i = 0; i < self.lang.length; i++)
                        if (self.lang[i].lingua === lang) {
                            count++;
                            if (count > 1) return true;
                        }
                    return false;
                }

                /* ------------------------------------ TAG DIALOG ------------------------------------ */
                self.tagDialog = function(ev) {
                    $mdDialog.show({
                        controller: tagDialogController,
                        templateUrl: 'app/dialogs/tagDialog.template.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    })
                    .then(function(answer) {
                        if (answer) {
                            self.tags.push({tag: answer});
                        }
                    }, function() {});
                };

                function tagDialogController($scope, $mdDialog, $timeout) {

                    $timeout(function () {
                        $scope.tagForm.tag.$setValidity('empty', false);
                        var input = $('md-autocomplete[md-input-maxlength]');
                        $('input', input).attr('maxlength', input.attr('md-input-maxlength'));
                    }, 500);

                    $scope.checkTag = function () {
                        $scope.tagForm.tag.$setValidity('check', true);
                        const tag = $scope.tag || $scope.searchText;
                        if (self.tags && tag) {
                            for (var i = 0; i < self.tags.length; i++) {
                                if (self.tags[i].tag.toLowerCase() === tag.toLowerCase()) {
                                    $scope.tagForm.tag.$setValidity('check', false);
                                }
                            }
                        }
                        $scope.tagForm.tag.$setValidity('empty', $scope.searchText != '');
                    };

                    $scope.querySearch = function (query) {
                        var results = query ? self.all_tags.filter(createFilterFor(query)) : self.all_tags;
                        return results;
                    };

                    function createFilterFor(query) {
                        var lowercaseQuery = query.toLowerCase();
                        return function filterFn(tag) {
                            return tag.toLowerCase().indexOf(lowercaseQuery) == 0;
                            //return tag.toLowerCase().includes(lowercaseQuery);
                        }
                    }

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function () {
                        $mdDialog.hide($scope.tag || $scope.searchText);
                    };
                };

                self.deleteTag = function (tag) {
                    var index = self.tags.indexOf(tag);
                    self.tags.splice(index, 1);
                }

                self.closeNav = function () {
                    self.showTag = !self.showTag;
                }

                function intToBool(int) {
                    return int == true;
                }
/*
                function boolToInt(bb) {
                    return (bb ? 1 : 0);
                }
*/
                function setYears() {
                    var year = new Date().getFullYear();
                    var range = [];
                    for (var i = year; i > 1969; i--) {
                        range.push(i + '');
                    }
                    return range;
                }

                /* function setLang() {
                    self.listLang.splice(0, 0, '-- Lingue --');
                    self.listLvl.splice(0, 0, '-- Livello --');
                } */

                function datiPagina() {
                    return dataImp.getDati(true);
                }

                var toastOk = {
                    heading: 'Success!',
                    icon: 'success',
                    position: {
                        top: 120,
                        right: 60
                    },
                    hideAfter: 5000,
                    loaderBg: 'white'
                };

                var toastErr = function (err) {
                    $.toast({
                        heading: 'Failed!',
                        text: err,
                        icon: 'error',
                        position: {
                            top: 120,
                            right: 60
                        },
                        hideAfter: 5000,
                        loaderBg: 'white'
                    });
                };
            }]
    })

    .factory('impiegatoOp', ['$http', 'token', function ($http, token) {

        return {

            getDatiImpiegato: function getDatiImpiegato(id) {
                var config = getOptions();
                config.params = {
                    id: id
                };
                return $http.get(serviceConfig.getDatiImpiegato, config);
            },

            getProfilePicsPath: function getProfilePicsPath() {
                return $http.get(serviceConfig.getProfilePicsPath, getOptions());
            },

            getProfilePics: function getProfilePics() {
                return $http.get(serviceConfig.getProfilePics, getOptions());
            },

            salvaDati: function salvaDati(data) {
                return $http.post(serviceConfig.salvaDati, data, getOptions());
            },

            getDataFromDB: function getDataFromDB(id) {
                var config = getOptions();
                config.params = {
                    id: id
                };
                return $http.get(serviceConfig.getDataFromDB, config);
            },

            caricaFoto: function caricaFoto(file) {
                var fd = new FormData();
                fd.append('file', file);
                var options = getOptions();
                options.headers['Content-Type'] = undefined;
                return $http.post(serviceConfig.caricaFoto, fd, options);
            },

            getTags: function getTags() {
                return $http.get(serviceConfig.getSuggestions, getOptions());
            }

        };

        function getOptions() {
            return options = {
                headers: {
                    'session-user': token.getUser(),
                    'session-token': token.getToken()
                }
            };
        }

    }])

    /* .directive('compare', [function() {
        return {
            restrict: 'E',
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                var date = $attrs.compareDate.split(',');
                console.log(date[0]);
            }
        }
    }]) */

    .directive('checkWidth', function () {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $scope.$watch(
                    function () { return $element[0].clientWidth },
                    function (newVal, oldVal) {
                        if (newVal > 408) {
                            if ($element.hasClass('iper')) {
                                $element.removeClass('iper');
                                $element.addClass('maxi');
                            }
                            else if ($element.hasClass('maxi')) {
                                $element.removeClass('maxi');
                                $element.addClass('medio');
                            }
                            else if ($element.hasClass('medio')) {
                                $element.removeClass('medio');
                                $element.addClass('mini');
                            }
                        }
                    }
                );
            }
        }
    })
    
    .directive('filesInput', function () {
        return {
            require: 'ngModel',
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on('change', function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                })
            }
        }
    })

    .directive('limitToMax', function() {
        return {
            link: function(scope, element, attributes) {
                var att = document.getElementById('ral-slider').attributes;
                element.on('keydown keyup change', function(e) {
                    if (Number(element.val()) > Number(att.max.value)) {
                        e.preventDefault();
                        element.val(self.pInfo.ral);
                    } else {
                        self.pInfo.ral = Number(element.val());
                    }
                });
            }
        };
    })

    .directive('starRating', function () {
        return {
            template: '<ul class="rating"><li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">\u2605</li></ul>',
            scope: {
                ratingValue: '=',
                max: '=',
                onRatingSelected: '&'
            },
            link: function (scope, elem, attrs) {
                scope.toggle = function (index) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({
                        rating: index + 1
                    });
                };
                scope.$watch('ratingValue', function (oldVal, newVal) {
                    scope.stars = [];
                    for (var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled: i < scope.ratingValue
                        });
                    }
                });
            }
        }
    });