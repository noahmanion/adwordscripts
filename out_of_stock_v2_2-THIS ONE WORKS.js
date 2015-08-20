var spreadsheet_url = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/1IkFJkRhg39RNH_z_qVa-E6oN2Ne77E4ULpAszullAxM/edit#gid=2085496681";
var OUT_OF_STOCK_TEXT = "Expired";
var subject = "!!!!!!!EXPIRED DEALS!!!!!!!!";
var recipient = "noah@bradsdeals.com";
var results = "There was an expired deal at: ";




function main() {
	var iter = buildSelector();
	for (var i = 0; i < iter.length; i++) {
		var entity = iter[i];
		htmlCode = UrlFetchApp.fetch(entity).getContentText();
		if (htmlCode.indexOf(OUT_OF_STOCK_TEXT) >= 0) {
			MailApp.sendEmail(recipient, subject, results+entity);
		} else {
			Logger.log(entity)
		}
	} 
}

}

function buildSelector() {
	var spreadsheet = SpreadsheetApp.openByUrl(spreadsheet_url);
	var sheet = spreadsheet.getRangeByName('ActiveDAA');
	var selector = new Array();
	var sheet_values = sheet.getValues();
	for (var i = 0; sheet_values.length, i++) {
		if(sheet_values[i][0] == "") {
			continue
			var selector = sheet_values;
		}
			
	}
	return selector;
	Logger.log(selector);

}

