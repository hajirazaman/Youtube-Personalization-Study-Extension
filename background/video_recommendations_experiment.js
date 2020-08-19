////////////////////////////////////////////////////////////////
// SEARCHING VIDEOS ON YOUTUBE AND COLLECTING RECOMMENDATIONS //
////////////////////////////////////////////////////////////////

// same scope as all the background scripts

function videoCrawl(url, refreshNo)
{
	var xhttp;
	xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if (this.readyState == 4 && this.status == 200) {
			try{
				receivedHTML = xhttp.responseText
				//singleVideoRecommendation[0] = receivedHTML;
				//videoRecommendations[videoDumpIndex.toString()][videoNumberIterator.toString()]={"0": [receivedHTML]}
				var z = receivedHTML.indexOf('"INNERTUBE_CONTEXT_CLIENT_VERSION"')
				client_version = receivedHTML.substring(z+36, z+500)
				z = receivedHTML.indexOf('"ID_TOKEN"')
				id_token = receivedHTML.substring(z+12, z+500)
				//z = receivedHTML.indexOf('"INNERTUBE_CONTEXT_CLIENT_NAME"')
				//client_name = receivedHTML.substring(z+32, z+500)
				z = receivedHTML.indexOf('"PAGE_BUILD_LABEL"')
				page_label = receivedHTML.substring(z+20, z+500)
				z = receivedHTML.indexOf('"PAGE_CL"')
				page_cl = receivedHTML.substring(z+10, z+500)
				var y = receivedHTML.indexOf('"VARIANTS_CHECKSUM"')
				checksum = receivedHTML.substring(y+21, y+500)
				var x = receivedHTML.indexOf("itct");
				var itct = receivedHTML.substring(x+7, x+500);
				var n = receivedHTML.lastIndexOf('"continuation":');
				var res = receivedHTML.substring(n+16, n+500);
				
				delimiter = id_token.indexOf('"');
				id_token = id_token.substring(0, delimiter)
				delimiter = client_version.indexOf('"');
				client_version = client_version.substring(0, delimiter)
				//delimiter = client_name.indexOf(',');
				//client_name = client_name.substring(0, delimiter)
				delimiter =  page_label.indexOf('"');
				page_label = page_label.substring(0, delimiter)
				delimiter = page_cl.indexOf(',');
				page_cl = page_cl.substring(0, delimiter)
				delimiter = checksum.indexOf('"');
				checksum = checksum.substring(0, delimiter);
				delimiter = itct.indexOf('"');
				itct = itct.substring(0, delimiter);
				delimiter = res.indexOf('"');
				res = res.substring(0, delimiter);
				
				/*z = receivedHTML.indexOf('ytInitialData');
				e = receivedHTML.charAt(receivedHTML.length - 1)
				e = receivedHTML.lastIndexOf(e)
				tillScriptHTML = receivedHTML.substring(z+18,e);
				z = tillScriptHTML.indexOf("ytInitialPlayerResponse")
				requireHTML = tillScriptHTML.substring(0, z-14)
				jsonFile = JSON.parse(requireHTML);
				f = jsonFile['contents']['twoColumnWatchNextResults']['secondaryResults']['secondaryResults']['continuations'][0]['nextContinuationData']['continuation']
				*/
				// console.log("ITCT: "+ itct + " Res: "+ res);
				nextRequest(res, itct, id_token, client_version, page_label, page_cl, checksum, url, refreshNo, receivedHTML)
			}	
			catch(exception)
			{
				console.log("Main Request: " + exception)
			}
		}
	};
	  
	xhttp.open("GET", url, true);
	xhttp.send();	
}


function nextRequest(res, itct, id_token, client_version, page_label, page_cl, checksum, currentUrl, refreshNumber, pageHtml)
{	
	// console.log(res, itct)
	var relatedURL = "https://www.youtube.com/related_ajax?ctoken=" + res + "&continuation=" + res + "&itct=" + itct;
	var xhttp;
	xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) {
			try{
				console.log("IN iF")
				response = xhttp.responseText;
				response = JSON.parse(response);
				var responseCheck = 0;
				if(!response[1]['response']['continuationContents']){
					console.log("Problem")
					// throw "Undefined item";
				}
				if(response[1]['response']['continuationContents']['watchNextSecondaryResultsContinuation'] == undefined)
					responseCheck = 1
				
				myUrl = currentUrl.slice(32);
				var tmp = new Object;
				tmp[0] = pageHtml;
				if(responseCheck == 0)
					tmp[1] = response
				//dict = []
				//dict.refreshNumber = tmp
				if(videoRecommendations[myUrl] == undefined)
					videoRecommendations[myUrl] = [];
				
				videoRecommendations[myUrl][refreshNumber] = tmp;
				
				if(iterator == videoList.length-1)
				{	
					Videoscomplete = true;
					console.log(videoRecommendations)
					if(Googlecomplete === true)
					{	
						console.log("Download Request when Videos Done");
						downloadFile(person);
					}
				}
				iterator = iterator + 1
			}	
			catch(exception)
			{	
				
				console.log("Related Request: " + exception)
				// alert("error")
				chrome.tabs.sendMessage(myPopUp, {"type":"video_exception"});
			}
		}
	};
  
	xhttp.open("GET", relatedURL, true);
	//xhttp.setRequestHeader("referer", currentUrl);
	xhttp.setRequestHeader("x-spf-previous", currentUrl);
	xhttp.setRequestHeader("x-spf-referer", currentUrl);
	xhttp.setRequestHeader("x-youtube-client-name", "1");
	xhttp.setRequestHeader("x-youtube-client-version", client_version);
	xhttp.setRequestHeader("x-youtube-identity-token", id_token);
	xhttp.setRequestHeader("x-youtube-page-cl", page_cl);
	xhttp.setRequestHeader("x-youtube-page-label", page_label);
	xhttp.setRequestHeader("x-youtube-utc-offset", "300");
	xhttp.setRequestHeader("x-youtube-variants-checksum", checksum);
	xhttp.send(JSON.stringify({"ctoken": res, "continuation": res, "itct": itct}));
	
}