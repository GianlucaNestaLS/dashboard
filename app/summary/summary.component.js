angular.module('summary', ['ngSanitize'])
    .component('summary', {
        templateUrl: 'app/summary/summary.template.html',
        controller: ['dataImp', '$rootScope', '$state', 'token', '$http', function (dataImp, $rootScope, $state, token, $http) {

            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();
            self.extractedSummary = '';

            if (dataImp.getDati()) {

                self.pInfo = dataImp.getDati().pInfo;

                self.pInfo.username = self.pInfo.username.replace('@', '\u200B@');
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


                self.isLoading = false;
                self.getSummary = function() {
                    self.isLoading = true;
                    var extractedText = JSON.stringify(dataImp.getDati()); 
                    

                    var apiKey = 'AIzaSyDLMgsqS89Rem-KgA2vI94JI0-f4ghg9Ic'; // Linear System
    
                    var url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${apiKey}`;
                    
                    var requestBody = {
                        contents: [{
                            parts: [
                                { text: `
                                   Analizza il seguente contenuto e restituisci un sommario formattato in HTML con le seguenti sezioni: 
                                   - **IMPORTANTE**:Inserisci solo il testo formattato, NON INSERIRE backticks all'inizio o alla fine.
                                    - **IMPORTANTE**: non inserire  <title>Sommario Candidato</title> nel codice HTML. 
                                    - **IMPORTANTE**:Non inserire il nome e il cognome del candidato.  
                                    - **IMPORTANTE**: La prima sezione di introduzione non deve avere un titolo né un tag <h2> Non inserire testo come "sommario", "summary" o "introduzione". 
                                                      Scrivi solo il testo introduttivo del candidato avvolto in un tag <p>  
                                    - **PUNTI DI FORZA**: Presenta una lista con i punti di forza del dipendente, evidenziando i punti principali in grassetto, non usare *. 
                                                          Utilizza il tag <h4> per il titolo della sezione.  
                                    - **AREE DI SVILUPPO**: Presenta una lista con le aree in cui il dipendente può migliorare, evidenziando i punti principali in grassetto non usare *. 
                                                            Utilizza il tag <h4> per il titolo della sezione.  
                                    ` },
                                { text: extractedText }
                            ]
                        }]
                    };

                    
                    $http.post(url, requestBody).then(function(response) {
                        if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content && response.data.candidates[0].content.parts) {
                            self.extractedSummary = response.data.candidates[0].content.parts[0].text;
                            // console.log('Extracted summary:', self.extractedSummary);
                        }
                        self.isLoading = false;
                    }).catch(function(error) {
                        console.error('Errore durante la chiamata all\'API:', error);
                        self.isLoading = false;
                    });
                };

                self.getSummary();
            } else {
                // console.log('Nessun dato disponibile, tornando indietro.');
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
