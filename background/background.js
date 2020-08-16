FILE_DOWNLOADED = false
HTTP_READYSTATE_DONE = 4;
HTTP_STATUS_OK = 200;

DONE_STATUSES = {
	"GOOGLEACTIVITY_DONE": false,
	"HOMEPAGE_DONE": false,
	"INTERESTS_DONE": false
};

function allDone() {
	return Object.keys(DONE_STATUSES).every((k) => DONE_STATUSES[k]);
}

chrome.browserAction.onClicked.addListener(function(){
	console.log("Clicked Browser Action Icon")
	crawlGoogleActivity();
	getInterestData();
	collectHomePageData();
});

function downloadFile(){
	if (allDone() && !FILE_DOWNLOADED) {
		FILE_DOWNLOADED =  true;
		console.log("Downloading User Data File");
		var download_date = new Date();
		console.log("COLLECTED ALL DA DATA")
		console.log(person)
		
		// person.updatedAt = download_date.toDateString();
		// person.updatedAt = download_date.toISOString();
		// var personStringify = JSON.stringify(person);
		// var blob = new Blob([personStringify], {type: "application/json;charset=utf-8;",});
		// var zip = new JSZip();
		// zip.file(person.id + ".json", blob);
		// zip.generateAsync({type:"blob", compression: "DEFLATE"})
		// 	.then(function(content) {
		// 		saveAs(content, person.id + "_response.zip");
		// });
	} else {
		console.log("All data as not been collected.");
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