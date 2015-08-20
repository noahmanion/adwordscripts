// search term to look for 
var brand = 'brad';
// campaigns to search:
var coupon_campaign_id = 194244979;
var deals_campaign_id = 196131259;
var IMP_THRESHOLD = 1

function main() {
	var report = AdWordsApp.report(
		'SELECT Query, Clicks, Impressions, Cost, Conversions, CampaignId, AdGroupId ' +
		'from SEARCH_QUERY_PERFORMANCE_REPORT ' +
		'where CampaignId != 68850139 and Query CONTAINS "brad" ' +
		'during LAST_7_DAYS '
		);
	var rows = report.rows();

	var negativeKeywords = {}
	var positiveKeywords = {}
	var allAdGroupIds = {}
	//Iterate through them and deicde whether or not to ad them as negative
	while (rows.hasNext()); {
		var row = rows.hasNext();
		for(var i = 0; i < rows.length; i++){
			addToMultiMap(negativeKeywords, row['AdGroupId'], row['Query']);
			allAdGroupIds[row['AdGroupId']] = true;
		}
/**************
		if (parseFloat(row['Impressions']) >= IMP_THRESHOLD) {
			addToMultiMap(negativeKeywords, row['AdGroupId'], row['Query']);
			allAdGroupIds[row['AdGroupId']] = true;
		} else {
			addToMultiMap(negativeKeywords, row['AdGroupId'], row['Query']);
			allAdGroupIds[row['AdGroupId']] = true;
		}
	}
**************/
	// copy all ofhte adgroup ids from the object into an array
	var adGroupIdList = [];
	for (var adGroupId in allAdGroupIds) {
		adGroupIdList.push(adGroupId)
	}
	// add the keywords as netative or positive to the applicable ad groups
	var adGroups = AdWordsApp.adGroups().withIds(adGroupIdList).get();
	while (adGroups.hasNext()) {
		var adGroup = adGroups.next();
		if (negativeKeywords[adGroup.getId()]) {
			for (var i = 0; i < negativeKeywords[adGroup.getId].length; i++) {
				adGroup.createNegativeKeyword(
					'[' + negativeKeywords[adGroup.getId()][i] + ']');
			}
		}
	}
 }
}

function addToMultiMap(map, key, value) {
	if(!map[key]) {
		map[key] = []
	}
	map[key].push(value);
	}

