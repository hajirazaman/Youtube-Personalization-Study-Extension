//////////////////////////////////////////////////////////
// SEARCHING KEYWORDS ON YOUTUBE AND COLLECTING RESULTS //
//////////////////////////////////////////////////////////

// same scope as all the background scripts

person.searchData = [];

function getSearchData(search_string) {
    person.searchData = []
    console.log(encodeURI(search_string))
    url = "https://www.youtube.com/results?search_query="+encodeURI(search_string)
	const Http = new XMLHttpRequest();
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange= async function (){
    	if(this.readyState == HTTP_READYSTATE_DONE && this.status == HTTP_STATUS_OK){
    		var data = Http.responseText;
            console.log(data)
			try {
                // person.searchData[search_string].push(
    
                // )
				DONE_STATUSES.SEARCHDATA_DONE = true;
			} catch(e) {
				console.log("Exception in parsing Interest Data: "+e)
				person.searchData.push({"FAILURE": data});
			}
    	}
    }
	// downloadFile();
    // console.log(userInterest);
}
