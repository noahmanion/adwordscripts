/*******************************
*Campaign and Keyword Summary Report
* http://www.freeadwordsscripts.com/2013/07/campaign-and-keyword-performance.html
*
*
*
*
*********************************/
var SPREADSHEET_URL = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/1REE2estVFaL0E3x3xWMyWeR3pHwr9VL4P-1_ORnrMi4/edit"

function main(){
	//these names are important. do not change them.
	var tabs = ['camp_perf_7_days','camp_perf_mtd','camp_perf_last_month','keyword_perf_7_days','keyword_perf_7_days_daily'];
	for (var i in tabs) {
		var results = runQuery(tabs[i]);
		writeToSpreadsheet(tabs[i],results);
	}
}

//Helper Function to get or create the spreadsheet
function getSheet(tab) {
	var s_sheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
	var sheet;
	try{
		sheet = s_sheet.getSheetByName(tab);
		if(!sheet) {
			sheet = s_sheet.insertSheet(tab, 0);
		}
	}catch(e) {
		sheet = s_sheet.insertSheet(tab, 0);
	}
	return sheet
}

//functiuon to write rows to the sheet
function writeToSpreadsheet(tab,rows) {
  var to_write = convertRowsToSpreadsheetRows(tab,rows);
  var s_sheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  var sheet = getSheet(tab);
  sheet.clear();
   
  var numRows = sheet.getMaxRows();
  if(numRows < to_write.length) {
    sheet.insertRows(1,to_write.length-numRows); 
  }
  var range = sheet.getRange(1,1,to_write.length,to_write[0].length);
  range.setValues(to_write);
}

//generic function used to build and run the report query
function runQuery(tab) {
  	var API_VERSION = { includeZeroImpressions : false };
  	var cols = getColumns(tab);
  	var report = getReport(tab);
  	var date_range = getDateRange(tab);
	var where = getWhereClause(tab);
  	var query = ['select',cols.join(','),'from',report,where,'during',date_range].join(' ');
  	var report_iter = AdWordsApp.report(query, API_VERSION).rows();
  	var rows = [];
  	while(report_iter.hasNext()) { 
    	rows.push(report_iter.next());
  	}
  	return rows;
}

//This function will convert row data into a format easily pushed into a spreadsheet
function convertRowsToSpreadsheetRows(tab,rows) {
	var cols = getColumns(tab);
	var ret_val = [cols];
	for(var i in rows){
		var r = rows[i];
		var ss_row = [];
		for(var x in cols) {
			ss_row.push(r[cols[x]]);
		}
		ret_val.push(ss_row);
	}
	return ret_val;
}

//Based on tab naame, this returns the report type to use for the query
function getReport(tab) {
  if(tab.indexOf('camp_') == 0) {
    return 'CAMPAIGN_PERFORMANCE_REPORT';
  }
  if(tab.indexOf('keyword_') == 0) {
    return 'KEYWORDS_PERFORMANCE_REPORT';
  }
  throw new Exception('tab name not recognized: '+tab);
}

//based on tab name, return the where clause
function getWhereClause(tab) {
	if(tab.indexOf('camp_') == 0) {
		return 'where CampaignStatus = ENABLED';
	}
	if(tab.indexOf('keyword_') == 0) {
		return 'where CampaignStatus = ENABLED and AdGroupStatus = ENABLED and Status = ENABLED'
	}
	throw new Exception('tab name not recognized: '+tab)
}

//based on tab name, this returns the columns to add into the report
function getColumns(tab) {
	var ret_array = [];
	if(tab.indexOf('daily') >= 0) {
		ret_array.push('Date');
	}
	ret_array.push('CampaignName');
	ret_array.push('CampaignStatus');

	if(tab.indexOf('keyword') == 0) {
		ret_array = ret_array.concat(['AdGroupName',
									'AdGroupStatus',
									'Id',
									'KeywordText',
									'KeywordMatchType']);
	}
	return ret_array.concat(['Clicks',
							'Impressions',
							'Ctr',
							'AverageCpc',
							'Cost',
							'AveragePosition',
							'Conversions',
							'ConversionRate',
							'ConversionValue']);
}

//based on tab name, return the date range for the data
function getDateRange(tab){
	if(tab.indexOf('7_days') >= 0) {
		return 'LAST_7_DAYS';
	}
	if(tab.indexOf('mtd') >= 0) {
		return 'THIS_MONTH';
	}
	if(tab.indexOf('last_month') >= 0) {
		return 'LAST_MONTH';
	}
	throw new Exception('tab name not recognized: '+tab)
}

