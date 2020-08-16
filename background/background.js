FILE_DOWNLOADED = false
HTTP_READYSTATE_DONE = 4;
HTTP_STATUS_OK = 200;
var loggedInGoogle = false;

DONE_STATUSES = {
	"GOOGLEACTIVITY_DONE": false,
	"HOMEPAGE_DONE": false,
	"INTERESTS_DONE": false
};

function allDone() {
	return Object.keys(DONE_STATUSES).every((k) => DONE_STATUSES[k]);
}

function loggedInGoogleCheck(){
	chrome.cookies.get({url:'https://accounts.google.com', name:'LSID'}, function(cookie){
		if (cookie) {
			loggedInGoogle = true;
			console.log('Sign-in cookie:', cookie);
			triggerCrawlGoogleActivity();
			getInterestData();
			collectHomePageData();
		}
		else{
			loggedInGoogle = false;
			console.log("not signed in");
			alert("Please log in to your Google Account use the Extention.")
		}
	});
}

// chrome.cookies.onChanged.addListener(function(info) {
// 	var cookie_info = JSON.stringify(info)
// 	// checking if signed into google
// 	   if(cookie_info.indexOf("accounts.google.com") !== -1 && cookie_info.indexOf("LSID") !== -1){
// 		  if(info.removed === true){
// 			  loggedInGoogle = false;
// 			  console.log("Not Signed in  Google");
// 			  alert("Please log in to your Google Account to use the Extention.")
// 		  } else {
// 			  loggedInGoogle = true;
// 			  console.log("Signed in  Google");    
// 		  }
// 	  }
//   }
// );

chrome.browserAction.onClicked.addListener(function(){
	console.log("Clicked Browser Action Icon")
	loggedInGoogleCheck();
	// if (loggedInGoogle) {
	// 	triggerCrawlGoogleActivity();
	// 	getInterestData();
	// 	collectHomePageData();
	// } else {
	// 	console.log("Need to Log In")
	// }
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
	if (allDone() && !FILE_DOWNLOADED) {
		FILE_DOWNLOADED =  true; // to prevent async downloads
		var download_date = new Date();
		person.updatedAt = download_date.toISOString();
		// person.updatedAt = download_date.toDateString();
		console.log("Downloading User Data File");
		console.log(person)
		// downloadZippedJson(person);
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