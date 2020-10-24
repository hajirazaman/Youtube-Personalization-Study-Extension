////////////////////////////////////////////////////////////////////
// COLLECTING WATCH AND SEARCH HISTORY FROM myactivity.google.com //
////////////////////////////////////////////////////////////////////

// same scope as all the background scripts

loggedInGoogle = false;
googleActivityTabId = null

// this will trigger content_script.js due to condition in manifest
function triggerCrawlGoogleActivity(){
	console.log("Crawling Google Activity");
	// chrome.tabs.create(tab.id, {"url": "https://myactivity.google.com/item"}, function(tab){})
	chrome.tabs.create({
		url: "https://myactivity.google.com/item",
		active: false
	  }, function(tab) {
		googleActivityTabId = tab.id;
	});
}

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse){
	  if (request.action==="googleActivityData"){
		console.log("Google Data Received ")
		// console.log(request.gdata)
		person.allGoogleActivity = request.allGoogleActivity;
		person.youTubeActivity = request.youTubeActivity;
		person.searchActivity = request.searchActivity;
		DONE_STATUSES.GOOGLEACTIVITY_DONE = true;
		console.log(person.searchActivity)
		console.log(person.youTubeActivity)
		// console.log("HERE WATCH ME !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
		try {
			chrome.tabs.remove(googleActivityTabId);
		} catch(e){
			console.log("Exception in Closing Tab: "+ e)
		}
		// downloadFile();
	}
});