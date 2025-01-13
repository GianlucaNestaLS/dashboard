angular.module('preview')
    .component('preview', {
        templateUrl: 'app/preview/preview.template.html',
        controller: ['dataImp', '$rootScope', '$state', 'token', function (dataImp, $rootScope, $state, token) {

            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();

            if (dataImp.getDati()) {

                self.pInfo = dataImp.getDati().pInfo;
                self.pInfo.username = self.pInfo.username.replace('@', '\u200B@');
                //self.foto = dataImp.getFoto();
                self.foto = dataImp.getPath() + '/' + dataImp.getDati().pInfo.foto;
                if (dataImp.getDati().pInfo.foto == null) {
                    self.foto = dataImp.getPath() + '/' + dataImp.getDati().pInfo.logo;
                }
                self.exp = dataImp.getDati().exp;
                self.form = dataImp.getDati().form;
                self.lang = dataImp.getDati().lang;
                self.logo = dataImp.getPath() + '/' + dataImp.getDati().pInfo.carta_intestata;

                self.print = function() {
                    document.title = 'CV - ' + self.pInfo.nome + ' ' + self.pInfo.cognome;
                    $('.jq-toast-single').hide();
                    print();
                };

                self.back = function() {
                    history.back();
                };

                self.print_cliente = function() {
                    document.title = 'CV - ' + self.pInfo.nome + ' ' + self.pInfo.cognome;
                    $('.jq-toast-single').hide();
                    $('#emailCV').hide();
                    print();
                    $('#emailCV').show();
                };

                self.print_anonima = function() {
                    
                    $('#spazio_fotoCV').removeClass('spazio_fotoCV');
                    $('#fotoCV').hide(); 

                    $('#nomeCV').text(self.pInfo.nome.charAt(0) + '.' + ' ' + self.pInfo.cognome.charAt(0) + '.');
                    $('#cognomeCV').hide();

                    $('#emailCV').hide(); 
                    
                    print();
                
                    $('#spazio_fotoCV').addClass('spazio_fotoCV');
                    $('#fotoCV').show();
                    $('#nomeCV').text(self.pInfo.nome);
                    $('#cognomeCV').text(self.pInfo.cognome);
                    $('#emailCV').show();
                };
            }

            else {
                history.back();
            }

        }]
    })

    .directive('checkWidthCv', function() {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                var nome = angular.element.find('#nomeCV');
                $scope.$watch(
                    function() { return ($element[0].clientWidth || nome[0].clientWidth) },
                    function(newVal, oldVal) {
                        if (newVal > 160 || nome[0].clientWidth > 160) {
                            if ($element.hasClass('iperCV')) {
                                $element.removeClass('iperCV');
                                $element.addClass('maxiCV');
                                angular.element(nome[0]).removeClass('maxiCV');
                                angular.element(nome[0]).addClass('medioCV');
                            } else if ($element.hasClass('maxiCV')) {
                                $element.removeClass('maxiCV');
                                $element.addClass('medioCV');
                                angular.element(nome[0]).removeClass('medioCV');
                                angular.element(nome[0]).addClass('miniCV');
                            } else if ($element.hasClass('medioCV')) {
                                $element.removeClass('medioCV');
                                $element.addClass('miniCV');
                            }
                        }
                    }
                );
            }
        }
    });
