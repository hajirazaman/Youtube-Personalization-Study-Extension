var person = new Object();
person.id = Math.random().toString().slice(2,26);

FILE_DOWNLOADED = false
HTTP_READYSTATE_DONE = 4;
HTTP_STATUS_OK = 200;
var loggedInGoogle = false;

DONE_STATUSES = {
	"GOOGLEACTIVITY_DONE": false,
	"HOMEPAGE_DONE": false,
	"INTERESTS_DONE": false,
	"SURVEYDATA_DONE": false,
	"SUBSCRIBERS_DONE": false
};

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
	  if(request.type == "init"){
		chrome.tabs.sendMessage(surveyTabId, {"type":"logStatus" , "msgg": "Survey Started"});
	  }
	  if(request.type == "surveyResult"){
		console.log(request.data);
		person.surveyData = request.data;
		DONE_STATUSES.SURVEYDATA_DONE = true;
   }
})

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function allDone() {
	return Object.keys(DONE_STATUSES).every((k) => DONE_STATUSES[k]);
}

function resetDones() {
	Object.keys(DONE_STATUSES).forEach(v => DONE_STATUSES[v] = false)
}

function loggedInGoogleCheck(extentionOnClick){
	chrome.cookies.get({url:'https://accounts.google.com', name:'LSID'}, function(cookie){
		if (cookie) {
			loggedInGoogle = true;
			console.log('Sign-in cookie:', cookie);
		}
		else {
			if (extentionOnClick)
				alert("Please log in to your Google Account to use the Extention.");
			else if (loggedInGoogle)
				alert("You Logged Out of your Google Account. Please log back in to use the Extention.");
			loggedInGoogle = false;
			console.log("not signed in");
			// alert("Please log in to your Google Account use the Extention.")
		}
	});
}

// lagging out in the middle of collecting data
chrome.cookies.onChanged.addListener(async function(info) {
	var cookie_info = JSON.stringify(info);
	// console.log(cookie_info);
	loggedInGoogleCheck(false);
	while (!loggedInGoogle) {
		await sleep(100);
	}
});

chrome.browserAction.onClicked.addListener(async function(){
	FILE_DOWNLOADED = false
	console.log("Clicked Browser Action Icon")
	loggedInGoogleCheck(true);
	while (!loggedInGoogle) {
		await sleep(100);
	}
	await sleep(5000);
	
	// survey
	chrome.tabs.create({
		url: chrome.extension.getURL('/survey/survey_html.html'),
		active: true
	  }, function(tab) {
		surveyTabId = tab.id;
	});
	// google_activity background script
	triggerCrawlGoogleActivity();
	// interests background script
	getInterestData();
	// homepage background script
	collectHomePageData();
	// subscribed_channels background script
	crawlSubscribedChannels();
	
	while (!allDone()) {
		console.log(DONE_STATUSES);
		await sleep(5000);
	}
	downloadFile();
	resetDones();
});

function downloadZippedJson(json_data) {
	var personStringify = JSON.stringify(json_data);
	var blob = new Blob([personStringify], {type: "application/json;charset=utf-8;",});
	var zip = new JSZip();
	zip.file(person.id + ".json", blob);
	zip.generateAsync({type:"blob", compression: "DEFLATE"})
		.then(function(content) {
			saveAs(content, person.id + "_response.zip");
	});
}

function downloadFile(){
	console.log("Downloading Data...");		
	if (allDone() && !FILE_DOWNLOADED) {
		FILE_DOWNLOADED =  true; // to prevent async downloads
		var download_date = new Date();
		person.updatedAt = download_date.toISOString();
		// person.updatedAt = download_date.toDateString();
		console.log("Downloading User Data File");
		console.log(person)
		downloadZippedJson(person);
		console.log("COLLECTED ALL DA DATA")
	} else {
		console.log("ALL DATA HAS NOT BEEN COLLECTED.");
		console.log(DONE_STATUSES);
		console.log(person);
	}
}

// if data has multiple regex matches
// get first capture group from each match
function getAllRegexMatches(regex, data) {
	var matches, output = [];
	while (matches = regex.exec(data)) {
		output.push(matches[1]);
	}
	return output
}