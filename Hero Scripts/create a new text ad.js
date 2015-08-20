/**********************************
* 
*
*
*
**********************************/
function main() {
 // Replace with a name of an campaign that exists in the account
 var campaignName = "Campaign";

 var adGroupsIterator = AdWordsApp.Campaigns.withCondition("Name = '" + campaignName + "'").adGroups()
   .withCondition("Name = '" + adGroupName + "'")
   .get();

 if (!adGroupsIterator.hasNext()) {
   Logger.log("Ad group '" + adGroupName + "' not found.");
 } else {
   var adGroup = adGroupsIterator.next();

    
adGroup.createTextAd("Ad headline",
     "First Line of description",
     "Second line of description",
     "www.yoursite.com", // display url
     "http://www.yoursite.com" // destination url
   );
 }
}