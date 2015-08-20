/**********************************
* 
*
*
*
**********************************/
function main() {

 AdWordsApp.createLabel("PausedCTR", "ad group paused due to declining CTR", "red");
 AdWordsApp.createLabel("PausedCPA", "ad groups paused due to declining Conversions", "yellow");
 //set your max CPA value. You don't want to pause an ad group with a rising CPA unless that CPA goes over your limit.
 var cpaMax = 0;

 var adGroupsIterator = AdWordsApp.adGroups()
   .withCondition("Clicks > 25")
   .forDateRange("LAST_14_DAYS")
   .get();

 var today = getDateInThePast(0);
 var oneWeekAgo = getDateInThePast(7);
 var twoWeeksAgo = getDateInThePast(14);
 var threeWeeksAgo = getDateInThePast(21);

 while (adGroupsIterator.hasNext()) {
   var adGroup = adGroupsIterator.next();
   // Let's look at the trend of the ad group's CTR.
   var ctr1 = adGroup.getStatsFor(threeWeeksAgo, twoWeeksAgo).getCtr();
   var ctr2 = adGroup.getStatsFor(twoWeeksAgo, oneWeekAgo).getCtr();
   var ctr3 = adGroup.getStatsFor(oneWeekAgo, today).getCtr();
   var cost1 = adGroup.getStatsFor(threeWeeksAgo, twoWeeksAgo).getCost();
   var cost2 = adGroup.getStatsFor(twoWeeksAgo, oneWeekAgo).getCost();
   var cost3 = adGroup.getStatsFor(oneWeekAgo, today).getCost();
   var conversions1 = adGroup.getStatsFor(threeWeeksAgo, twoWeeksAgo).getCost();
   var conversions2 = adGroup.getStatsFor(twoWeeksAgo, oneWeekAgo).getCost();
   var conversions3 = adGroup.getStatsFor(oneWeekAgo, today).getCost();
   var cpa1 = cpa(cost1,conversions1);
   var cpa2 = cpa(cost2, conversions2);
   var cpa3 = cpa(cost3, conversions3);

   // Week over week, the ad group is degrading - pause it!
   if (ctr1 > ctr2 && ctr2 > ctr3) {
     adGroup.pause();
     adGroup.applyLabel('PausedCTR');
    }

   if ((cpa3 > cpaMax) && (cpa1 < cpa2 && cpa2 < cpa3)) {
     adGroup.pause();
     adGroup.applyLabel('PausedCPA');
   }
 }

}

// Returns YYYYMMDD-formatted date.
function getDateInThePast(numDays) {
 var today = new Date();
 today.setDate(today.getDate() - numDays);
 return Utilities.formatDate(today, "PST", "yyyyMMdd");

}

//calculates cost per conversion
function cpa(cost, conversions){
 var costConv = cost/conversions;
 return costConv.toFixed(2);
}