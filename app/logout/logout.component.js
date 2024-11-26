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

                self.logout = function () {
                    if ($state.current.url.includes('impiegato')) {
                        impiegatoOp.getDataFromDB($stateParams.id).then(function (result) {
                            var dati = dataImp.getDati(true);
                            var md5DB = md5.createHash(JSON.stringify(result.data) || '');
                            var md5Pagina = md5.createHash(JSON.stringify(dati) || '');
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