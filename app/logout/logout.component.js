angular.module('logout')
    .component('logout', {
        templateUrl: 'app/logout/logout.template.html',
        controller: ['$location', 'token', 'opsLogout', 'dataImp', '$mdDialog', '$state', '$stateParams', 'md5', 'impiegatoOp',
            function ($location, token, opsLogout, dataImp, $mdDialog, $state, $stateParams, md5, impiegatoOp) {

                var self = this;

                if (token.getUser()) {
                    self.user = '<span id="userIcon" class="glyphicon glyphicon-user"></span> ' + token.getUtente();
                } else {
                    $location.path('/login');
                }

                function doLogout() {
                    opsLogout.logout(token.getUser(), token.getToken()).then(function(result) {
                        if (result.data.logout) {
                            token.setUser('');
                            token.setToken('');
                            dataImp.setDati();
                            //dataImp.setFoto();
                            localStorage.clear();
                            $location.path('/login');
                        }
                    });
                }



                // self.logout = function () {
                //     const datiHardware = getDatiHardware();
                
                //     if (typeof datiPagina === 'function') {
                //         let updatedDatiPagina = datiPagina();
                //         // console.log('updatedDatiPagina:', updatedDatiPagina);
                //         updatedDatiPagina.hardware = { ...datiHardware };

                //         // Converti a numeri i valori booleani per monitor_esterno, tastiera_mouse_esterni e stampante
                //         updatedDatiPagina.hardware.monitor_esterno = boolToInt(datiHardware.monitor_esterno);
                //         updatedDatiPagina.hardware.tastiera_mouse_esterni = boolToInt(datiHardware.tastiera_mouse_esterni);
                //         updatedDatiPagina.hardware.stampante = boolToInt(datiHardware.stampante);
                
                //         // Aggiorna l'oggetto datiPagina()
                //         datiPagina = function() {
                //             // console.log('updatedDatiPagina inside:', updatedDatiPagina);
                //             // Controlla se tutti i campi sono undefined
                //             const allFieldsUndefined = 
                //                 updatedDatiPagina.hardware.capacita_storage === undefined &&
                //                 updatedDatiPagina.hardware.data_compilazione === undefined &&
                //                 updatedDatiPagina.hardware.mac_address === undefined &&
                //                 updatedDatiPagina.hardware.marca_modello_notebook === undefined &&
                //                 updatedDatiPagina.hardware.memoria_ram === undefined &&
                //                 updatedDatiPagina.hardware.nome_dispositivo === undefined &&
                //                 updatedDatiPagina.hardware.processore === undefined &&
                //                 updatedDatiPagina.hardware.product_key === undefined &&
                //                 updatedDatiPagina.hardware.serial_number === undefined &&
                //                 updatedDatiPagina.hardware.tipo_storage === undefined;
                        
                //             // Controlla se i campi monitor_esterno, stampante e tastiera_mouse_esterni sono 0
                //             const allFieldsZero = 
                //                 updatedDatiPagina.hardware.monitor_esterno === 0 &&
                //                 updatedDatiPagina.hardware.stampante === 0 &&
                //                 updatedDatiPagina.hardware.tastiera_mouse_esterni === 0;
                        
                //             // Se tutti i campi sono undefined, restituisci un array vuoto
                //             if (allFieldsUndefined && allFieldsZero) {
                //                 return updatedDatiPagina.hardware = {};
                //             }
                                               
                //             // Altrimenti, restituisci l'oggetto aggiornato
                //             return updatedDatiPagina;
                //         }
                //         // console.log('datiPagina aggiornati:', datiPagina());
                //     }
                
                //     // Funzione per formattare la data come YYYY-MM-DD
                //     function formatDateToYYYYMMDD(date) {
                //         if (!(date instanceof Date)) return date;
                //         const year = date.getFullYear();
                //         const month = String(date.getMonth() + 1).padStart(2, '0');
                //         const day = String(date.getDate()).padStart(2, '0');
                //         return `${year}-${month}-${day}`;
                //     }
                
                //     // Funzione per normalizzare le date
                //     function normalizeDates(obj) {
                //         if (typeof obj !== 'object' || obj === null) return obj;
                
                //         for (const key in obj) {
                //             if (obj.hasOwnProperty(key)) {
                //                 if (obj[key] instanceof Date) {
                //                     obj[key] = formatDateToYYYYMMDD(obj[key]);
                //                 } else if (typeof obj[key] === 'object') {
                //                     obj[key] = normalizeDates(obj[key]);
                //                 }
                //             }
                //         }
                //         return obj;
                //     }
                
                //     // Funzione per ordinare le chiavi di un oggetto
                //     function sortObjectKeys(obj) {
                //         if (typeof obj !== 'object' || obj === null) return obj;
                
                //         const sortedObj = {};
                //         Object.keys(obj).sort().forEach(function (key) {
                //             sortedObj[key] = obj[key];
                //         });
                
                //         for (const key in sortedObj) {
                //             if (sortedObj.hasOwnProperty(key)) {
                //                 sortedObj[key] = sortObjectKeys(sortedObj[key]); // Ordina anche gli oggetti contenuti
                //             }
                //         }
                
                //         return sortedObj;
                //     }
                
                //     // Funzione per trovare le differenze tra due oggetti
                //     function findDifferences(obj1, obj2) {
                //         const diff = {};
                //         for (const key in obj1) {
                //             if (obj1.hasOwnProperty(key)) {
                //                 if (obj2.hasOwnProperty(key)) {
                //                     if (!_.isEqual(obj1[key], obj2[key])) {
                //                         diff[key] = { obj1: obj1[key], obj2: obj2[key] };
                //                     }
                //                 } else {
                //                     diff[key] = { obj1: obj1[key], obj2: 'Key missing in second object' };
                //                 }
                //             }
                //         }
                
                //         // Controllo per le chiavi che sono in obj2 ma non in obj1
                //         for (const key in obj2) {
                //             if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
                //                 diff[key] = { obj1: 'Key missing in first object', obj2: obj2[key] };
                //             }
                //         }
                //         return diff;
                //     }
                
                //     // Verifica manuale di hardware per forzare il confronto
                //     function checkHardwareChanges() {
                //         const currentHardware = datiPagina().hardware;  // Assicurati che datiPagina().hardware venga aggiornato correttamente
                //         // console.log("Controllo hardware:", currentHardware);
                
                //         // Confronta i dati dell'hardware attuale con quelli precedenti
                //         if (JSON.stringify(currentHardware) !== JSON.stringify(self.hardware)) {
                //             // console.log('Hardware modificato:', currentHardware);
                //             return true;
                //         }
                //         return false;
                //     }

                //     if ($state.current.url.includes('impiegato')) {
                //         impiegatoOp.getDataFromDB($stateParams.id).then(function (result) {
                //             // Ottieni i dati della pagina e normalizzali
                //             const datiPagina = dataImp.getDati(true);
                //             const datiPaginaNormalized = normalizeDates(datiPagina);
                //             const sortedDatiPagina = sortObjectKeys(datiPaginaNormalized);
                
                //             // Normalizza e ordina i dati dal database
                //             const dbDataNormalized = normalizeDates(result.data);
                //             const sortedDBData = sortObjectKeys(dbDataNormalized);
                
                //             // Calcola gli hash per confronto
                //             const md5DB = md5.createHash(JSON.stringify(sortedDBData) || '');
                //             const md5Pagina = md5.createHash(JSON.stringify(sortedDatiPagina) || '');
                
                //             // Controlla differenze specifiche nell'hardware
                //             const hardwareChanged = checkHardwareChanges();
                
                //             // Se gli hash non corrispondono o ci sono cambiamenti nell'hardware
                //             if (md5DB !== md5Pagina || hardwareChanged) {
                //                 // Trova e logga le differenze tra i due oggetti
                //                 const differences = findDifferences(sortedDBData, sortedDatiPagina);
                //                 console.log('Differenze rilevate:', differences);
                
                //                 // Apri la finestra di dialogo per confermare
                //                 saveDialog(datiPagina);
                //             } else {
                //                 // Procedi con il logout
                //                 doLogout();
                //             }
                //         });
                //     } else {
                //         // Se non siamo nella pagina dell'impiegato, esegui il logout diretto
                //         doLogout();
                //     }
                // };
                

                self.logout = function () {
                    if ($state.current.url.includes('impiegato')) {
                        impiegatoOp.getDataFromDB($stateParams.id).then(function (result) {
                            var dati = dataImp.getDati(true);

                            var date = new Date(dati.hardware.data_compilazione);
                        
                            var year = date.getFullYear();
                            var month = (date.getMonth() + 1).toString().padStart(2, '0');
                            var day = date.getDate().toString().padStart(2, '0');
                        
                            dati.hardware.data_compilazione = `${year}-${month}-${day}`;

                            // Funzione per formattare la data come YYYY-MM-DD
                            function formatDateToYYYYMMDD(date) {
                                if (!(date instanceof Date)) return date;
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                return `${year}-${month}-${day}`;
                            }

                                            
                            // Funzione per normalizzare le date
                            function normalizeDates(obj) {
                                if (typeof obj !== 'object' || obj === null) return obj;
                        
                                for (const key in obj) {
                                    if (obj.hasOwnProperty(key)) {
                                        if (obj[key] instanceof Date) {
                                            obj[key] = formatDateToYYYYMMDD(obj[key]);
                                        } else if (typeof obj[key] === 'object') {
                                            obj[key] = normalizeDates(obj[key]);
                                        }
                                    }
                                }
                                return obj;
                            }
                        
                            // Funzione per ordinare le chiavi di un oggetto
                            function sortObjectKeys(obj) {
                                if (typeof obj !== 'object' || obj === null) return obj;
                        
                                const sortedObj = {};
                                Object.keys(obj).sort().forEach(function (key) {
                                    sortedObj[key] = obj[key];
                                });
                        
                                for (const key in sortedObj) {
                                    if (sortedObj.hasOwnProperty(key)) {
                                        sortedObj[key] = sortObjectKeys(sortedObj[key]); // Ordina anche gli oggetti contenuti
                                    }
                                }
                        
                                return sortedObj;
                            }

                            // Funzione per trovare le differenze tra due oggetti
                            function findDifferences(obj1, obj2) {
                                const diff = {};
                                for (const key in obj1) {
                                    if (obj1.hasOwnProperty(key)) {
                                        if (obj2.hasOwnProperty(key)) {
                                            if (!_.isEqual(obj1[key], obj2[key])) {
                                                diff[key] = { obj1: obj1[key], obj2: obj2[key] };
                                            }
                                        } else {
                                            diff[key] = { obj1: obj1[key], obj2: 'Key missing in second object' };
                                        }
                                    }
                                }
                        
                                // Controllo per le chiavi che sono in obj2 ma non in obj1
                                for (const key in obj2) {
                                    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
                                        diff[key] = { obj1: 'Key missing in first object', obj2: obj2[key] };
                                    }
                                }
                                return diff;
                            }

                            const differences = findDifferences(dati, result.data);
                            // console.log('Differenze tra gli oggetti:', differences);   
                            
                             // Normalizzazione e ordinamento dei dati
                             const datiPaginaNormalized = normalizeDates(dati);
                            //  console.log('datiPagina normalizzato:', datiPaginaNormalized);
                 
                             const dbDataNormalized = normalizeDates(result.data);
                            //  console.log('result.data normalizzato:', dbDataNormalized);
                 
                             // Ordinamento delle chiavi prima di fare JSON.stringify
                             const sortedDBData = sortObjectKeys(dbDataNormalized);
                             const sortedDatiPagina = sortObjectKeys(datiPaginaNormalized);
                 
                           
                 
                             // Calcolo degli hash
                             const md5DB = md5.createHash(JSON.stringify(sortedDBData) || '');
                            //  console.log('md5DB', md5DB);
                 
                             const md5Pagina = md5.createHash(JSON.stringify(sortedDatiPagina) || '');
                            //  console.log('md5Pagina', md5Pagina);

                            // console.log('dati',dati);
                            // console.log('result.data',result.data);
                            if (md5DB !== md5Pagina) {
                                saveDialog(dati);
                            } else {
                                doLogout();
                            }
                        });
                    } else {
                        doLogout();
                    };
                };

                /* ------------------------------------ SAVE DIALOG ------------------------------------ */
                function saveDialog(dati) {
                    $mdDialog.show({
                        controller: saveDialogController,
                        templateUrl: 'app/dialogs/saveDialog.template.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true
                    })
                    .then(function (answer) {
                        if (answer != 'annulla') {
                            if (answer == 'salva') {
                                const email_pers = (dati.pInfo.email_pers == '' || dati.pInfo.email_pers == null || /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}/.test(dati.pInfo.email_pers));
                                const lingue = checkLingue(dati);
                                if (email_pers && lingue) {
                                    impiegatoOp.salvaDati(dati).then(function (result) {
                                        if (result.data.forbidden) {
                                            toastErr('Sessione scaduta, modifiche non salvate!');
                                            $location.path('/login');
                                        } else if (result.data.success) {
                                            toastOk.text = 'Salvataggio dati avvenuto con successo.';
                                            $.toast(toastOk);
                                            doLogout();
                                        } else {
                                            toastErr(result.data.errorMsg);
                                        }
                                    });
                                } else {
                                    if (!email_pers) toastErr('Formato e-mail non valido!');
                                    if (!lingue) toastErr('Campi lingua non valorizzati!');
                                }
                            } else {
                                doLogout();
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

                function checkLingue(dati) {
                    var ret = true;
                    dati.lang.forEach(function (element) {
                        if ((element.lingua == '' || element.ascoltato == '' || element.parlato == '' || element.scritto == '') && !(element.lingua == '' && element.ascoltato == '' && element.parlato == '' && element.scritto == '')) {
                            ret = false;
                        }
                    }, this);
                    return ret;
                }

                self.pwdDialog = function(ev) {
                    $mdDialog.show({
                        controller: pwdDialogController,
                        templateUrl: 'app/dialogs/pwdDialog.template.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    })
                    .then(function (password) {
                        opsLogout.modificaPassword(password).then(function (result) {
                            if (result.data.forbidden) {
                                $location.path('/login');
                            } else if (result.data.success) {
                                toastOk.text = 'La modifica della password è avvenuta con successo.';
                                $.toast(toastOk);
                            } else {
                                toastErr('Qualcosa è andato storto!');
                            }
                        });
                    }, function() {});
                };

                function pwdDialogController($scope, $mdDialog) {
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function () {
                        $mdDialog.hide($scope.password);
                    };
                    $scope.comparePassword = function() {
                        $scope.pwdForm.password.$setValidity('comparePassword', true);
                        $scope.pwdForm.confirmPassword.$setValidity('comparePassword', true);
                        if ($scope.password != $scope.confirmPassword) {
                            $scope.pwdForm.password.$setValidity('comparePassword', false);
                            $scope.pwdForm.confirmPassword.$setValidity('comparePassword', false);
                        }
                    };
                }

                /* ------------------------------------ TOAST ------------------------------------ */
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

    .factory('opsLogout', ['$http', 'token', function($http, token) {

        return {
            logout: function logout(user, token) {
                var data = 'userid=' + user + '&token=' + token;
                return $http.post(serviceConfig.logout, data, getOptions());
            },
            
            modificaPassword: function modificaPassword(password) {
                var data = 'pwd=' + password;
                return $http.post(serviceConfig.salvaPassword, data, getOptions());
            }
        }

        function getOptions() {
            return options = {
                headers: {
                    'session-user': token.getUser(),
                    'session-token': token.getToken(),
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            };
        }

    }]);