angular.module('learningGames')
    .factory('ActionService', ['$http', '$q', function ($http, $q) {
		
	var toparams = function(obj) {
		var p = [];
		for (var key in obj) {
			p.push(key + '=' + encodeURIComponent(obj[key]));
		}
		return p.join('&');
	};
	var actionService = {
		urlPrefix: "http://azization.awardspace.info/Games/",
		httpGet: function(params){
			return $http.get(this.urlPrefix + "php/Actions.php", {params: params});
		},
		httpPost: function(params){
			//return $http.post(this.urlPrefix + "php/Actions.php",  params);
			return $http({
				method: 'POST',
				url: this.urlPrefix + "php/Actions.php",
				data: toparams(params),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			});
		},
		login: function(isNew, user, pwd){
			return $http.post(this.urlPrefix + "Login.php",
				{
					action: isNew? "new": "login",
					email: user,
					pwd: pwd
				});
		}
	};
	return actionService;
}]);
