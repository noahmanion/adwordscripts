/**********************************
* 
*
*
*
**********************************/
var ARGUMENTS = {
 sourceCampaign: "Campaign Name",
 targetCampaign: "New Campaign Name",
};

function main() {
 createLabel();
 verifyArguments();
 var sourceCampaign = AdWordsApp.campaigns()
   .withCondition("Name='" + escape(ARGUMENTS.sourceCampaign) + "'")
   .get().next();
 var targetCampaign = AdWordsApp.campaigns()
   .withCondition("Name='" + escape(ARGUMENTS.targetCampaign) + "'")
   .get().next();

 copyAdGroups(sourceCampaign, targetCampaign);
 copyNegativeKeywords(sourceCampaign, targetCampaign);
}

function copyAdGroups(sourceCampaign, targetCampaign) {
 var sourceAdGroups = sourceCampaign.adGroups().withCondition("LabelNames CONTAINS_ANY ['Copy']").get();

 while (sourceAdGroups.hasNext()) {
   var sourceAdGroup = sourceAdGroups.next();
 var status = "ENABLED";
 var targetAdGroup = targetCampaign.newAdGroupBuilder()
   .withName(sourceAdGroup.getName() + "")
  &nsp;.withStatus(status)
   .withKeywordMaxCpc(sourceAdGroup.getKeywordMaxCpc())
   .create();
 copyKeywords(sourceAdGroup, targetAdGroup);
 copyTextAds(sourceAdGroup, targetAdGroup);
 copyNegativeKeywords(sourceAdGroup, targetAdGroup);
 sourceAdGroup.removeLabel('Copy');
 sourceAdGroup.applyLabel('Copied');
 }
}

function createAdGroup(sourceAdGroup) {
 var targetCampaign = AdWordsApp.campaigns()
   .withCondition("CampaignName = '" + escape(ARGUMENTS.targetCampaign) + "'")
   .get().next();
 var status = ARGUMENTS.createPaused ? "PAUSED" : "ENABLED";
 return targetCampaign.newAdGroupBuilder()
   .withName(ARGUMENTS.targetAdGroup)
   .withKeywordMaxCpc(sourceAdGroup.getKeywordMaxCpc())
   .withStatus(status)
   .create();
}

function copyKeywords(sourceAdGroup, targetAdGroup) {
 var keywordsIterator = sourceAdGroup.keywords().get();

 while (keywordsIterator.hasNext()) {
   var sourceKeyword = keywordsIterator.next();
   if (sourceKeyword.getMaxCpc() == sourceAdGroup.getKeywordMaxCpc()) {
     targetAdGroup.createKeyword(sourceKeyword.getText(), null, sourceKeyword.getDestinationUrl());
   } else {
     targetAdGroup.createKeyword(sourceKeyword.getText(), sourceKeyword.getMaxCpc(), sourceKeyword.getDestinationUrl());
   }
 }
}

function copyTextAds(sourceAdGroup, targetAdGroup) {
   var adsIterator = sourceAdGroup.ads().withCondition("Type = 'TEXT_AD'").get();

   while (adsIterator.hasNext()) {
   var sourceAd = adsIterator.next();
   if (sourceAd.isMobilePreferred()) {
     targetAdGroup.createTextAd(
       sourceAd.getHeadline(), 
       sourceAd.getDescription1(), 
       sourceAd.getDescription2(), 
       sourceAd.getDisplayUrl(), 
       sourceAd.getDestinationUrl(), 
       {isMobilePreferred: true});
   } else {
     targetAdGroup.createTextAd(
       sourceAd.getHeadline(), 
       sourceAd.getDescription1(), 
       sourceAd.getDescription2(), 
       sourceAd.getDisplayUrl(), 
       sourceAd.getDestinationUrl());
   }
 }
}

function copyNegativeKeywords(source, target) {
 var negativesIterator = source.negativeKeywords().get();

 while (negativesIterator.hasNext()) {
   var sourceNegative = negativesIterator.next();
   target.createNegativeKeyword(sourceNegative.getText());
 }
}

function verifyArguments() {
 var errors = [];
 if (verifyRequiredString("sourceCampaign", errors)) {
   if (!AdWordsApp.campaigns()
     .withCondition("Name = '" + escape(ARGUMENTS.sourceCampaign) + "'")
     .get().hasNext()) {
     errors.push("Source campaign " + ARGUMENTS.sourceCampaign + " doesn't exist");
   }
 }
 if (verifyRequiredString("targetCampaign", errors)) {
   if (!AdWordsApp.campaigns().withCondition("Name = '" + escape(ARGUMENTS.targetCampaign) + "'").get().hasNext()) {
     errors.push("Target campaign " + ARGUMENTS.targetCampaign + " doesn't exist");
   }
 }
 if (errors.length > 0) {
   Logger.log("" + errors.join(" 
"));
   throw "Cannot copy the ad group: ARGUMENTS are malformed. Please fix the arguments and try again.";
 }
}

function verifyRequiredString(str, errors) {
 if (!ARGUMENTS[str] || ARGUMENTS[str].length == 0) {
   errors.push("ARGUMENTS." + str + " must be specified");
   return false;
 }
 return true;
}

function escape(name) {
 return name.replace(/'/g,"\'");
}

function createLabel(){
 AdWordsApp.createLabel('Copy', 'Select Ad Groups to Copy', 'green');
 AdWordsApp.createLabel('Copied', 'Marks all ad groups that have been copied', 'blue');
}