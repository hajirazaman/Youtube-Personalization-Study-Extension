// Afaq's code

  /////////////////////////////////////////////////////////////////////
 //	COLLECTING WATCH AND SEARCH HISTORY FROM myactivity.google.com  //
/////////////////////////////////////////////////////////////////////

var crawl = '(' + 
  async function() {
    // document.body.style.display = "none"
    
    // document.body.not('mydiv').hide()} ;
    // document.getElementsByClassName('mydiv')[0].scrollIntoView();
    
    // $(document).ready(function () {
    //     $('#body').not("#mydiv").hide();
    // });
    // alert("Please wait till this blank tab closes automatically, then fill the survey and send the downloaded file!\n Press \"OK\" to continue")    
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getAllRegexMatches(regex, data) {
      var matches, output = [];
      while (matches = regex.exec(data)) {
        output.push(matches[1]);
      }
      return output
    }

    console.log("EXID: "+ extensionId)
    var NumberOfDaysToGoBack = 180; //change it back to 180
    var timeOut = 20; //20 minutes to wait
    // console.log("Is it Youtube" + document.getElementsByClassName("F96K3d")[i].children[1].innerHTML)

    var googleActivity = new Object();
    googleActivity.allGoogleActivity = [];
    googleActivity.searchActivity = [];
    googleActivity.youTubeActivity = [];
    // var G_activity = [];
    // var Watch_History = [];
    // var Search_History = [];

    var startTime = new Date();
    while(document.getElementsByClassName("rp10kf").length <= NumberOfDaysToGoBack){
      var endTime = new Date();
      var mins = (endTime.getTime()-startTime.getTime())/1000;
      mins /= 60;
      console.log(mins)
      if (mins > timeOut) {
        break;
      }
      window.scrollBy(0, 30000);
      // console.log(Date().getTime())
      // console.log("Days: " + document.getElementsByClassName("rp10kf").length)
      // document.getElementsByClassName("mydiv")[0].innerHTML = "Progress: "+ ((document.getElementsByClassName("rp10kf").length/NumberOfDaysToGoBack)*100).toFixed(2).toString() + "% Done.\n  Please Wait!";
      await sleep(800);
    }
    console.log("Doc: "+ document.getElementsByClassName("rp10kf").length)
    // console.log("HTML: "+ document.documentElement.innerHTML)

    for(var i=0;i<document.getElementsByClassName("uUy2re").length;i++){
      // console.log(document.getElementsByClassName("uUy2re")[i].innerText)
      // G_activity.push(document.getElementsByClassName("uUy2re")[i].innerText + " -HTML-" + document.getElementsByClassName("uUy2re")[i].innerHTML);
      
      activity_html_dump = document.getElementsByClassName("uUy2re")[i].innerHTML
      activity_html = document.getElementsByClassName("uUy2re")[i].children[0].innerHTML

      try{
        activity_category = document.getElementsByClassName("F96K3d")[i].children[1].innerHTML
        activity_type = activity_html.match(/^(.*?)( ?<a href=|$)/)[1]
        var links_re = /href="(.*?)"/g;
        links = getAllRegexMatches(links_re, activity_html_dump)
        activity_text = activity_html.match(/>(.*?)<\/a>/)
        if (activity_text != null) {
          // console.log(activity_html)
          activity_text = activity_text[1]
        } else {
          activity_text = ""
        }
  
        // console.log(activity_category) //search, youtube
        // console.log("TYPE-"+activity_type+"-") //searched for, visited
        // console.log(activity_text)
        // console.log("ALL LINKS")
        // console.log(links)
  
        allGoogleActivity = {
          "status": "Done",
          "html_dump": activity_html_dump, // always exists
          "activity_category": activity_category, //
          "activity_type": activity_type,
          "activity_text": activity_text,
          "links": links
        }
        if (activity_category=="YouTube"){
          googleActivity.youTubeActivity.push(allGoogleActivity);
        }
        if (activity_category=="Search"){
          googleActivity.searchActivity.push(allGoogleActivity);
        }
        googleActivity.allGoogleActivity.push(allGoogleActivity)
      }
      catch(e){
        allGoogleActivity = {
          "status": "Error",
          "errorMessage":  e,
          "html_dump": activity_html_dump, // always exists
        }
        console.log(e)
        googleActivity.allGoogleActivity.push(allGoogleActivity)
      }
      
    }
    console.log(googleActivity.allGoogleActivity)

    // var filedata = JSON.stringify({ data: document.documentElement.innerHTML, fileName: "fileName" });
    // var save = new File([filedata], "filename.json", { type: "text/json;charset=utf-8" });
    // var postdata = window.URL.createObjectURL(save);
    chrome.runtime.sendMessage(extensionId, { 
      action: "googleActivityData",
      allGoogleActivity: googleActivity.allGoogleActivity,
      youTubeActivity : googleActivity.youTubeActivity,
      searchActivity : googleActivity.searchActivity
    });
    // console.log("postdata: "+ postdata)
    
    // console.log("SMALL: "+ document.getElementsByClassName("KXhB0c YYajNd"))
    ///
    console.log("googleActivityData sent to extension");
    // window.close();
    
} + ')();'
// + "$(document).ready(function()" + "{"+
//     "$(" + "\"div\").not(" + "\".mydiv\").css(\"display\",\"none\")"+
// "})" + ';'
var s = document.createElement('script')
s.textContent =  "var extensionId = " + JSON.stringify(chrome.runtime.id) +";\n"+ crawl;
// var d = document.createElement('div')
// d.innerHTML = "----------LOADING DIV------------"

var elem_body = document.getElementsByTagName('body') [0];
elem_div = document.createElement('div');
elem_div.className = "mydiv"
elem_div.innerHTML = "----------Please wait------------";
  // console.log("Timeout Block")
var css = 'div { visibility: hidden; } .mydiv { visibility: visible !important; position: sticky; top: 0; display : inline-block;margin-bottom: 30%; padding : 15px ; align-sef : center ; top : 20% !important ; left : 40%; height : 40px; border-radius: 5px;}',
head = document.head || document.getElementsByTagName('head')[0],
style = document.createElement('style');
head.appendChild(style);
style.type = 'text/css';
if (style.styleSheet){
  // This is required for IE8 and below.
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}
elem_div.style.backgroundColor = 'grey'; // https://github.com/ReneNyffenegger/about-css/blob/master/javascript/change_style.html
//   elem_div.style.position = "absolute";
//   elem_div.style.width = "50%";
elem_body.insertBefore(elem_div, document.getElementById('pGxpHc'));
(document.head || document.documentElement).appendChild(s)
s.onload = function() {
  s.parentNode.removeChild(s)
} 