angular.module('learningGames')
    .factory('ActionService', ['$http', '$q', function ($http, $q) {
	var actionService = {
		urlPrefix: "http://azization.awardspace.info/Games/",
		httpGet: function(params){
			return $http.get(urlPrefix + "php/Actions.php", {params: params});
		},
		httpPost: function(params){
			return $http.post(urlPrefix + "php/Actions.php",  params);
		},
		login: function(isNew, user, pwd){
			return $http.post(urlPrefix + "Login.php",
				{
					action: isNew? "new": "login",
					email: user,
					pwd: pwd
				});
		}
	};
	return actionService;
}]);
