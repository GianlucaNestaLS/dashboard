angular.module('primoAccesso')
    .component('primoAccesso', {
        templateUrl: 'app/primo-accesso/primo-accesso.template.html',
        controller: ['opsPrivacy', '$location', '$rootScope', '$state', '$scope', 'token',
            function (opsPrivacy, $location, $rootScope, $state, $scope, token) {

            var self = this;
            $rootScope.title = $state.current.title;

            self.comparePassword = function() {
                $scope.formPrivacy.password.$setValidity('comparePassword', true);
                $scope.formPrivacy.confirmPassword.$setValidity('comparePassword', true);
                if (self.password != self.confirmPassword) {
                    $scope.formPrivacy.password.$setValidity('comparePassword', false);
                    $scope.formPrivacy.confirmPassword.$setValidity('comparePassword', false);
                }
            };

            self.salva = function () {
                opsPrivacy.salvaPassword(self.password).then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else if (!result.data.success) {
                        toastErr('Qualcosa è andato storto!');
                    } else {
                        token.setPrivacy(1);
                        if (token.getProfile() == 'USER') {
                            $location.path('/impiegato/' + token.getUser());
                        } else {
                            $location.path('/impiegati');
                        }
                    }
                });
            };

            self.logout = function () {
                opsPrivacy.logout(token.getUser(), token.getToken()).then(function(result) {
                    if (result.data.logout) {
                        token.setUser('');
                        token.setToken('');
                        localStorage.clear();
                        $location.path('/login');
                    }
                });
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

    .factory('opsPrivacy', ['$http', 'token', function ($http, token) {

        return {
            salvaPassword: function salvaPassword(password) {
                return $http.post(serviceConfig.salvaPassword, 'pwd=' + password, getOptions());
            },

            logout: function logout(user, token) {
                var data = 'userid=' + user + '&token=' + token;
                return $http.post(serviceConfig.logout, data, getOptions());
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