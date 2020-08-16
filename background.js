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
			collectInitialHomePageData();
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

	// var personStringify = JSON.stringify(person);
	// var blob = new Blob([personStringify], {type: "application/json;charset=utf-8;",});
	// var zip = new JSZip();
	// zip.file(person.id + ".json", blob);
	// zip.generateAsync({type:"blob", compression: "DEFLATE"})
	// 	.then(function(content) {
	// 		saveAs(content, person.id + "_response.zip");
	// });
}

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse){
	  if (request.action==="GData"){
		console.log("Google Data Received ")
		// console.log(request.gdata)
		// person.googleActivity = request.gdata;
		person.watchHistory = request.WH;
		person.searchHistory = request.SH;
		Googlecomplete = true;
		downloadFile();
		try {
			chrome.tabs.remove(googleActivityTabId);
		} catch(e){
			console.log("Exception in Closing Tab: "+ e)
		}
	}
});

//////////////////////////////////////////////////////
// COLLECTING INITIAL HOMEPAGE I.E youtube.com DATA //
//////////////////////////////////////////////////////

var header = {};
HTTP_READYSTATE_DONE = 4;
HTTP_STATUS_OK = 200;

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

function getAllRegexMatches(regex, data) {
	var matches, output = [];
	while (matches = regex.exec(data)) {
		output.push(matches[1]);
	}
	return output
}

function parseVideoInformation(data){
	var regex_videoIDs = /"videoRenderer":{"videoId":"(.[^"]*)"/g;
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

async function collectInitialHomePageData(){
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
	// console.log(person.HomePage);
	// console.log(HomePagecomplete);
}

/////////////////////////////////////////////////////////
// SEARCHING KEYWORDS ON GOOGLE AND COLLECTING RESULTS //
/////////////////////////////////////////////////////////

