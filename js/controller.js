angular.module('learningGames', ['ngRoute'])
.config(function($routeProvider) {
	$routeProvider
	.when('/login/:new?', {
		controller:'loginCtrl',
		templateUrl:'UserLogin.htm'
	})
	.when('/gameList', {
		controller:'gameListCtrl',
		templateUrl:'list.htm'
	})
	.when('/questList', {
		controller:'questListCtrl',
		templateUrl:'list.htm'
	})
	.when('/:quest?/:game?', {
		controller:'MainCtrl',
		templateUrl:'practice.htm'
	})
	.when('/', {
		controller:'MainCtrl',
		templateUrl:'practice.htm'
	})
	.otherwise({
		redirectTo:'/'
	});
})
.factory('userCredentials', function() {
	var userCredentials = { userName: "אורח" };
	return userCredentials;
})
.factory('questionaire', function() {
	var questionaire = { };
	
	questionaire.set = function(name) {
		this.name = name;
		this.questIndex = 0;
		this.questions = [];
	};
	questionaire.set("חיסור");
	return questionaire;
})
.factory('game', function() {
	var game = {questImage: new Image(), rightImage: new Image(), wrongImage: new Image(), imagesSrc: ["", "", "", ""]};
	
	game.set = function(name) {
		this.name = name;
	};
	game.set("מונדיאל");
	return game;
})
.controller('MainCtrl', 
	['$scope', '$location', '$routeParams', 'questionaire', 'game', 'userCredentials',
		function($scope, $location, $routeParams, questionaire, game, userCredentials) {
	$scope.questionaire = questionaire;
	$scope.game = game;
	$scope.userCredentials = userCredentials;
	if ($routeParams.quest && $routeParams.quest != "Current")
	{
		questionaire.set($routeParams.quest);
	}

	if ($routeParams.game && $routeParams.game != "Current")
		game.set($routeParams.game);
		
	$scope.answerImageMaxWidth = Math.min(100, $(window).width() / 4);
	$scope.displayQuestion =function(offset)
	{
		questionaire.questIndex += offset;
		if (!questionaire.questions)
			return false;

		//in case of restart questions
		if (questionaire.questIndex < 0 || questionaire.questIndex >= questionaire.questions.length)
			questionaire.questIndex = 0;
		
		if (!$scope.alert || $scope.alert.mode != "info")
		{
			$scope.alert = {
				mode: "info",
				message: (
					["בחרו את התשובה הנכונה", "נא לפתור את השאלה הבאה", "נו, נראה אתכם עכשיו...", "נסו לענות גם על זה:", "מה התשובה הפעם?"]
					)[Math.floor(Math.random()*5)]
			};
		}
		$scope.rightIndex = Math.floor(Math.random()*4);
		var q = questionaire.questions[questionaire.questIndex];
		$scope.questDisplayIndex = q.data_index;
		$scope.question = q.Question;
		$scope.answers = [ {key: "א", index:0}, {key: "ב", index:1}, {key: "ג", index:2}, {key: "ד", index:3} ];
		$scope.answers[$scope.rightIndex].value = q.Answer;
		$scope.answers[(($scope.rightIndex+1)%4)].value = q.Wrong1;
		$scope.answers[(($scope.rightIndex+2)%4)].value = q.Wrong2;
		$scope.answers[(($scope.rightIndex+3)%4)].value = q.Wrong3;
		/*
		$('#questTable > thead > tr > td:eq(1)').text(q.Question);
		$('#questTable > tbody > tr:eq(' + $scope.rightIndex + ') > td').text(q.Answer);
		$('#questTable > tbody > tr:eq(' + (($scope.rightIndex+1)%4) + ') > td').text(q.Wrong1);
		$('#questTable > tbody > tr:eq(' + (($scope.rightIndex+2)%4) + ') > td').text(q.Wrong2);
		$('#questTable > tbody > tr:eq(' + (($scope.rightIndex+3)%4) + ') > td').text(q.Wrong3);
		*/
		
		$scope.answerRowClasses = ["", "", "", ""];
		//$(".question-image").show();
		//$(".right-image").hide();
		//$(".wrong-image").hide();
		$scope.resetQuestImages();
		$scope.state = "displayQuestion";
		$scope.nextButtonSize = "";
	};
	
	$scope.resetQuestImages = function() {
		var src = $scope.game.questImage.src;
		$scope.game.imagesSrc = [src, src, src, src]; //initialize all images with question image
	};
	
	loadItemInto("questions", questionaire.name, function(data){
		$scope.$apply(function(){
			questionaire.questions = data;
			$scope.displayQuestion(0);
		});
	});

	loadItemInto("game", $scope.game.name, function(data){
		$scope.$apply(function(){
			//$scope.game.questImage.src = "http://istanbul29may.files.wordpress.com/2011/10/treasure-box.jpg";
			//$scope.game.rightImage.src = "http://www.mygift.ws/images/products/rosh-hashana/6.JPG";
			//$scope.game.wrongImage.src = "http://4.bp.blogspot.com/-_ezIlBwvXIo/TV1jN87sBKI/AAAAAAAAAts/9joXYa19qM8/s1600/Kaboom.gif";
			$.each(data, function( key, val1 ) {
				var name = val1["Name"];
				var value = val1["Value"];
				if (name == "Question Image") $scope.game.questImage.src = value;
				else if (name == "Right Image") $scope.game.rightImage.src = value;
				else if (name == "Wrong Image") $scope.game.wrongImage.src = value;
			});
			$scope.resetQuestImages();
		});
	});

	$scope.shown =function(compName)
	{
		if (compName == "Prev" && questionaire.questIndex == 0)
				return "none";

		if (compName == "Next" && questionaire.questIndex >= questionaire.questions.length -1)
				return "none";
				
		if (compName == "Restart" && questionaire.questIndex !=  questionaire.questions.length -1)
				return "none";

		return "inherit";
	};
	
	$scope.tryAnswer = function(index)
	{
		if ($scope.state == "tryAnswer")
		{
			$scope.displayQuestion(1);
			return;
		}
		$scope.state = "tryAnswer";
		$scope.nextButtonSize = "btn-lg";
		
		//var parentDiv = $(event.currentTarget).find(".question-image").parent();
		var parentDiv = $("#answerImageDiv" + index);
		parentDiv.fadeOut(140, 'swing', function(){
			//$(event.currentTarget).find(".question-image").hide();
			$scope.$apply(function() {
				if (index == $scope.rightIndex)
				{
					$scope.game.imagesSrc[index] = $scope.game.rightImage.src;
					$scope.answerRowClasses[index] = "success";
					$scope.alert.mode = "success";
					$scope.alert.message = (
						["נכון מאוד!!!", "כל הכבוד!", "מצויין!!", "תשובה נכונה!!!", "איזה יופי!!!", "ב ר א ב ו", "סחתיין!", "ענק!!!", "יפה מאוד!", "להוריד את הכובע!"]
						)[Math.floor(Math.random() * 10)];
				}
				else{
					$scope.game.imagesSrc[index] = $scope.game.wrongImage.src;
					$scope.alert.mode = "danger";
					$scope.alert.message = "'" + $scope.answers[index].value +"' אינו התשובה הנכונה.\n" +
						"התשובה היא '" + $scope.answers[$scope.rightIndex].value + "'";
				
					$scope.answerRowClasses[$scope.rightIndex] = "info";
					$scope.answerRowClasses[index] = "danger";
				}
			});
			parentDiv.fadeIn(140, 'swing');
		});
	}
	
}])
.controller('questListCtrl', function($scope) {
	$scope.items = [];
	$scope.listType = "questions";
	$scope.listItemType = "שאלון";
	$scope.listItemTypePlural = "שאלונים";
	$scope.itemChosen = function(name) {return "#/" + name;}
	$scope.loadItems = loadItems;
	$scope.loadItems($scope, "public");
})
.controller('gameListCtrl', function($scope) {
	if (!$scope.items)
		$scope.items = [];
	$scope.listType = "game";
	$scope.listItemType = "משחק";
	$scope.listItemTypePlural = "משחקים";
	$scope.itemChosen = function(name) {return "#/Current/" + name;}
	
	$scope.loadItems = loadItems;
	$scope.loadItems($scope, "public");
})
.controller('loginCtrl',
	['$scope', '$location', '$routeParams', 'userCredentials',
	function($scope, $location, $routeParams, userCredentials)
	{
		$scope.isNew = !! $routeParams["new"];
		$scope.signInTabClass = $scope.isNew? "" : "active";
		$scope.signUpTabClass = $scope.isNew? "active" : "";
		$scope.loginHeading = $scope.isNew? "יצירת חשבון חדש" : "נא למלא פרטי משתמש";
		$scope.submitButtonLabel = $scope.isNew? "צור חשבון" : "התחבר";
		$scope.confirmPasswordVisibility = $scope.isNew? "visible" : "hidden";
		$scope.login = function(){
			$.post( "Login.php", {action: $scope.isNew? "new" : "login", email: encodeURIComponent($scope.userName), pwd: encodeURIComponent($scope.userPassword)}, function( data ) {
				//alert(data);
				var err = getInnerXml(data, "Error");
				var resp = getInnerXml(data, "Response");
				if (err != null)
					document.getElementById("loginErrorDiv").innerHTML=err;
				else if (resp != null)
				{
					userCredentials.userName = $scope.userName;
					$("#userLoginLink").text(userCredentials.userName);
					$scope.$apply(function(){
						$location.path('').replace();
					});
				}
				else document.getElementById("loginErrorDiv").innerHTML="תשובה לא מזוהה מהשרת";
			});
		};
	}]
)
/*.directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
			alert("hello");
             if (this.pageYOffset >= 100) {
                 scope.boolChangeClass = true;
                 console.log('Scrolled below header.');
             } else {
                 scope.boolChangeClass = false;
                 console.log('Header is in view.');
             }
            scope.$apply();
        });
    };
});*/


function loadItems(scope, itemsScope)
{
	$.getJSON( "php/Actions.php", {action: "list", type: scope.listType, scope: itemsScope }, function( data ) {
		scope.$apply(function(){
			scope.items = data;
		});
	});
};


function loadItemInto(itemType, itemName, fillDataCallback)

{
	/*setTimeout(function()
	{
	fillDataCallback([{"id":"76","itemId":"9","data_index":"1","Question":"6-3 ","Answer":"3","Wrong1":"2","Wrong2":"9","Wrong3":"4","Wrong4":""},{"id":"77","itemId":"9","data_index":"2","Question":"8-5","Answer":"3","Wrong1":"4","Wrong2":"6","Wrong3":"10","Wrong4":""},{"id":"78","itemId":"9","data_index":"3","Question":"10-5","Answer":"5","Wrong1":"6","Wrong2":"8","Wrong3":"4","Wrong4":""},{"id":"79","itemId":"9","data_index":"4","Question":"4-3","Answer":"1","Wrong1":"2","Wrong2":"7","Wrong3":"5","Wrong4":""},{"id":"80","itemId":"9","data_index":"5","Question":"3-1","Answer":"2","Wrong1":"1","Wrong2":"4","Wrong3":"3","Wrong4":""},{"id":"81","itemId":"9","data_index":"6","Question":"4-3","Answer":"1","Wrong1":"2","Wrong2":"3","Wrong3":"4","Wrong4":""},{"id":"82","itemId":"9","data_index":"7","Question":"7-7","Answer":"0","Wrong1":"7","Wrong2":"1","Wrong3":"3","Wrong4":""},{"id":"83","itemId":"9","data_index":"8","Question":"6-2","Answer":"4","Wrong1":"3","Wrong2":"2","Wrong3":"5","Wrong4":""},{"id":"84","itemId":"9","data_index":"9","Question":"10-3","Answer":"7","Wrong1":"4","Wrong2":"5","Wrong3":"13","Wrong4":""},{"id":"85","itemId":"9","data_index":"10","Question":"a","Answer":"b","Wrong1":"c","Wrong2":"d","Wrong3":"e","Wrong4":"f"}]);
	}, 1);
	return;*/

	$.getJSON( "php/Actions.php", {action: "load", type: itemType, name: itemName}, function( data ) {
		/*var dataArray = data;
		if (!$.isArray(dataArray))
		{
			dataArray = [];
			$.each(
		}*/
		fillDataCallback(data);
	});
}

function getInnerXml(txt, tag)
{
  if (txt == null || !txt.indexOf) return null;
  var startInd = txt.indexOf("<"+tag+">");
  if (startInd < 0) return null;
  startInd += tag.length+2;
  var endInd = txt.indexOf("</"+tag+">",startInd);
  if (endInd < startInd) return null;
  return txt.substring(startInd, endInd);
}

