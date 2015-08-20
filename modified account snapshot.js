function main () {
	var spreadsheetUrl = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/12Y38mV3-wnfHwnM6YW_L8jHWOGuMBdbq1K2UctBTYrs/edit#gid=0";
	var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
	
	//spreadsheet.getRangeByName("account_id").setValue(AdWordsApp.currentAccount)
	var currentAccount = "400-388-9980"
	var yesterday = getYesterday();
	var last_check = spreadsheet.getRangeByName("last_check").getValue();
	// checks every day from last day checked to yesterday inclusive. if there isn't a last day checked
	// it checkes yesterday
	var date;
		if (last_check.length === 0) {
			date = new Date(yesterday);
		} else {
			date = new Date(last_check);
			date.setDate(date.getDate() + 1);
		}
		
	var rows = [];

	while rows.hasNext(date.getTime() <= yesterday.getTime()) {
		var row = getReportRowForDate(date);
		rows.push([row['Date'], row['HourOfDay'], row['CampaignName'], row['AdGroupName'], row['Clicks'], row['Impressions'], 
			row['Ctr'], row['AverageCpc'], row['Cost'], row['Conversions'], row['CostPerConversion'], row['ConversionRate']]);
		date.setDate(date.getDate() + 1);
	}
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
//returns noon in the timezone of the account

function getYesterday() {
	var now = new Date(Utilities.formatDate(new Date(),
			AdWordsApp.currentAccount().getTimeZone(), "MMM dd, yyyy HH:mm:ss"));
	var yesterday = new Date(now.getTime()- 24 * 3600 * 1000)
	yesterday.setHours(12);
	return yesterday;
}

function getReportRowForDate(date) {
	var accountDate = new Date(Utilities.formatDate(new Date(),
			AdWordsApp.currentAccount().getTimeZone(), "MMM dd, yyyy HH:mm:ss"));
	var dateString = Utilities.formatDate(accountDate, "CST", 'yyyyMMdd');
	return getReportRowForDuring(dateString + "," + dateString);
}
function getReportRowForDuring(during) {
  var report = AdWordsApp.report(
      "SELECT HourOfDay, CampaignName, AdGroupName, Clicks, Impressions, Ctr, AverageCpc, Cost, Conversions, CostPerConversion, ConversionRate " +
      "FROM ADGROUP_PERFORMANCE_REPORT " +
      "DURING " + during);
  return report.rows().next();
}

function formatChangeString(newValue, oldValue) {
	var x = newValue.indexOf('%');
	if (x != 1) {
		newValue = newValue.substring(0, x);
		var y = oldValue.indexOf('%');
		oldValue = oldValue.substring(0, y);
	}

	var change = parseFloat(newValue - oldValue).toFixed(2);
	var changeString = change;
	if (x != -1) {
		changeString = change + '%';
	}
	if (change >= 0) {
		return "<span style='color: #38761d; font-size: 8pt'> (+" + changeString + ")</span>";
	} else {
		return "<span style='color: #cc0000; font-size: 8pt'> (+" + changeString + ")</span>";
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
