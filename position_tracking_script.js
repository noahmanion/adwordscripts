var spreadsheet_url = "https://docs.google.com/a/bradsdeals.com/spreadsheet/ccc?key=0AmmzwYWImbdldDJfRGFSOGwxNHRPSS0xYnNUdXZMSXc#gid=1"
var email_address = "noah@bradsdeals.com"

function main(){
	var matches = new RegExp('key=([^&#]*)').exec(spreadsheet_url);
	if(!matches || !matches[1]) throw 'Invaild Spreadsheet URL: ' + spreadhsheet_url;
	var spreadsheetId = matches[1];
	var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
	var sheet = spreadsheet.getSheetByName('Input Keywords');
	var sheet_values = sheet.getDataRange().getValues();
	var result_range = new Array(); // Holds the values to write back
	var alert_text = new Array();
	var history = new Array();
	var currentTime = new Date();
	var today = (currentTime.getMonth() + 1) + "/" + currentTime.getDate() + "/" + currentTime.getFullYear();

	for (i = 1; i < sheet_values.length; i++){
		//make sure tehre is some data here
		if(sheet_values[i][0] == "") continue;
		result_range[i] = [today, 0];
		var campaign_name = sheet_values[i][0];
		var adgroup_name = sheet_values[i][1];
		//remove single quotes at the beginning of the keyword
		var keyword_text = sheet_values[i][2];
		var latest_check = sheet_values[i][3];
		var old_position = sheet_values[i][4];

		var keywordIterator = AdWordsApp.keywords()
			.withCondition("CampaignName = '" + campaign_name + "'")
			.withCondition("AdGroupName = '" + adgroup_name + "'")
			//.withCondition("KeywordText = '" + keyword_text + "'")
    		.withCondition("KeywordMatchType IN [PHRASE,EXACT,BROAD]")//keywords of all match types 
      		.get();
      	while(keywordIterator.hasNext()) {
      		var keyword = keywordIterator.next();
      		// since we couldn't filter phrase or exact matches directly, we have to make sure this is the right keyword
      		if(keyword.getText() == keyword_text){
      			var current_position = keyword.getStatsFor("YESTERDAY").getAveragePosition();
      			//save position to results
      			result_range[i][1] = current_position;
      			// for the history we also note whether or not the change or whehter or not this keyword stayed the same.
      			if(old_position > 0) var change = current_position - old_position;
      			else var change = "NEW";
      			var row = [today, campaign_name, adgroup_name, keyword_text, old_position, current_position]
      			history.push(row)
      			//if we have previously tracked quality score
      			if(old_position > 0 && current_position != old_position){
      				alert_text.push(current_position + "\t" + old_position + "\t" + change + "\t" + latest_check + "\t" + keyword_text);
      			}
      			//we've found the keyword we're looking for
      			break;
      		}
      	}
	}
	//write results to spreadsheet
	result_range.splice(0,1);
	sheet.getRange(2, 4, result_range.length, 2).setValues(result_range);
	//write history to spreadsheet
	var history_sheet = spreadsheet.getSheetByName('Position History');
	history_sheet.getRange(history_sheet.getLastRow()+1, 1, history.length, 6).setValues(history);
	//if we made notes for alerts then we send them via email
	if(alert_text.length){
		var message = "The Following position changes were discovered:\nNew\tOld\tChange\tPreviously checked\tKeyword\n"
		for(i = 0; i < alert_text.length; i++) message += alert_text[i] + "\n";
		// also include a link to the spreadhsheet
		message += "\n" + "settings and complete history are available at " + spreadhsheet_url;
		//if we have an email address we sent out a notifiction
		if(email_address && email_address != ""){
			MailApp.sendEmail(email_address, "Adwords Position Changes detected", message);
		}
		//log the message
		Logger.log(message);
	}
}
