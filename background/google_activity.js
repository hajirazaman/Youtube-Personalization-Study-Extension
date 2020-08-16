////////////////////////////////////////////////////////////////////
// COLLECTING WATCH AND SEARCH HISTORY FROM myactivity.google.com //
////////////////////////////////////////////////////////////////////

var person = new Object();
person.id = Math.random().toString().slice(2,26);
loggedInGoogle = false;
googleActivityTabId = null

// this will trigger content_script.js due to condition in manifest
function triggerCrawlActivity(){
	console.log("Crawling Google Activity");
	// chrome.tabs.create(tab.id, {"url": "https://myactivity.google.com/item"}, function(tab){})
	chrome.tabs.create({
		url: "https://myactivity.google.com/item",
		active: false
	  }, function(tab) {
		googleActivityTabId = tab.id;
	});
}

function crawlGoogleActivity(){
	chrome.cookies.get({url:'https://accounts.google.com', name:'LSID'}, function(cookie){
		if (cookie) {
			loggedInGoogle = true;
			console.log('Sign-in cookie:', cookie);
			triggerCrawlActivity();
		}
		else{
			loggedInGoogle = false;
			console.log("not signed in");
			alert("Please log in to your Google Account use the Extention.")
		}
	});
  }

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse){
	  if (request.action==="GData"){
		console.log("Google Data Received ")
		// console.log(request.gdata)
		// person.googleActivity = request.gdata;
		person.watchHistory = request.WH;
		person.searchHistory = request.SH;
		DONE_STATUSES.GOOGLEACTIVITY_DONE = true;
		try {
			chrome.tabs.remove(googleActivityTabId);
		} catch(e){
			console.log("Exception in Closing Tab: "+ e)
		}
		downloadFile();
	}
});