angular.module('ricercaTag')

    .component('ricercaTag', {
        templateUrl: 'app/ricerca-tag/ricerca-tag.template.html',
        controller: ['opsTags', '$location', '$rootScope','$state', 'token', '$scope', '$timeout', function(opsTags, $location, $rootScope, $state, token, $scope, $timeout) {

            var self = this;
            $rootScope.title = $state.current.title;
            self.profilo = token.getProfile();
            $scope.search = {};

            opsTags.getTags().then(function(result) {
                result.data.forbidden ? $location.path('/login') : self.tags = result.data;
            });

            if (self.profilo == 'ADMINISTRATOR') {
                opsTags.getSocieta().then(function (result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.listaSoc = result.data;
                    }
                });
            }

            $timeout(function() {
                var input = $('md-autocomplete[md-input-maxlength]');
                $('input', input).attr('maxlength', input.attr('md-input-maxlength'));
            }, 500);

            self.querySearch = querySearch;
            self.chipTags = [];
            self.newTag = newTag;
            self.searchTag = searchTag;
            self.open = function (id) {
                $location.path('/impiegato/'+ encodeURIComponent(id));
            }

            function querySearch(query) {
                var results = query ? self.tags.filter(createFilterFor(query)) : self.tags;
                return results;
            }

            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(tag) {
                    return angular.lowercase(tag).indexOf(lowercaseQuery) == 0;
                    //return tag.toLowerCase().includes(lowercaseQuery);
                }
            }

            function newTag(tag) {
                if (tag && self.chipTags.indexOf(tag) == -1) {
                    self.chipTags.push(tag);
                    searchTag();
                }
            }

            function searchTag() {
                self.impiegati = [];
                var s = '';
                self.chipTags.forEach(function(tag) {
                    tag = tag.replace(/\+/g, encodeURIComponent('+'));
                    s ? s += ',' + tag : s = tag;
                }, this);

                opsTags.searchTag(s).then(function(result) {
                    if (result.data.forbidden) {
                        $location.path('/login');
                    } else {
                        self.impiegati = result.data;
                    }
                });
            }

        }]
    })

    .factory('opsTags', ['$http','token', function ($http, token) {

        return {

            getTags: function getTags() {
                var options = getOptions();
                if (token.getProfile() == 'ALL_USERS') {
                    options.params = {
                        societa: token.getSocieta()
                    };
                }
                return $http.get(serviceConfig.getSuggestions, options);
            },

            searchTag: function searchTag(exp) {
                var data = 'expertise=' + exp;
                var options = getOptions();
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                if (token.getProfile() == 'ALL_USERS') {
                    options.params = {
                        societa: token.getSocieta()
                    };
                }
                return $http.post(serviceConfig.ricercaImpiegato, data, options);
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

    }]);