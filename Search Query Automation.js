var EXPENSIVE_WORD = "brad"
//var LEAVE_ALONE = "~Branded"
function main() {

	var report = AdWordsApp.report(
		"SELECT Query, KeywordTextMatchingQuery, AdGroupName, Impressions " +
		" FROM SEARCH_QUERY_PERFORMANCE_REPORT " +
		" WHERE Query CONTAINS 'brad' and CampaignName DOES_NOT_CONTAIN '~Branded' " +
		" DURING LAST_7_DAYS " 
		);
	var rows = report.rows();

	var negativeKeywords = {};
	var positiveKeywords = {};
	var allAdGroupIds = {};
// Iterate trhough search query and decide whether to
// add them to negative match
	while(rows.hasNext()){
		var row = rows.next();
		//Logger.log(account.getName() + ': ' + row['Query'] + '; ' + row['KeywordTextMatchingQuery'] + '; '+ row['Impressions'] + ' Impressions')
		if (row['Query'].contains = EXPENSIVE_WORD) {
			addToMultiMap(negativeKeywords, row['AdGroupId'], row['Query']);
			allAdGroupIds[row['AdGroupId']] = true;

		}

	}
// Copy all the adGroupIds from the object into an array
	var  adGroupIdList = [];
	for (var adGroupId in allAdGroupIds) {
		adGroupIdList.push(adGroupId);
	}
// Add the keywords as negative to the applicable ad groups
	var adGroups = AdWordsApp.adGroups().withIds(adGroupIdList).get();
  	while (adGroups.hasNext()) {
    	var adGroup = adGroups.next();
    	if (negativeKeywords[adGroup.getId()]) {
      		for (var i = 0; i < negativeKeywords[adGroup.getId()].length; i++) {
        		adGroup.createNegativeKeyword('[' + negativeKeywords[adGroup.getId()][i] + ']');
			}
		}
	}
}

function addToMultiMap(map, key, value) {
	if(!map[key]) {
		map[key] = [];
	}
	map[key].push(value);
}