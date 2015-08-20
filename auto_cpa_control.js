/*******************
* Reduce High CPA Keywords
* based on: http://www.freeadwordsscripts.com/2012/11/automating-maintenance-tasks-with.html
* v1.0 makes changes and logs them. no email/text compatibility
*
********************/

function main() {
	//lets get things ready
	var campaign = "196131259"
	//reduce keywords with a cpa > 2.50
	var WAY_TOO_HIGH_CPA = 2.5;;
	var WAY_TOO_HIGH_BID_REDUCTION = .35
	var WAY_TOO_HIGH_CHANGE = [];

	// reduce keywords with a cpa > 1.50
	var TOO_HIGH_CPA = 1.5;
	var TOO_HIGH_BID_RECUCTION = .2;
	var TOO_HIGH_CHANGE = [];

	//get keywords from ~deals
	var kw_iter = AdWordsApp.keywords()
		.withCondition("Status = ENABLED")
		.withCondition("CampaignId = "+campaign)
		.get();
	// get emails ready
	var recipient = "noah@bradsdeals.com";
	var subject = "KW Changes to ~Deals";
	var body = "The following keywords were reduced by 35%: "+WAY_TOO_HIGH_CHANGE+
	" The following keywords were reduced by 25%: "+TOO_HIGH_CHANGE



	while(kw_iter.hasNext()) {
		var kw = kw_iter.next();
		var kw_stats = kw.getStatsFor("LAST_WEEK");
		var cost = kw_stats.getCost();
		var conversions = kw_stats.getConversions();
		var kwText = kw.getText();
		if (conversions > 0) {
			var cost_per_conversion = (cost/(conversions*1));
			// lets do the way too high
			if (cost_per_conversion >= WAY_TOO_HIGH_CPA) {
				kw.setMaxCpc(kw.getMaxCpc() * (1 - WAY_TOO_HIGH_BID_REDUCTION));
				//Logger.log(kwText)
				WAY_TOO_HIGH_CHANGE.push(kwText);
				//Logger.log(WAY_TOO_HIGH_CHANGE)
			}
			else if(cost_per_conversion >= TOO_HIGH_CPA) {
				kw.setMaxCpc(kw.getMaxCpc() * (1 - TOO_HIGH_BID_RECUCTION));
				//Logger.log(kwText)
				TOO_HIGH_CHANGE.push(kwText);
				//Logger.log(TOO_HIGH_CHANGE)
			}
			else {
				//no conversions
				continue;
			}
			Logger.log(WAY_TOO_HIGH_CHANGE);
			Logger.log(TOO_HIGH_CHANGE);
			MailApp.sendEmail(recipient, subject, "These keywords were reduced by 35%: "+WAY_TOO_HIGH_CHANGE)
		}
		/**
		if (WAY_TOO_HIGH_CHANGE > 0 || TOO_HIGH_CHANGE > 0 ) {
			Logger.log(TOO_HIGH_CHANGE)
			Logger.log(WAY_TOO_HIGH_CHANGE)
			//MailApp.sendEmail(recipient, subject, body)

		} else {
			continue
		}
		***/
		
	}
}