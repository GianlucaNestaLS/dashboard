angular.module('token')
    .service('token', [function() {

        var self = this;
        var user, token, utente, profilo, privacy, societa;

        self.getUser = function() {
            if (!user)
                user = localStorage.getItem('user');
            return user;
        };

        self.setUser = function(u) {
            user = u;
            localStorage.setItem('user', u);
        };

        self.getToken = function() {
            if (!token)
                token = localStorage.getItem('token');
            return token;
        };

        self.setToken = function(t) {
            token = t;
            localStorage.setItem('token', t);
        };

        self.setUtente = function(u) {
            utente = u;
            localStorage.setItem('utente', u);
        };

        self.getUtente = function() {
            if (!utente)
                utente = localStorage.getItem('utente');
            return utente;
        };

        self.setProfile = function(r) {
            profilo = r;
            localStorage.setItem('profilo', r);
        };

        self.getProfile = function() {
            if (!profilo)
                profilo = localStorage.getItem('profilo');
            return profilo;
        };

        self.setPrivacy = function(p) {
            privacy = p;
            localStorage.setItem('privacy', p);
        };

        self.getPrivacy = function() {
            if (!privacy)
                privacy = localStorage.getItem('privacy');
            return privacy;
        };

        self.setSocieta = function(s) {
            societa = s;
            localStorage.setItem('societa', s);
        };

        self.getSocieta = function() {
            if (!societa)
                societa = localStorage.getItem('societa');
            return societa;
        };

    }]);