angular.module('tableImpiegati')
    .component('tableImpiegati', {
        templateUrl: 'app/table-impiegati/table-impiegati.template.html',
        controller: ['opsImpiegati', 'opsString', '$location', 'token', '$rootScope', '$state', '$mdDialog', '$scope',
            function (opsImpiegati, opsString, $location, token, $rootScope, $state, $mdDialog, $scope) {

            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();

            /* ------------------------------------ GET IMPIEGATI ------------------------------------ */
            opsImpiegati.getImpiegati(self.profilo).then(function (result) {
                if (result.data.forbidden) {
                    $location.path('/login');
                } else {
                    self.impiegati = result.data;
                    // pagination controls
                    $scope.currentPage = localStorage.getItem('page') || 1;
                    $scope.totalItems = self.impiegati.length;
                    $scope.entryLimit = 25;
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                    $scope.$watch('currentPage', function (newVal, oldVal) {
                        localStorage.setItem('page', newVal);
                    });
                }
            });

            $scope.search = JSON.parse(localStorage.getItem('search')) || {cv_compilato: ''};
            $scope.filtroImp = function (search) {
                localStorage.setItem('search', JSON.stringify(search));
                return function (item) {
                    var ret = true;
                    if (search.nominativo != '' && search.nominativo != undefined) {
                        ret = (item.cognome + ' ' + item.nome).toLowerCase().includes(search.nominativo.toLowerCase());
                    }
                    if (search.societa != '' && search.societa != undefined) {
                        ret &= item.societa == search.societa;
                    }
                    if (search.dipendente != '' && search.dipendente != undefined) {
                        ret &= item.dipendente == search.dipendente;
                    }
                    if (search.cv_compilato != '') {
                        ret &= item.cv_compilato == search.cv_compilato;
                    }
                    return ret;
                };
            };

            $scope.$watch('search', function () {
                $scope.currentPage = 1;
            }, true);
          
            $scope.$watch('filtered', function () {
                if ($scope.filtered != undefined) {
                    $scope.totalItems = $scope.filtered.length;
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                    //$scope.currentPage = localStorage.getItem('page') || 1;
                }
            }, true);


            /* ------------------------------------ GET SOCIETA ------------------------------------ */
            opsImpiegati.getSocieta().then(function (result) {
                if (result.data.forbidden) {
                    $location.path('/login');
                } else {
                    self.listaSoc = result.data;
                }
            });


            /* ------------------------------------ OPEN IMPIEGATO ------------------------------------ */
            self.open = function (userid) {
                $location.path('/impiegato/' + userid);//encodeURIComponent(id));
            }


            /* ------------------------------------ DIALOG IMPIEGATO ------------------------------------ */
            self.impDialog = function(ev, i) {
                $mdDialog.show({
                    controller: impDialogController,
                    templateUrl: 'app/dialogs/impDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        modifica: (ev.currentTarget.name == 'modificaImpiegato'),
                        index: i
                    }
                })
                .then(function(answer) {
                    if (i >= 0) {
                        var imp = self.impiegati.find(x => x.userid == i);
                        opsImpiegati.modificaImpiegato(answer.nome, answer.cognome, answer.username, answer.id_soc, i, answer.password, answer.profilo).then(function (result) {

                            if (result.data.forbidden) {
                                $location.path('/login');
                            }

                            else if (result.data.success) {
                                // console.log('Inserimento avvenuto con successo:', result.data);
                                imp.nome = answer.nome;
                                imp.cognome = answer.cognome;
                                //imp.id = answer.id;
                                imp.username = answer.username;
                                imp.id_soc = answer.id_soc;
                                imp.societa = answer.societa;
                                imp.dominio = answer.dominio;
                                imp.profilo = answer.profilo;
                                toastOk.text = 'La modifica è avvenuta con successo.';
                                $.toast(toastOk);
                            }

                            else {
                                console.log('Errore durante l\'inserimento:', result.data.errorMsg);
                                toastErr(result.data.errorMsg);
                            }

                        });
                    }

                    else {
                        opsImpiegati.nuovoImpiegato(answer.nome, answer.cognome, answer.username, answer.id_soc, answer.password, answer.profilo).then(function (result) {

                            if (result.data.forbidden) {
                                $location.path('/login');
                            }

                            else if (result.data.success) {
                                self.impiegati.push({
                                    nome: answer.nome,
                                    cognome: answer.cognome,
                                    //id: answer.id,
                                    username: answer.username,
                                    id_soc: answer.id_soc,
                                    societa: answer.societa,
                                    dominio: answer.dominio,
                                    userid: result.data.userid,
                                    dipendente: 1
                                });
                                self.impiegati.sort((a, b) => (a.cognome > b.cognome) ? 1 : ((b.nome > a.nome) ? -1 : 0));
                                toastOk.text = 'La creazione del nuovo impiegato è avvenuta con successo.';
                                $.toast(toastOk);
                            }

                            else {
                                toastErr(result.data.errorMsg);
                            }

                        });
                    }

                }, function() {});
            }

            function impDialogController($scope, $mdDialog, modifica, index) {
                var imp = self.impiegati.find(x => x.userid == index);
                $scope.modifica = modifica;
                $scope.titolo = modifica ? 'Modifica Impiegato' : 'Nuovo Impiegato';
                $scope.listaSoc = self.listaSoc;
                $scope.profilo = self.profilo;
                if (self.profilo == 'ALL_USERS') {
                    const societa = self.listaSoc.find(s => s.id == token.getSocieta())
                    $scope.societa = societa.id;
                    $scope.dominio = societa.dominio;
                }

                if (index >= 0) {
                    $scope.nome = imp.nome;
                    $scope.cognome = imp.cognome;
                    $scope.id = imp.username.split('@')[0];//imp.id;
                    $scope.nomeId = $scope.id.split('.')[0];
                    $scope.cognomeId = $scope.id.split('.')[1];
                    $scope.societa = imp.id_soc;
                    $scope.dominio = imp.dominio;
                    $scope.nomeSoc = imp.societa;
                    $scope.profilo_imp = imp.profilo;
                    $scope.all_users = {value: imp.profilo == 'ALL_USERS'};
                } else {
                    $scope.all_users = {value: false};
                }

                $scope.createId = function(mod) {
                    var isNome = (mod === 'nome');
                    isNome ? ($scope.impForm.nome.$setValidity('check', true)) : ($scope.impForm.cognome.$setValidity('check', true));
                    mod = (isNome ? $scope.nome : $scope.cognome);

                    if (mod && opsString.checkIllegalChar(mod)) {
                        isNome ?
                            ($scope.nomeId = opsString.replaceSpecialChar(opsString.PascalCase($scope.nome).toLowerCase())) :
                            ($scope.cognomeId = opsString.replaceSpecialChar(opsString.PascalCase($scope.cognome).toLowerCase()));

                    }
                    else {
                        isNome ? ($scope.impForm.nome.$setValidity('check', false)) : ($scope.impForm.cognome.$setValidity('check', false));
                    }
                };

                $scope.checkId = function (mod) {
                    var isNomeId = (mod === 'nomeId');
                    isNomeId ? ($scope.impForm.nomeId.$setValidity('check', true)) : ($scope.impForm.cognomeId.$setValidity('check', true));
                    mod = (isNomeId ? $scope.nomeId : $scope.cognomeId);

                    if (!opsString.checkIllegalId(mod)) {
                        isNomeId ? ($scope.impForm.nomeId.$setValidity('check', false)) : ($scope.impForm.cognomeId.$setValidity('check', false));
                    }
                };

                $scope.modificaDominio = function () {
                    const soc = self.listaSoc.find(s => s.id == $scope.societa);
                    $scope.dominio = soc.dominio;
                    $scope.nomeSoc = soc.nome;
                };

                $scope.comparePassword = function() {
                    $scope.impForm.password.$setValidity('comparePassword', true);
                    $scope.impForm.confirmPassword.$setValidity('comparePassword', true);
                    if ($scope.password != $scope.confirmPassword) {
                        $scope.impForm.password.$setValidity('comparePassword', false);
                        $scope.impForm.confirmPassword.$setValidity('comparePassword', false);
                    }
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.answer = function () {
                    var answer = {
                        nome: opsString.PascalCase($scope.nome),
                        cognome: opsString.PascalCase($scope.cognome),
                        username: opsString.replaceSpecialChar(opsString.PascalCase($scope.nomeId).toLowerCase())
                            + '.' + opsString.replaceSpecialChar(opsString.PascalCase($scope.cognomeId).toLowerCase()) + '@' + $scope.dominio,
                        id_soc: $scope.societa,
                        dominio: $scope.dominio,
                        societa: $scope.nomeSoc,
                        password: $scope.password
                    };
                    if ($scope.profilo_imp == 'ADMINISTRATOR') {
                        answer.profilo = $scope.profilo_imp;
                    } else {
                        answer.profilo = $scope.all_users.value ? 'ALL_USERS' : 'USER';
                    }
                    $mdDialog.hide(answer);
                };

            };


            /* ------------------------------------ DELETE ------------------------------------ */
            self.deleteDialog = function(ev, i) {
                $mdDialog.show({
                    controller: deleteDialogController,
                    templateUrl: 'app/dialogs/deleteDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {index: i}
                })
                .then(function (answer) {
                    if (answer == 'elimina') {
                        opsImpiegati.eliminaImpiegato(i).then(function (result) {
                            if (result.data.forbidden) {
                                $location.path('/login');
                            }
                            else if (result.data.success) {
                                const index = self.impiegati.findIndex(x => x.userid == i);
                                self.impiegati.splice(index, 1);
                                toastOk.text = "L'eliminazione dell'impiegato è avvenuta con successo.";
                                $.toast(toastOk);
                            }
                            else {
                                toastErr(result.data.errorMsg);
                            }
                        });
                    }
                }, function() {});
            };

            function deleteDialogController($scope, $mdDialog, index) {
                var imp = self.impiegati.find(x => x.userid == index);
                $scope.impiegato = imp.nome + ' ' + imp.cognome;
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                };
            }


            /* ------------------------------------ EXPORT ------------------------------------ */
            self.export = function () {
                var impExp = '';

                for (var i = 0; i < self.impiegati.length; i++) {
                    if (self.impiegati[i].check) {
                        impExp == '' ? impExp = self.impiegati[i].userid : impExp += ';' + self.impiegati[i].userid;
                    }
                }

                if (impExp.length > 0) {
                    var form = $('<form method="POST" action="' + serviceConfig.esporta + '">');
                    var ids = impExp;
                    form.append($('<input type="hidden" name="ids" value="' + ids + '">'));
                    form.append($('<input type="hidden" name="session-user" value="' + token.getUser() + '">'));
                    form.append($('<input type="hidden" name="session-token" value="' + token.getToken() + '">'));
                    $('body').append(form);
                    form.submit();
                    form.remove();
                }
                else {
                    toastErr('Nessun impiegato selezionato.');
                }
            };


            /* ------------------------------------ IMPORT ------------------------------------ */
            self.import = function (file) {
                
                var reader = new FileReader();

                reader.readAsBinaryString(file[0]);

                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {

                        opsImpiegati.importa(evt.target.result).then(function (result) {

                            if (result.data.forbidden) {
                                $location.path('/login');
                            }

                            else {

                                var x = JSON.parse(evt.target.result);
                                var details = result.data.details;
                                for (var key in x) {
                                    if (details[x[key].pInfo.username].startsWith('written')) {
                                        const soc = self.listaSoc.find(s => s.nome == x[key].pInfo.societa);
                                        var tmp = {
                                            nome: x[key].pInfo.nome,
                                            cognome: x[key].pInfo.cognome,
                                            userid: details[x[key].pInfo.username].substring(8),
                                            username: x[key].pInfo.username,
                                            societa: x[key].pInfo.societa,
                                            id_soc: soc.id,
                                            dominio: soc.dominio,
                                            dipendente: x[key].pInfo.dipendente,
                                            email_pers: x[key].pInfo.email_pers,
                                            telefono: x[key].pInfo.telefono
                                        };
                                        self.impiegati.push(tmp);
                                    }
                                }

                                var sum = result.data.written + result.data.skipped + result.data.failed;

                                $.toast({
                                    heading: 'Information',
                                    icon: 'info',
                                    text: '<p><strong>Impiegati aggiunti: </strong>' + result.data.written + '/' + sum + '</p><p><strong> Impiegati presenti: </strong> ' + result.data.skipped + '/' + sum + '</p><p><strong>Impiegati non inseriti: <strong>' + result.data.failed + '/' + sum + '</p>',
                                    position: {
                                        top: 120,
                                        right: 60
                                    },
                                    hideAfter: 5000,
                                    loaderBg: 'white'
                                });

                            }
                        });

                    }
                };

            };


            /* ----------------------------------- UPLOAD CV ---------------------------------- */    
            self.isLoading = false;
          
            self.uploadCv = function (file) {
                if (!file || file.length === 0) {
                    toastErr('Seleziona un file valido.');
                    return;
                }
            
                self.isLoading = true;
            
                var reader = new FileReader();
                reader.readAsArrayBuffer(file[0]);
            
                reader.onloadend = function (event) {
                    var arrayBuffer = event.target.result;
            
                    pdfjsLib.getDocument({ data: arrayBuffer }).promise.then(function (pdf) {
                        var maxPages = pdf.numPages;
                        var countPromises = [];
            
                        for (var i = 1; i <= maxPages; i++) {
                            countPromises.push(pdf.getPage(i).then(function (page) {
                                return page.getTextContent().then(function (textContent) {
                                    return textContent.items.map(function (item) {
                                        return item.str;
                                    }).join(' ');
                                });
                            }));
                        }
            
                        Promise.all(countPromises).then(function (pagesText) {
                            var fullText = pagesText.join(' ');
            
                            opsImpiegati.processCvWithGoogle(fullText).then(function (response) {
                                if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content && response.data.candidates[0].content.parts) {
                                    var extractedText = response.data.candidates[0].content.parts[0].text;
                                    console.log('Extracted text:', extractedText);
            
                                    try {
                                        if (isValidJson(extractedText)) {
                                            var parsedData = JSON.parse(extractedText);
                                            console.log('Parsed data:', parsedData);
            
                                            opsImpiegati.importa(extractedText).then(function (result) {
                                                if (result.data.forbidden) {
                                                    $location.path('/login');
                                                } else {
                                                    var details = result.data.details;
                                                    // console.log('Details:', details);
                                                    for (var key in parsedData) {
                                                        // Controllo per prevenire errori .startsWith
                                                        if (details[parsedData[key].pInfo.username] && details[parsedData[key].pInfo.username].startsWith('written')) {
                                                            const soc = self.listaSoc.find(s => s.nome == parsedData[key].pInfo.societa);
                                                            var tmp = {
                                                                nome: parsedData[key].pInfo.nome,
                                                                cognome: parsedData[key].pInfo.cognome,
                                                                userid: details[parsedData[key].pInfo.username].substring(8),
                                                                username: parsedData[key].pInfo.username,
                                                                societa: parsedData[key].pInfo.societa,
                                                                id_soc: soc ? soc.id : null,
                                                                dominio: soc ? soc.dominio : null,
                                                                dipendente: parsedData[key].pInfo.dipendente,
                                                                email_pers: parsedData[key].pInfo.email_pers,
                                                                telefono: parsedData[key].pInfo.telefono
                                                            };
                                                            self.impiegati.push(tmp);
                                                        }
                                                    }
            
                                                    var sum = result.data.written + result.data.skipped + result.data.failed;
                                                        
                                                    if ($.toast) {
                                                        $.toast({
                                                            heading: 'Inserimento avvenuto con successo!',
                                                            text: `<p><strong>Impiegati aggiunti:</strong> ${result.data.written}/${sum}</p>`,
                                                            icon: 'success',                                                       
                                                            position: {
                                                                top: 120,
                                                                right: 60
                                                            },
                                                            hideAfter: 5000,
                                                            loaderBg: 'green'
                                                        });
                                                        setTimeout (function () {
                                                            window.location.reload();
                                                        }, 5000);
                                                    } else {
                                                        // console.log('Informazioni:', result.data);
                                                    }
                                                }
                                                self.isLoading = false; // Fine caricamento
                                       
                                            }).catch(function (error) {
                                                toastErr('Errore durante l\'importazione: ' + error.message);
                                                self.isLoading = false; // Fine caricamento
                                            });
                                        } else {
                                            throw new Error('Il testo estratto non è un JSON valido.');
                                        }
                                    } catch (error) {
                                        console.log('Errore durante la conversione del testo in JSON:', error.message);
                                        toastErr('Errore durante la conversione del testo in JSON: ' + error.message);
                                        self.isLoading = false; // Fine caricamento
                                    }
                                } else {
                                    toastErr('Errore durante l\'elaborazione del contenuto.');
                                    self.isLoading = false; // Fine caricamento
                                }
                            }).catch(function (error) {
                                toastErr('Errore nell\'invocazione dell\'API: ' + error.message);
                                self.isLoading = false; // Fine caricamento
                            });
                        }).catch(function (error) {
                            toastErr('Errore durante l\'estrazione del testo dal PDF: ' + error.message);
                            self.isLoading = false; // Fine caricamento
                        });
                    }).catch(function (error) {
                        toastErr('Errore durante l\'elaborazione del PDF: ' + error.message);
                        self.isLoading = false; // Fine caricamento
                    });
                };
            
                reader.onerror = function (error) {
                    toastErr('Errore nella lettura del file: ' + error.message);
                    self.isLoading = false; // Fine caricamento
                };
            };

            function isValidJson(str) {
                try {
                    JSON.parse(str);
                    return true;
                } catch (e) {
                    return false;
                }
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


    .factory('opsImpiegati', ['$http', 'token', function ($http, token) {

        return {

            getImpiegati: function getImpiegati(profilo) {
                var options = getOptions();
                if (profilo == 'ALL_USERS') {
                    options.params = {
                        societa: token.getSocieta()
                    };
                }
                return $http.get(serviceConfig.getImpiegati, options);
            },

            eliminaImpiegato: function eliminaImpiegato(id) {
                var data = 'id=' + id;
                var options = getOptions();
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                return $http.post(serviceConfig.eliminaImpiegato, data, options);
            },

            modificaImpiegato: function modificaImpiegato(nome, cognome, username, societa, userid, password, profilo) {
                var data = 'nome=' + nome + '&cognome=' + cognome + '&username=' + username + '&societa=' + societa + '&userid=' + userid + '&password=' + (password == undefined ? '' : password) + '&profilo=' + profilo;
                var options = getOptions();
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                return $http.post(serviceConfig.modificaImpiegato, data, options);
            },

            nuovoImpiegato: function nuovoImpiegato(nome, cognome, username, societa, password, profilo) {
                var data = 'nome=' + nome + '&cognome=' + cognome + '&username=' + username + '&societa=' + societa + '&password=' + password + '&profilo=' + profilo;
                var options = getOptions();
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                return $http.post(serviceConfig.nuovoImpiegato, data, options);
            },

            importa: function importa(file) {
                return $http.post(serviceConfig.importa, file, getOptions());
            },
                                
            processCvWithGoogle: function (extractedText) {

                var apiKey = 'AIzaSyDLMgsqS89Rem-KgA2vI94JI0-f4ghg9Ic'; // Linear System

                var url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${apiKey}`;

                var prompt = `
                    Analizza il contenuto del testo estratto e restituisci un oggetto strutturato seguendo questa guida:

                    ### Linee Guida
                    1. **Campi Obbligatori**: Tutti i campi devono essere compilati. Se mancano informazioni, usa valori di default come:
                    - Stringa vuota: ""
                    - Per le immagini: "default.jpg"
                    - Per id un numero qualsiasi
                    - Per username usa sempre "nome.cognome@linearsystem.it"
                    - Per Società usa sempre"Linear System"
                    - Per dominio usa sempre "linearsystem.it"
                    - Per "selezionato", "dipendente" e "id_soc" usa sempre 1,
                    - Per campi numerici non forniti campi "ral" e "valutazione" usa null
                    - Per campo "carta_intestata" usa sempre "logo.jpg"
                    - Per campo "giudizio" usa sempre ""
                    - Per campo "descrizione" assicurati di inserire sempre il testo corrispondente all'esperienza relativa, se sono presenti dei - crea degli elenchi. 
                    2. **Foto** e **Logo**: Sempre "default.jpg".
                    3. **Mansione**: Accetta solo il primo valore es. "Junior Frontend Developer", ignora tutto ciò che segue.
                    4. **Lettere Accentuate**: Usa caratteri non accentati, eccetto per il verbo "è".
                    5. **Nome e Cognome**: Scrivi in Pascal Case (prima lettera maiuscola di ogni parola, es. "Nome Cognome").
                    6. **Email**: Sempre in minuscolo. Lo username segue il formato nome.cognome@linearsystem.it, con dominio fisso linearsystem.it.
                    7. **Competenze Professionali**: Elenca massimo 10 competenze, ciascuna rappresentata da una parola chiave (es. "Python", "Java").
                    8. **Telefono**: Escludi il prefisso internazionale, mantieni solo il numero (es. "3331234567").
                    9. **Date**:
                    - Se mancano date, inserisci valori coerenti (precedenti o successivi, in base al contesto), inserisci solo l'anno e non il mese.
                    - Per "hardware" e "software", usa sempre data_compilazione: "2025-01-01".
                    10. **Lingue**:
                    **IMPORTANTISSIMO**:
                    - NON INSERIRE come lingua "Italiano", "Albanese", "Persiano"
                    - Lingue disponibili:
                    Arabo, Bulgaro, Ceco, Cinese, Danese, Finlandese, Francese, Giapponese, Greco, Inglese, Norvegese, Olandese, Polacco, Portoghese, Rumeno, Russo, Slovacco, Spagnolo, Svedese, Tedesco, Turco.
                    - Se NON VIENE SPECIFICATA UNA LINGUA, INSERISCI Inglese A1 per ascoltato, parlato e scritto.
                    - Trasforma livelli (es. "madrelingua" in "C2").
                    - Se non viene specificato il livello, usa B1 per ascoltato, parlato e scritto.
                    11. **Tag**: Inserisci sempre un massimo 10 tag, ciascuno rappresentato da una parola chiave (es. "Python", "Java"). CONTROLLA ATTENTAMENTE anche sotto sezioni "skills"
                    12. **Output**: Restituisci solo l'oggetto strutturato, senza commenti o codice JSON delimitato da backticks 
                    ### Struttura dell'Oggetto
                    Restituisci i dati nella seguente struttura:

                    [
                        {
                            "pInfo": {
                                "id": 300,
                                "username": "dante.alighieri@linearsystem.it",
                                "nome": "Dante",
                                "cognome": "Alighieri",
                                "mansione": "Junior Frontend Developer",
                                "competenzePro": "Python\nJava\nC++\nJavaScript\nReact\nNode.js\nDocker\nKubernetes\nAWS\nAzure",
                                "foto": "default.jpg",
                                "selezionato": 1,
                                "dipendente": 1,
                                "societa": "Linear System",
                                "id_soc": 1,
                                "dominio": "linearsystem.it",
                                "logo": "default.jpg",
                                "carta_intestata": "logo.jpg",
                                "ral": null,
                                "valutazione": null,
                                "giudizio": "",
                                "telefono": "3331234567",
                                "email_pers": "dante.alighieri@personalmail.com"
                            },
                            "exp": [
                                {
                                    "mansione": "Junior Developer",
                                    "azienda": "StartUp Innovativa",
                                    "annoFine": "2022",
                                    "annoIn": "2020",
                                    "descrizione": "Sviluppo di applicazioni web e mobile.",
                                    "selezionato": 1
                                },
                                {
                                    "mansione": "Software Engineer",
                                    "azienda": "Tech Solutions Inc.",
                                    "annoFine": "2024",
                                    "annoIn": "2022",
                                    "descrizione": "Progettazione e implementazione di soluzioni software enterprise.",
                                    "selezionato": 1
                                }
                            ],
                            "form": [
                                {
                                    "certificazione": "Laurea in Ingegneria Informatica",
                                    "annoFine": "2020",
                                    "annoIn": "2015",
                                    "ente": "Politecnico di Milano",
                                    "selezionato": 1
                                }
                            ],
                            "lang": [
                                {
                                    "lingua": "Inglese",
                                    "ascoltato": "C1",
                                    "parlato": "C1",
                                    "scritto": "C1",
                                    "selezionato": 1
                                }
                            ],
                            "hardware": {
                                "data_compilazione": "2025-01-01",
                                "marca_modello_notebook": "",
                                "serial_number": "",
                                "nome_dispositivo": "",
                                "mac_address": "",
                                "product_key": "",
                                "processore": "",
                                "memoria_ram": "",
                                "tipo_storage": "",
                                "capacita_storage": "",
                                "monitor_esterno": 0,
                                "tastiera_mouse_esterni": 0,
                                "stampante": 0
                            },
                            "software": {
                                "sistema_operativo": "",
                                "office_suite": "",
                                "browser": "",
                                "antivirus": "",
                                "software_comunicazione": "",
                                "software_crittografia": "",
                                "data_compilazione": "2025-01-01"
                            },
                            "tags": [
                                { "tag": "Python" },
                                { "tag": "Java" },
                                { "tag": "C++" }
                            ]
                        }
                    ]
                `;
               
                
                var requestBody = {
                    contents: [{
                        parts: [
                            { text: prompt },
                            { text: extractedText } 
                        ]
                    }]
                };

                var options = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            
                return $http.post(url, requestBody, options);
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


    .factory('opsString', function () {

        return {
            checkIllegalChar: function (str) {
                var pattern = /[^\sA-Za-z\u0027\u002D\u00C0-\u00CF\u00D1-\u00D6\u00D8-\u00DC\u00E0-\u00EF\u00F1-\u00F6\u00F8-\u00FC]+/;
                return (str != "" && !pattern.test(str));
            },

            checkIllegalId: function (str) {
                var pattern = /^([a-z]+([_]?[a-z]+)?)$/;
                return (str != "" && pattern.test(str));
            },

            PascalCase: function (str) {
                str = str.toLowerCase().replace(/\s+/g, " ")
                    .replace(/\u0027+/g, " ' ")
                    .replace(/\u002D+/g, " - ")
                    .replace(/\u005f+/g, "_");
                var s = str.split(/[^\A-Za-z\u0027\u002D\u00C0-\u00CF\u00D1-\u00D6\u00D8-\u00DC\u00E0-\u00EF\u00F1-\u00F6\u00F8-\u00FC]+/);
                for (var i = 0; i < s.length; i++) {
                    s[i] = s[i].charAt(0).toUpperCase() + s[i].slice(1);
                }
                return s.join(" ").replace(/\s*\'\s*/g, "'").replace(/\s*\-\s*/g, "-");
            },

            replaceSpecialChar: function (str) {
                return str.replace(/[\s*\'\s*]*[\s*\-\s*]*/g, "")
                    .replace(/[\u00E0-\u00E5]/g, "a")
                    .replace(/[\u00E7]/g, "c")
                    .replace(/[\u00E8-\u00EB]/g, "e")
                    .replace(/[\u00EC-\u00EF]/g, "i")
                    .replace(/[\u00F1]/g, "n")
                    .replace(/[\u00F2-\u00F6\u00F8]/g, "o")
                    .replace(/[\u00D9-\u00FC]/g, "u");
            },

            checkIllegalChar: function (str) {
                var pattern = /[^\sA-Za-z\u0027\u002D\u00C0-\u00CF\u00D1-\u00D6\u00D8-\u00DC\u00E0-\u00EF\u00F1-\u00F6\u00F8-\u00FC]+/;
                return (str != "" && pattern.test(str)) ? false : true;
            },

            checkIllegalId: function (str) {
                var pattern = /^([a-z]+([_]?[a-z]+)?)$/;
                return (str != "" && !pattern.test(str)) ? false : true;
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
    
    .filter('startFrom', function () {
        return function (input, start) {
            if (input) {
                start = +start;
                return input.slice(start);
            }
            return [];
        };
    });