/**********************************
* 
*
*
*
**********************************/
function main() { 
  //spreadsheet access 
  var ssURL = "insert spreadsheet url here"; 
  var spreadsheet = SpreadsheetApp.openByUrl(ssURL); 
  var sheet = spreadsheet.getActiveSheet(); 
  var data = sheet.getRange("A:F").getValues(); 

  //Label details. These are fully customizable 
  //labelName is what you will see in the interface 
  //labelDescription is the details you will see when hovering the cursor over the label 
  //labelColor is the color the label appears in the interface 
  var labelName = "Example Name"; 
  var labelDescription = "Example Description"; 
  var labelColor = "Red"; 

  AdWordsApp.createLabel(labelName, labelDescription, labelColor); 

  //select keywords and get IDs 
  var adData = {}; 
  for(var i in data){ 
    var adKey = [data[i][0],data[i][1],data[i][2],data[i][3],data[i][4],data[i][5]].join(","); 
    adData[adKey] = data[i]; 
    
  }

  //Are your ads paused or enabled? Using this setting makes the script run more quickly. 
  //Use "PAUSED" or "ENABLED". The default is "ENABLED" 
  var adIter = AdWordsApp.ads().withCondition("Status = ENABLED").get(); 
  //End of set up. 

  while (adIter.hasNext()) { 
    var ad = adIter.next(); 
    var adGroup = ad.getAdGroup().getName(); 
    var campName = ad.getCampaign().getName(); 
    var adHead = ad.getHeadline(); 
    var adD1 = ad.getDescription1(); 
    var adD2 = ad.getDescription2(); 
    var adDisp = ad.getDisplayUrl(); 
  
    var adKey = [campName, adGroup, adHead,adD1, adD2,adDisp].join(","); 
    if(adKey in adData){ 
      ad.applyLabel(labelName); 
  
    } 
  } 
}