angular.module('learningGames')
.controller('createQuestCtrl', ['$routeParams', 'ActionService', 'questionaire', '$location', 'userCredentials', '$scope', function($routeParams, ActionService, questionaire, $location, userCredentials, $scope)
{
	if (!userCredentials.loggedIn)
	{
		//$location.path("login");
		//return;
	}
	var self = $scope;

	//the struct was split into an array of 2 structs, to ensure Question appears before Answer in ngRepeat (as opposed to alphabetical order)
	self.questStruct =[{Question: "שאלה"}, {Answer:"תשובה נכונה", "Wrong1": "תשובה שגויה 1", "Wrong2":"תשובה שגויה 2", "Wrong3":"תשובה שגויה 3"}];

	self.questionaire = {};
	
	self.initCurrentQuestion = function(){
		if (self.questionaire.questIndex >= self.questionaire.questions.length){
			self.questionaire.questions.push(
				{Question: "", Answer:"", "Wrong1": "", "Wrong2":"", "Wrong3":""});
		}		
	};
	
	if ($routeParams.quest)
	{
		questionaire.init(self.questionaire, $routeParams.quest);
		self.initCurrentQuestion();
		ActionService.httpGet({action: "load", type: "questions", name: self.questionaire.name}).then(function(result){
			self.questionaire.questions = result.data;
		});
	}
	else{
		questionaire.init(self.questionaire, "שאלון חדש");
		self.initCurrentQuestion();
	}
	
	self.nextQuestion=function(){
		self.questionaire.questIndex++;
		self.initCurrentQuestion();
	};
	
	self.prevQuestion=function(){
		if (self.questionaire.questIndex > 0)
			self.questionaire.questIndex--;
	};
	
	self.saveQuest=function(){
		return ActionService.httpPost({
			action: "save",
			type: "questions",
			name: self.questionaire.name,
			values: JSON.stringify(self.questionaire.questions)
		}).then(function(response){
			if (response && response.data && response.data.status == "ok")
				bootbox.confirm("השאלון נשמר. האם תרצה\י לתרגל אותו?", function(result){
					if (result){
						$scope.$apply(function(){
							$location.path(self.questionaire.name);
						});
					}
				});
			else
				bootbox.alert("שגיאה בשמירה");
		}, function(reason){
			bootbox.alert("שגיאה בשמירה");
		});
	};

}]);
