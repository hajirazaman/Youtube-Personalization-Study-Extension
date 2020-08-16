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

//////////////////////////////////////////////////////
// COLLECTING INITIAL HOMEPAGE I.E youtube.com DATA //
//////////////////////////////////////////////////////

var header = {};

function GetcToken(data){
	var ctoken = data.match(/"continuationCommand":{"token":"(.*?)"/g)[0];
    ctoken = ctoken.substring(32, ctoken.length-1);
    return ctoken;
}

function GetITCT(data) {
	var itct = data.match(/"clickTrackingParams":"(.*?)"/g)[0];
	itct = itct.substring(24, itct.length-1);
	return itct;
}

function parseVideoInformation(data){
	var regex_videoIDs = /"videoRenderer":{"videoId":"([^"]*)"/g;
	var regex_videoTitles = /"videoRenderer":{"videoId":".*?"title":{"runs":\[{"text":"(.*?)"}\]/g;
	regex_channelNames = /"videoRenderer":{"videoId":".*?"shortBylineText":{"runs":\[{"text":"([^"]*)"/g;
	regex_channelIDs = /"videoRenderer":{"videoId":".*?"browseEndpoint":{"browseId":"([^"]*)"/g;
	videoIDs = getAllRegexMatches(regex_videoIDs, data);
	videoTitles = getAllRegexMatches(regex_videoTitles, data);
	channelNames = getAllRegexMatches(regex_channelNames, data);
	channelIDs = getAllRegexMatches(regex_channelIDs, data);

	for (i=0; i<videoTitles.length; i++) {
		person.HomePage.push({
			'id': videoIDs[i],
			'name': videoTitles[i],
			'channelName': channelNames[i],
			'channelID': channelIDs[i],
		});
	}
}

async function collectHomePageData(){
	person.HomePage = [];
	console.log("Homepage");
	const Http = new XMLHttpRequest();
	const url = "https://www.youtube.com";

	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange = async function (){
    	if(this.readyState == HTTP_READYSTATE_DONE && this.status == HTTP_STATUS_OK){
			var data = this.responseText;
			parseVideoInformation(data);
    		header['accept'] = "*/*";
			header['x-spf-previous'] = "https://www.youtube.com/";
			header['x-spf-referer'] = "https://www.youtube.com/";
			var clientName = data.match(/client.name=./)[0];
			var clientVersion = data.match(/"cver","value":"(.*?)"/g)[0];
			var idToken = data.match(/"ID_TOKEN":"(.*?)"/g)[0];
			var pageCl = data.match(/"PAGE_CL":(.*?),/g)[0];
			var checksum = data.match(/"VARIANTS_CHECKSUM":"(.*?)"/g)[0];
			header['x-youtube-client-name'] = clientName.substring(12, clientName.length);
			header['x-youtube-client-version'] = clientVersion.substring(16,clientVersion.length-1);
			header['x-youtube-identity-token'] = idToken.substring(12, idToken.length-1);
			header['x-youtube-page-cl'] = pageCl.substring(10, pageCl.length-1);
			header['x-youtube-variants-checksum'] = checksum.substring(21 ,checksum.length-1);	
			console.log("Downloading Data...");		
			homePageContinuationData(GetcToken(data), GetITCT(data));
    	}
	}
}

async function homePageContinuationData(ctoken, itct)
{
	console.log("In continuation");
	var continuation = ctoken;

	while(true) {
		var url = "https://www.youtube.com/browse_ajax?";
		url = url.concat("ctoken=", ctoken, "&", "continuation=", continuation, "&", "itct=", itct);
	  	const response = await fetch(url, {
	    	credentials: 'same-origin', // include, *same-origin, omit
	    	headers: header,
		    referrer: "https://www.youtube.com/",
	    	referrerPolicy:"origin-when-cross-origin",
	    	body:null,
	    	method:"GET",
	    	mode:"cors"
	  	});
  
  		const myJson = await response.json();
		try{
			parseVideoInformation(JSON.stringify(myJson));
		} catch{
			person.HomePage.push({
    			'PageInfo': myJson
			});
		}
			
		try {
			ctoken = GetcToken(JSON.stringify(myJson));
			continuation = ctoken;
			itct = GetITCT(JSON.stringify(myJson));
		} catch {
			break;
		}
		
	}
	DONE_STATUSES.HOMEPAGE_DONE = true;
	downloadFile();
	// console.log(person.HomePage);
	// console.log(HomePagecomplete);
}

////////////////////////////////////////////////////////
// GETTING INTERESTS DATA FROM adssettings.google.com //
////////////////////////////////////////////////////////

function getInterestData() {
	person.userInterests = [];
	const Http = new XMLHttpRequest();
	const url = "https://adssettings.google.com/authenticated";
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange= async function (){
    	if(this.readyState == HTTP_READYSTATE_DONE && this.status == HTTP_STATUS_OK){
    		var data = Http.responseText;
    		//console.log(data)	
    		var age = data.match(/aria\-label=\"Age:(.*?)"/g)[0];
    		age = age.substring(16, age.length-1);
    		var gender = data.match(/aria\-label=\"Gender:(.*?)"/g)[0];
			gender = gender.substring(20, 26);
			
			//console.log(data.match(/\[\[\[\[(.*\n)*\}\}\)/g), "y");	
			var regex_interests = /\[null,"[0-9]+","([^"]*)/g;
			interests = getAllRegexMatches(regex_interests, data)
			console.log(interests)
    		person.userInterests.push({
				'age': age,
				'gender': gender,
				'interests': interests
			});
    	}
    }
	DONE_STATUSES.INTERESTS_DONE = true;
	downloadFile();
    // console.log(userInterest);
    // Interestscomplete = true;
}



/////////////////////////////////////////////////////////
// SEARCHING KEYWORDS ON GOOGLE AND COLLECTING RESULTS //
/////////////////////////////////////////////////////////

