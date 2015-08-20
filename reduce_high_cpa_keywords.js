function main(){
	// Reduce keyworeds with a cpa greater than $4.00
	var WAY_TOO_HIGH_CPA = 4
	var WAY_TOO_HIGH_BID_REDUCTION = .2

	// Reduce keywords with a cpa greater than $3.00
	var TOO_HIGH_CPA = 3
	var TOO_HIGH_BID_REDUCTION

	var kw_iter = AdWordsApp.keywords()
		.withCondition("Status = ENABLED")
		.withCondition("CampaignStatus =  ENABLED")
		.withCondition("AdGroupStatus =  ENABLED")
		//196131259 = Deals
		//194244979 = Copupons
		//.withIds(196131259,194244979)
		.get();
	while(kw_iter.hasNext()) {
		var kw = kw_iter.next();
		var kw_stats = kw.getStatsFor("LAST_7_DAYS");
		var cost = kw_stats.getCost();
		var conversions = kw_stats.getConversions();
		if(conversions > 0) {
			var cost_per_conversion = (cost/(conversions*1.0));
			// here is the magic. if it is way too high, reduce by way too high amount
			if(cost_per_conversion >= WAY_TOO_HIGH_CPA){
				kw.setMaxCpc(kw.getMaxCpc() * (1 - WAY_TOO_HIGH_BID_REDUCTION));
			}
			//otherwise if it's still too high ,reduceb by the too high amount
			if(cost_per_conversion >= TOO_HIGH_CPA){
				kw.setMaxCpc(kw.getMaxCpc() * (1 - TOO_HIGH_BID_REDUCTION));
			}
		}else{
			//no conversions on this keyword
			//we will deal with this later
			continue;
		}
	}
}