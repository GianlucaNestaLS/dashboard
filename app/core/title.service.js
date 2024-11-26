angular.module('title')
.service('title', [function() {

    var self = this;
    var title;

    self.getTitle = function() {
        return title;
    };

    self.setTitle = function(t) {
        title = t;
    };

}]);