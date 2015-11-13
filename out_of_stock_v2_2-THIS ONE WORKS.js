var spreadsheet_url = "SPREADSHEET HERE";
var OUT_OF_STOCK_TEXT = "Expired";
var subject = "!!!!!!!EXPIRED DEALS!!!!!!!!";
var recipient = "EMAIL RECIPEINT HERE";
var results = "There is an out of stock product at: ";




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

