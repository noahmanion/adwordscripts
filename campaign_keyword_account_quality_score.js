/*****************************
* Account, Campaign, and AdGroup Level Quality Score
* 
* http://www.freeadwordsscripts.com/2013/04/store-account-campaign-and-adgroup.html
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
* 
*****************************/
var DECIMALS = 2; // this will give you 4 decimal places of accuracy
//your can set this to anything you want in this list
//any of the date ranges
//available in AWQL. not sure if you can use yyyymmdd,yyyymmdd
var DATE_RANGE = 'LAST_MONTH';
//or you can set this to a number of days back, it will override var DATE_RANGE
var LAST_N_DAYS = 14;

var CSV_FILE_PREFIX = "";
var SPREADSHEET_URL = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/1vAckWNv0tXgEuxlQH6CXRs0ldUqRnFe3r_Kwbp6hSxY/edit#gid=0";
var SPREADSHEET_NAME = "";

function main() {
	var isCSV = (CSV_FILE_PREFIX !== "");
	var allData = getKeywordsReport();
	var tabs = ['Account','Campaign','AdGroup','Keyword'];
	for(var i in tabs) {
		var tab = tabs[i];
		var dataToWrite = [];
		var cols = getCols(tab);
		var rowKeys = getRowKeys(tab,Object.keys(allData));
		for(var x in rowKeys) {
			var rowArray = [];
			var key = rowKeys[x];
			var row = allData[key];
			for(var y in cols) {
				rowArray.push(row[cols[y]]);
			}
			dataToWrite.push(rowArray);
		}
		if(isCSV) {
			writeDataToCSV(tab,dataToWrite);
		}else{
			writeDataToSpreadsheet(tab,dataToWrite);
		}
	}
}

function getRowKeys(tab,allKeys) {
	return allKeys.filter(function(e) { return (e.indexOf(tab) >= 0); });
}

function getCols(tab) {
	return {
		'Account' : ['Date','Account','ImpsWeightedQS'],
		'Campaign' : ['Date','Account','Campaign','ImpsWeightedQS'],
		'AdGroup' : ['Date','Account','Campaign','AdGroup','ImpsWeightedQS'],
		'Keyword' : ['Date','Account','Campaign','AdGroup','Keyword','QS','ImpsWeightedQS']
	}[tab];
}

//super fast spreadsheet insertion
function writeDataToSpreadsheet(tab, toWrite) {
	//this is where i am going to store my data
	var spreadsheet;
	if(SPREADSHEET_NAME) {
		var fileIter = DriveApp.getFilesByName(SPREADSHEET_NAME);
		if(fileIter.hasNext()) {
			var file = fileIter.next();
			spreadsheet = SpreadsheetApp.openById(file.getId());
		} else {
			spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME)
		}
	} else if(SPREADSHEET_URL) {
		spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
	} else {
		throw 'You need to set at least one of the SPREADSHEET_URL or SPREADSHEET_NAME variables'
	}
	var sheet = spreadsheet.getSheetByName(tab);
	if(!sheet) {
		sheet = spreadsheet.insertSheet(tab);
		sheet.appendRow(getCols(tab));
	}

	var lastRow = sheet.getLastRow();
	var numRows = sheet.getMaxRows();
	if((numRows - lastRow) < toWrite.length) {
		sheet.insertRowsAfter((lastRow == 0) ? 1 : lastRow,toWrite.length-numRows+lastRow);
	}
	var range = sheet.getRange(lastRow+1,1,toWrite.length,toWrite[0].length);
	range.setValues(toWrite);
}
/*
function writeDataToCSV(tab,toWrite) {
	if(!toWrite) { return; }
	var fileName = CSV_FILE_PREFIX + '_' + tab + '.csv';
	var file;
	var fileIter = DriveApp.getFilesByName(fileName);
	if(fileIter.hasNext()) {
		file = fileIter.next();
	} else {
		file = DriveApp.createFile(fileName, formatCsvRow(getCols(tab)));
	}
	var fileData = file.getBlob().getDataAsString();
	for(var i in toWrite) {
		fileData += formatCsvRow(toWrite[i]);
	}
	file.setContent(fileData)
	return file.getUrl();
}

function formatCsvRow(row) {
	for(var i in row) {
		if(row[i].toString().indexOf('"') == 0){
			row[i] = '""'+row[i]+'""';
		}
		if(row[i].toString().indexOf('+') == 0){
			row[i] = "'"+row[i]+'""';
		}
		if(row[i].toString().indexOf(',') >= 0 &&
			row[i].toString().indexOf('""') != 0)
		{
			row[i] = ('"'+row[i]+'"');
		}
	}
	return row.join(',')+'\n';
}
*/
function getKeywordsReport() {
  var theDate = DATE_RANGE;
  if(LAST_N_DAYS != 0) {
    theDate = getDateDaysAgo(LAST_N_DAYS)+','+getDateDaysAgo(1);
  }
  Logger.log('Using date range: '+theDate);
  var OPTIONS = { includeZeroImpressions : true };
  var cols = ['ExternalCustomerId',
              'CampaignId','CampaignName',
              'AdGroupId','AdGroupName',
              'Id','KeywordText','KeywordMatchType',
              'IsNegative','Impressions', 'QualityScore'];
  var report = 'KEYWORDS_PERFORMANCE_REPORT';
  var query = ['select',cols.join(','),'from',report,
               'where AdNetworkType1 = SEARCH',
               'and CampaignStatus = ENABLED',
               'and AdGroupStatus = ENABLED',
               'and Status = ENABLED',
               'during',theDate].join(' ');
  var results = {};
  var reportIter = AdWordsApp.report(query, OPTIONS).rows();
  while(reportIter.hasNext()) {
    var row = reportIter.next();
    if(row.IsNegative == true || row.IsNegative === 'true') { continue; }
    loadHashEntry('Account:'+row.ExternalCustomerId,row,results);
    loadHashEntry('Campaign:'+row.CampaignId,row,results);
    loadHashEntry('AdGroup:'+[row.CampaignId,row.AdGroupId].join('-'),row,results);
    loadHashEntry('Keyword:'+[row.CampaignId,row.AdGroupId,row.Id].join('-'),row,results);
  }
  var dateStr = Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd');
  for(var i in results) {
    results[i]['Date'] = dateStr;
    results[i]['ImpsWeightedQS'] = (results[i]['totalImps'] === 0) ? 0 : round(results[i]['ImpsWeightedQS']/results[i]['totalImps']);
  }
  return results;
}

function loadHashEntry(key,row,results) {
	if(!results[key]) {
		results[key] = {
			QS : 0,
			ImpsWeightedQS : 0,
			totalImps : 0,
			Account : null,
			Campaign : null,
			AdGroup : null,
			Keyword : null
		};
	}
	results[key].QS = parseFloat(row.QualityScore);
	results[key].ImpsWeightedQS += (parseFloat(row.QualityScore)*parseFloat(row.Impressions));
	results[key].totalImps += parseFloat(row.Impressions);
	results[key].Accoount = row.ExternalCustomerId;
	results[key].Campaign = row.CampaignName;
	results[key].AdGroup = row.AdGroupName;
	results[key].Keyword = (row.KeywordMatchType === 'Exact') ? '['+row.KeywordText+'}' :
							(row.KeywordMatchType === 'Phrase') ? '"'+row.KeywordText+'"' : row.KeywordText;
}

//A helper function to return the number of days ago
function getDateDaysAgo(days) {
	var thePast = new Date();
	thePast.setDate(thePast.getDate() - days);
	return Utilities.formatDate(thePast, AdWordsApp.currentAccount().getTimeZone(), 'yyyyMMdd');
} 

function round(val) {
	var divisor = Math.pow(10,DECIMALS);
	return Math.round(val*divisor)/divisor;
}
