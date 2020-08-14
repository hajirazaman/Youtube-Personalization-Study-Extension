
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
	chrome.cookies.get({url:'https://accounts.google.com', name:'LSID'}, function(cookie) {
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

chrome.browserAction.onClicked.addListener(function(){
	console.log("Clicked Browser Action Icon")
	crawlGoogleActivity();
});

function downloadFile(){
	console.log("Downloading User Data File");
	var download_date = new Date();
	// person.updatedAt = download_date.toDateString();
	person.updatedAt = download_date.toISOString();
	console.log("COLLECTED ALL DA DATA")
	console.log(person)

	var personStringify = JSON.stringify(person);
	var blob = new Blob([personStringify], {type: "application/json;charset=utf-8;",});
	var zip = new JSZip();
	zip.file(person.id + ".json", blob);
	zip.generateAsync({type:"blob", compression: "DEFLATE"})
		.then(function(content) {
			saveAs(content, person.id + "_response.zip");
	});
}

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse){
	  if (request.action==="GData"){
		console.log("Google Data Received "+ request.gdata)
		// person.googleActivity = request.gdata;
		person.watchHistory = request.WH;
		person.searchHistory = request.SH;
		Googlecomplete = true;
		downloadFile();
		chrome.tabs.remove(googleActivityTabId);
	}
});

