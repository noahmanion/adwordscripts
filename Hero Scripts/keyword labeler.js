/**********************************
* 
*
*
*
**********************************/
function main() { 
  //spreadsheet access 
  var ssURL = "https://docs.google.com/spreadsheets/d/1jaszPWZ1HEBhwztlESh6n0xb_r_vgsbcQP-X4QstOcU/edit#gid=0"; 
  var spreadsheet = SpreadsheetApp.openByUrl(ssURL); 
  var sheet = spreadsheet.getActiveSheet(); 
  var data = sheet.getRange("A:D").getValues(); 
  
  //Label details. These are fully customizable" 
  //labelName is what you will see in the interface 
  //labelDescription is the details you will see when hovering the cursor over the label 
  //labelColor is the color the label appears in the interface 
  var labelName = "Example Hero Pro"; 
  var labelDescription = "Example Description"; 
  var labelColor = "Red"; 
  //End of set up. 
  
  AdWordsApp.createLabel(labelName, labelDescription, labelColor); 
  
  //select keywords and get IDs 
  var keywordData = {}; 
  for(var i in data){ 
    var kwKey = [data[i][0],data[i][1],data[i][2].trim(),data[i][3].toUpperCase()].join(","); 
    keywordData[kwKey] = data[i]; 
  } 
      
  var keywordIter = AdWordsApp.keywords().withCondition("Status != DELETED").withCondition("CampaignStatus != DELETED").get(); 
    
  while (keywordIter.hasNext()) { 
    var keyword = keywordIter.next(); 
    var keywordText = keyword.getText(); 
    var matchType = keyword.getMatchType().toUpperCase(); 
    var campaign = keyword.getCampaign().getName(); 
    var adGroup = keyword.getAdGroup().getName(); 
    var kwKey = [campaign,adGroup, keywordText, matchType].join(","); 
    if(kwKey in keywordData){ 
      keyword.applyLabel(labelName); 
    } 
  } 
}