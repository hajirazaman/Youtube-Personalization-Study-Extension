console.log("loading")

chrome.runtime.sendMessage({type:'init', data:'making sure that this content script has been injected'});

window.survey = new Survey.Model({
  title: "Election 2020 Survey",
  showProgressBar: "bottom",
  goNextPageAutomatic: false,
  showNavigationButtons: true, 
  showQuestionNumbers: 'off',
  "pages": [
    {
     "name": "page1",
     "elements": [
      {
        "type": "text",
        "name": "prolificID",
        "title": "Please enter your Prolific ID?",
        "isRequired": true,
      },
      {
       "type": "text",
       "name": "age",
       "title": "What is your age?",
       "isRequired": true,
       "inputType": "number",
       "min": "18",
       "max": "100"
      },
      {
       "type": "radiogroup",
       "name": "politicalParty",
       "title": "Which party are you inclined to vote for?",
       "isRequired": true,
       "requiredErrorText": "You must select one political party affiliation!",
       "choices": [
        {
         "value": "Democrat",
         "text": "Democrat"
        },
        {
         "value": "Republican",
         "text": "Republican"
        },
        {
         "value": "Third Party",
         "text": "Third Party"
        },
        {
         "value": "Undecided",
         "text": "Undecided"
        }
       ]
      }
     ],
     "title": "Elections 2020 Survey"
    }
   ]
});

survey.onComplete.add(function(result) {
    //document.querySelector('#surveyResult').innerHTML = ""
	document.querySelector('#surveyElement').innerHTML = "<h3>Please wait while we process your response.</h3>"
	document.querySelector('#surveyResult').innerHTML = "<br/>This may take a while. We appreciate your patience."
  chrome.runtime.sendMessage({type:'surveyResult', data:result.data});
    // chrome.runtime.sendMessage({type:'surveyResult', data: "{}" });
});

ReactDOM.render(< Survey.Survey model = {survey} />, 
		document.getElementById("surveyElement"));
