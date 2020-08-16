
////////////////////////////////////////////////////////
// GETTING INTERESTS DATA FROM adssettings.google.com //
////////////////////////////////////////////////////////

// same scope as all the background scripts

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
			// console.log(interests)
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
}
