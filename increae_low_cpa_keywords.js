//increase bids cheap conversion keywords
function main(){
	//for keywords with less than $2 CPA, lets move this up by 25%
	var VERY_CHEAP_COST_PER_CONV = 2;
	var VERY_CHEAP_BID_INCREASE_AMOUNT = .25;

	// for keywords with less than $4 CPA, lest move this up by 15%
	var CHEAP_COST_PER_CONV = 4;
	var CHEAP_BID_INCREASE_AMOUNT = .15;

	var kw_iter = AdWordsApp.keywords()
		.withCondition("Status = ENABLED")
		.withCondition("CampaignId IN [196131259, 194244979]")
		.get();
	while(kw_iter.hasNext()) {
		var kw = kw_iter.next();
		var kw_stats = kw.getStatsFor("LAST_7_DAYS");
		var cost = kw_stats.getCost();
		var conversions = kw_stats.getConversions();
		if (conversions > 0) {
			var cost_per_conversion = (cost/(conversions * 1.0));
			if(cost_per_conversion <= VERY_CHEAP_COST_PER_CONV) {
				kw.setMaxCpc(kw.getMaxCpc() * (1 + VERY_CHEAP_BID_INCREASE_AMOUNT));
			}
			else if (cost_per_conversion <= CHEAP_COST_PER_CONV) {
				kw.setMaxCpc(kw.getMaxCpc() * (1 + CHEAP_BID_INCREASE_AMOUNT));
			}

		}else{
		//no conversions
		//we will deal with this later
		continue
		}
	}
}