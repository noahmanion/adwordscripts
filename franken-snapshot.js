function main() {
	var spreadsheetUrl = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/12Y38mV3-wnfHwnM6YW_L8jHWOGuMBdbq1K2UctBTYrs/edit#gid=0";
	var spreadsheet = SpreadsheetApp.OpenByUrl(spreadsheetUrl);
	var sheet = SpreadsheetApp.OpenByUrl(spreadsheetUrl).getActiveSheet;
	var columns = ['HourOfDay',
					'Date',
					'CampaignName',
					'AdGroupName',
					'Clicks',
					'Impressions',
					'Ctr',
					'AverageCpc',
					'Cost',
					'Conversions',
					'CostPerConversion',
					'ConversionRate'];
	var columns_str = columns.join('\\,') + " ";

	var report = AdwordsApp.report(
		" SELECT " + columns.join(",") +
		" FROM ADGROUP_PERFORMANCE_REPORT" +
		"DURING TODAY")
	var rows = report.rows();
		while (rows.hasNext()) {
  			var row = rows.next();
  			sheet.appendRow([row['HourOfDay'], row['Date'], row['CampaignName'], row['Clicks'], row['Impressions'], 
  				row['Ctr'], row['AverageCpc'], row['Cost'], row['Conversions'], row['CostPerConversion'], row['ConversionRate']);}
  	if (rows.length > 0) {
		var access = new SpreadsheetAccess(spreadsheetUrl, "Report");
		var emptyRow  = access.findEmptyRow(11, 2)
		if (emptyRow < 0){
			access.addRows(rows.length);
			emptyRow = access.findEmptyRow(11, 2);
		}
	access.writeRows(rows, emptyRow, 2);
	var last_check = spreadsheet.getRangeByName('last_check').setValue(yesterday)
	}
}
function SpreadsheetAccess(spreadsheetUrl, sheetName) {
	this.spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
	this.sheet = this.spreadsheet.getSheetByName(sheetName);

	//what columns hsould we be look at to check whether the row is empty?
	this.findEmptyRow = function(minRow, column) {
    var values = this.sheet.getRange(minRow, column, this.sheet.getMaxRows(), 1).getValues();
    for (var i = 0; i < values.length; i ++) {
      if (!values[i][0]) {
        return i + minRow;
      }
    }
    return -1;
  }
	this.addRows = function(howMany) {
		this.sheet.insertRowsAfter(this.sheet.getMaxRows(), howMany);	
	}
	this.writeRows = function(rows, startRow, startColumn) {
		this.sheet.getRange(startRow, startColumn, rows.length, rows[0].length).setValues(rows);
	}
}
