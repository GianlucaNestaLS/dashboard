angular.module('login')
    .component('login', {
        templateUrl: 'app/login/login.template.html',
        controller: ['access', '$location', 'token', '$rootScope', '$state', function (access, $location, token, $rootScope, $state) {

            var self = this;
            $rootScope.title = $state.current.title;
            localStorage.removeItem('search');

            self.signin = function () {

                if (self.username && self.password) {

                    if (access.validate(self.username)) {

                        access.login(self.username, self.password).then(function (result) {
                            if (result.data.authenticate) {
                                token.setToken(result.data['session-token']);
                                token.setUser(result.data['id']);
                                token.setUtente(result.data['utente']);
                                token.setProfile(result.data['profilo']);
                                token.setPrivacy(result.data['privacy']);
                                if (result.data['privacy'] == 0) {
                                    $location.path('/primo-accesso');
                                } else if (result.data['profilo'] == 'USER') {
                                    $location.path('/impiegato/' + self.username);
                                } else {
                                    $location.path('/impiegati');
                                }
                                token.setSocieta(result.data['profilo'] == 'ALL_USERS' ? result.data['societa'] : '');
                            }

                            else
                                toastErr('Accesso negato');
                        });

                    }

                    else toastErr('Formato mail non corretto');
                }

                else toastErr('Inserisci tutti i campi');
            }

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

    .factory('access', ['$http', function ($http) {
        var options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        return {
            validate: function (email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            },

            login: function login(username, password) {
                var data = 'username=' + username + '&password=' + password;
                return $http.post(serviceConfig.authenticate, data, options)
            }
        }
    }]);