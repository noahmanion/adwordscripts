/**********************************
* 
*
*
*
**********************************/
function main() { 
  
  var labelName = "No Mobile Ads Present"; 
  var description = "No mobile ads in this ad group"; 
  var color = "yellow"; 
  
  //create the label 
  AdWordsApp.createLabel(labelName, description, color); 
  
  //Enter the name of the campaign you would like to check. 
  //Leave blank if you want to check the whole account. 
  var campaignName = "";

  //Select the adGroups 
  var adSelector = AdWordsApp.adGroups().withCondition("Status = ENABLED").withCondition("CampaignName CONTAINS '" + campaignName + "'").get();

  while(adSelector.hasNext()){ 
    var adGroup = adSelector.next(); 
    var adGroupName = adGroup.getName(); 
    var campaignName = adGroup.getCampaign().getName(); 
    var ads = adGroup.ads().withCondition("Type IN ['MOBILE_AD']").get().totalNumEntities(); 
    if (ads === 0){ 
      Logger.log(campaignName + " " + adGroupName) 
      adGroup.applyLabel(labelName) 
    } 
  } 
}