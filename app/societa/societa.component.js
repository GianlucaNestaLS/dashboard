angular.module('societa')
    .component('societa', {
        templateUrl: 'app/societa/societa.template.html',
        controller: ['opsSocieta', '$location', '$rootScope', '$state', '$mdDialog',
            function (opsSocieta, $location, $rootScope, $state, $mdDialog) {

            var self = this;
            $rootScope.title = $state.current.title;

            
            /* ------------------------------------ GET SOCIETA ------------------------------------ */
            opsSocieta.getSocieta().then(function (result) {
                if (result.data.forbidden) {
                    $location.path('/login');
                } else {
                    opsSocieta.getProfilePicsPath().then(function (res) {
                        if (res.data.forbidden) {
                            $location.path('/login');
                        } else {
                            self.path = res.data.path;
                            self.societa = result.data;
                        }
                    });
                }

            });


            /* ------------------------------------ DIALOG SOCIETA ------------------------------------ */
            self.socDialog = function(ev, i) {
                $mdDialog.show({
                    controller: socDialogController,
                    templateUrl: 'app/dialogs/socDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        modifica: (ev.currentTarget.name == 'modificaSocieta'),
                        index: i
                    }
                }).then(function(answer) {
                    if (i >= 0) {
                        answer.id = self.societa[i].id;
                        opsSocieta.modificaSocieta(answer).then(function (result) {
                            if (result.data.forbidden) {
                                $location.path('/login');
                            } else if (result.data.success) {
                                self.societa[i].nome = answer.nome;
                                self.societa[i].dominio = answer.dominio;
                                self.societa[i].logo = answer.logo;
                                self.societa[i].carta = answer.carta;
                                toastOk.text = 'La modifica è avvenuta con successo.';
                                $.toast(toastOk);
                            } else {
                                toastErr(result.data.errorMsg);
                            }
                        });
                    } else {
                        opsSocieta.nuovaSocieta(answer).then(function (result) {
                            if (result.data.forbidden) {
                                $location.path('/login');
                            } else if (result.data.success) {
                                self.societa.unshift({
                                    nome: answer.nome,
                                    dominio: answer.dominio,
                                    logo: answer.logo,
                                    carta: answer.carta,
                                    id: result.data.id
                                });
                                toastOk.text = 'La creazione della nuova società è avvenuta con successo.';
                                $.toast(toastOk);
                            } else {
                                toastErr(result.data.errorMsg);
                            }
                        });
                    }
                }, function() {});
            }

            function socDialogController($scope, $mdDialog, modifica, index) {
                $scope.modifica = modifica;
                $scope.titolo = modifica ? 'Modifica Società' : 'Nuova Società';
                if (index >= 0) {
                    $scope.nome = self.societa[index].nome;
                    $scope.dominio = self.societa[index].dominio;
                    $scope.id = self.societa[index].id;
                    $scope.logo = self.societa[index].logo;
                    $scope.carta = self.societa[index].carta_intestata;
                }
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.answer = function () {
                    var answer = {
                        nome: $scope.nome,
                        dominio: $scope.dominio,
                        logo: $scope.logo == undefined ? null : $scope.logo,
                        carta: $scope.carta == undefined ? null : $scope.carta
                    };
                    $mdDialog.hide(answer);
                };

                $scope.caricaFoto = function (files, tipo) {
                    var file = files[0];
                    opsSocieta.caricaFoto(file).then(function(result) {
                        if (result.data.forbidden) {
                            $location.path('/login');
                        } else if (result.data.success) {
                            if (tipo == 'logo')
                                $scope.logo = file.name;
                            else
                                $scope.carta = file.name;
                        } else {
                            toastErr(result.data.msg);
                        }
                    });
                };

            };


            /* ------------------------------------ DELETE ------------------------------------ */
            self.deleteSocDialog = function(ev, i) {
                $mdDialog.show({
                    controller: deleteSocDialogController,
                    templateUrl: 'app/dialogs/deleteSocDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {index: i}
                })
                .then(function (answer) {
                    if (answer == 'elimina') {
                        opsSocieta.eliminaSocieta(self.societa[i].id).then(function (result) {
                            if (result.data.forbidden) {
                                $location.path('/login');
                            } else if (result.data.success) {
                                self.societa.splice(i, 1);
                                toastOk.text = "L'eliminazione della societa è avvenuta con successo.";
                                $.toast(toastOk);
                            } else {
                                toastErr('Esistono impiegati appartenenti alla società.');
                            }
                        });
                    }
                }, function() {});
            };

            function deleteSocDialogController($scope, $mdDialog, index) {

                $scope.societa = self.societa[index].nome;

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
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


    .factory('opsSocieta', ['$http', 'token', function ($http, token) {

        return {

            getSocieta: function getSocieta() {
                return $http.get(serviceConfig.getSocieta, getOptions());
            },

            getProfilePicsPath: function getProfilePicsPath() {
                return $http.get(serviceConfig.getProfilePicsPath, getOptions());
            },

            eliminaSocieta: function eliminaSocieta(id) {
                var data = 'id=' + id;
                var options = getOptions();
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                return $http.post(serviceConfig.eliminaSocieta, data, options);
            },

            modificaSocieta: function modificaSocieta(data) {
                return $http.post(serviceConfig.modificaSocieta, data, getOptions());
            },

            nuovaSocieta: function nuovaSocieta(data) {
                return $http.post(serviceConfig.nuovaSocieta, data, getOptions());
            },

            caricaFoto: function caricaFoto(file) {
                var fd = new FormData();
                fd.append('file', file);
                var options = getOptions();
                options.headers['Content-Type'] = undefined;
                return $http.post(serviceConfig.caricaFoto, fd, options);
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
    });