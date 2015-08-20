function main(){
	var date_range = 'TODAY';
	var to = ['noah@bradsdeals.com'];
	var spreadsheet_url = "GOOGLE DOCS URL HERE"

	var columns = ['CampaignName',
					'HourOfDay',
					'Clicks',
					'Impressions',
					'Ctr',
					'AverageCpc',
					'Cost',
					'Conversions',
					'CostPerConversion'];
	var columns_str = columns.join('\\,') + " ";

	var sheet = getSpreadsheet(spreadsheet_url).getActiveSheet();
	sheet.appendRow(columns);

	var report_iter = AdwordsApp.report(
		'SELECT ' + columns_str +
		'FROM CAMPAIGN_PERFORMNANCE REPORT ' +
		'DURING ' + date_range).rows();

	while(report_iter.hasNext()) {
		var row = report_iter.next();
		var row_array = [];
		for(var i in columns) {
			row_array.push(row[columns[i]]);
		}
		sheet.appendRow(row_array);
	}
	for(var i in to) {
		MailApp.sendEmail(to[i], "Search Query Report ready", spreadsheet_url);
	}
}
function getSpreadsheet(spreadsheet_url) {
	var matches = new RegExp('key=([^&#}*)').exec(spreadsheet_url);
	if (!matches || !matches[1]) {
		throw 'Invalid spreadsheet URL: ' + spreadsheet_url;
	}
	var spreadsheetId = matches[1];
	return SpreadsheetApp.openById(spreadsheetId);
	
}