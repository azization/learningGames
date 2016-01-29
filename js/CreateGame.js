angular.module('learningGames')
.controller('createGameCtrl', ['ActionService', 'game', '$location', 'userCredentials', '$scope', function(ActionService, game, $location, userCredentials, $scope)
{
/*
google.load('search', '1');
function onLoad() {
  // Create a Custom Search Element that uses a
  // Custom Search Engine restricted to code.google.com.
  // Change the customSearchId string to the CSE ID of
  // your own Custom Search engine.
  var customSearchControl =
    new google.search.CustomSearchControl(
      '016454937625884506196:q7qi6vfnipk');


  // Set drawing options to set the root element for the
  // search form (where you have defined a div such as
  // <div id="search-form">)
  var drawOptions = new google.search.DrawOptions();
  drawOptions.setSearchFormRoot('search-form');

  // Draw the search results in the results div
  customSearchControl.draw('results', drawOptions);
}

google.setOnLoadCallback(onLoad);
*/
	if (!userCredentials.loggedIn)
	{
		$location.path("login");
		return;
	}
	var self = $scope;

	self.game = game;
	
	self.onKeepCallback=function(obj){
		//alert(JSON.stringify(obj.unescapedUrl));
		if (obj && obj.unescapedUrl)
		{
			$scope.$apply(function(){
				self.chosenImageData.imageUrl = obj.unescapedUrl;
			});
		}
	};
	self.createSearchControl=function(name)
	{
		var options = {disableWebSearch: true, defaultToImageSearch: true, enableImageSearch: true,
			imageSearchOptions:{layout: google.search.ImageSearch.LAYOUT_CLASSIC}};
		options[google.search.Search.RESTRICT_SAFESEARCH] = google.search.Search.SAFESEARCH_STRICT;

  var customSearchControl =
    new google.search.CustomSearchControl(
      '016454937625884506196:q7qi6vfnipk', options );

	customSearchControl.setOnKeepCallback(
  null,
  self.onKeepCallback,
  google.search.SearchControl.KEEP_LABEL_COPY);
  // Set drawing options to set the root element for the
  // search form (where you have defined a div such as
  // <div id="search-form">)
  var drawOptions = new google.search.DrawOptions();
  //drawOptions.setSearchFormRoot('search-form-' + name);

  // Draw the search results in the results div
  customSearchControl.draw('search-results-' + name, drawOptions);
	};
	
	self.imagesData =
	[
		{
			name: "question",
			displayName: "שאלה",
			imageUrl: "http://upload.wikimedia.org/wikipedia/en/f/f5/Question_mark.PNG"
		},
		{
			name: "right",
			displayName: "תשובה נכונה",
			imageUrl: "http://sp.ask.com/i/h/nascar/qa/correct_icon.jpg"
		},
		{
			name: "wrong",
			displayName: "תשובה שגויה",
			imageUrl: "http://spartansgym.com/wp-content/uploads/2011/12/wrong-doings1.png"
		}
	];
	
	self.chooseImage=function(imageData)
	{
		self.chosenImageData = imageData;
		self.createSearchControl(imageData.name);
	};
	
	self.saveGame=function(){
		return ActionService.httpPost({
			action: "save",
			type: "game",
			name: self.game.name,
			values: JSON.stringify([
				{Name: "Question Image", Value: self.imagesData[0].imageUrl},
				{Name: "Right Image", Value: self.imagesData[1].imageUrl},
				{Name: "Wrong Image", Value: self.imagesData[2].imageUrl}
			])
		}).then(function(response){
			if (response && response.data && response.data.status == "ok")
				bootbox.confirm("המשחק נשמר. האם תרצה\י לשחק בו?", function(result){
					if (result){
						$scope.$apply(function(){
							$location.path("");
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
