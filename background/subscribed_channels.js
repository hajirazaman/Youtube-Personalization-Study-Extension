/////////////////////////////////////
// GETTING SUBCRIBED CHANNELS LIST //
/////////////////////////////////////

// same scope as all the background scripts

function crawlSubscribedChannels()
{
	person.subscribersList = [];
	const Http = new XMLHttpRequest();
	const url= "https://www.youtube.com/subscription_manager?action_takeout=1";
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange = function () {
		if(this.readyState == HTTP_READYSTATE_DONE && this.status == HTTP_STATUS_OK){	
			var data = Http.responseText;
			var regex_channelIDs = /channel_id=([^"]+)"/g;
			var regex_channelNames = /title="([^"]+)"/g;
			var channelIDs = getAllRegexMatches(regex_channelIDs, data);
			var channelNames = getAllRegexMatches(regex_channelNames, data);

			console.log("Storing Subscribers");

			for (i=0; i<channelIDs.length; i++) {
				person.subscribersList.push({
					'channelName': channelNames[i],
					'channelID': channelIDs[i],
				});
			}
			DONE_STATUSES.SUBSCRIBERS_DONE = true;
		}
	}
}

