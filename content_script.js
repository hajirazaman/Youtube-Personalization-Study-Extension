// Afaq's code

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
    console.log("EXID: "+ extensionId)
    var NumberOfDaysToGoBack = 1; //change it back to 180

    var G_activity = [];
    var Watch_History = [];
    var Search_History = [];

    while(document.getElementsByClassName("rp10kf").length <= NumberOfDaysToGoBack){
      window.scrollBy(0, 30000);
      console.log("Days: " + document.getElementsByClassName("rp10kf").length)
      // document.getElementsByClassName("mydiv")[0].innerHTML = "Progress: "+ ((document.getElementsByClassName("rp10kf").length/NumberOfDaysToGoBack)*100).toFixed(2).toString() + "% Done.\n  Please Wait!";
      await sleep(800);
    }
    console.log("Doc: "+ document.getElementsByClassName("rp10kf").length)
    // console.log("HTML: "+ document.documentElement.innerHTML)

    for(var i=0;i<document.getElementsByClassName("uUy2re").length;i++){
      console.log(document.getElementsByClassName("uUy2re")[i].innerText)
      G_activity.push(document.getElementsByClassName("uUy2re")[i].innerText + " -HTML-" + document.getElementsByClassName("uUy2re")[i].innerHTML);

      console.log("First Word: "+ i +" "+ document.getElementsByClassName("uUy2re")[i].children[0].innerHTML.split(" ")[0])
      if(document.getElementsByClassName("uUy2re")[i].children[0].innerHTML.split(" ")[0]==="Watched"){
          // console.log("Watched: "+ document.getElementsByClassName("uUy2re")[4].children[0].innerText)
        try{
          linkStart = document.getElementsByClassName("uUy2re")[i].children[0].innerHTML.split("href=\"")[1];
          linkEnd = linkStart.split("\" ")[0];
          Watch_History.push(linkEnd)
        }
        catch(e){
          console.log("Exception in WatchedHistory Parsing: "+ e)
        }
      } else if (document.getElementsByClassName("uUy2re")[i].children[0].innerHTML.split(" ")[0]==="Searched") {
        // console.log("Setched: "+ document.getElementsByClassName("uUy2re")[4].children[0].innerText)
        try{
          var search_start = document.getElementsByClassName("uUy2re")[i].children[0].innerHTML.split(">")[1];
          var search_end = search_start.split("</a>")[0];
          console.log("Searched END: "+search_end.substring(0, search_end.length-3));
          Search_History.push(search_end.substring(0, search_end.length-3))
        }
        catch(e){
          console.log("Exception in SearchHistory Parsing: "+ e)
        }
      }
    }
    ///
    // var filedata = JSON.stringify({ data: document.documentElement.innerHTML, fileName: "fileName" });
    // var save = new File([filedata], "filename.json", { type: "text/json;charset=utf-8" });
    // var postdata = window.URL.createObjectURL(save);
    chrome.runtime.sendMessage(extensionId, { 
      action: "GData",
      gdata: G_activity,
      WH : Watch_History,
      SH : Search_History
    });
    // console.log("postdata: "+ postdata)
    
    // console.log("SMALL: "+ document.getElementsByClassName("KXhB0c YYajNd"))
    ///
    console.log("Gdata sent to extension");
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