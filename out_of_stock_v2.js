/**************************************************
*Out of Stock Checker
*Version 2.0
*Checks URLs from a spreadsheet for expired deals
*
* based on http://www.freeadwordsscripts.com/2013/10/disable-ads-and-keywords-for-out-of.html
**************************************************/
var STRIP_QUERY_STRING = false; // false would leave params
var WRAPPED_URLS = false; // we don't need this
var spreadsheet_url = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/1IkFJkRhg39RNH_z_qVa-E6oN2Ne77E4ULpAszullAxM/edit#gid=2085496681";
var expired = new Array();
var active = new Array();
var OUT_OF_STOCK_TEXT = 'Expired';

function main(){
	var alreadyCheckedUrls = {};

  var iter = buildSelector();
  Logger.log(iter);
  for (var i = 0; i < iter.length; i++) {
    var url = iter[i];
    var urlCean = cleanUrl(url);
    if(alreadyCheckedUrls[urlCean]) {
      if(alreadyCheckedUrls[urlCean] === 'out of stock') {
        url.push(expired);
      } else {
        url.push(avtive);
      }
	} else {
		var htmlCode;
		try {
			htmlCode = UrlFetchApp.fetch(url).getContentText();
		} catch(e) {
			Logger.log('There was an issue checking:'+url+', skipping.');
			continue;
		}
		if(htmlCode.indexOf(OUT_OF_STOCK_TEXT) >= 0){
			alreadyCheckedUrls[url] = 'out of stock';
			url.push(expired);
		} else {
			alreadyCheckedUrls[url] = 'in stock';
			url.push(active);
		}
	}
	Logger.log('Url: '+url+' is '+alreadyCheckedUrls[url]);
	var subject = "!!!!!!EXIPRED DEALS!!!!!!!"
	var results1 = "These URLs are expired: " + expired
	var results2 = "These URLs are still good: " + active
	if (expired) {
		MailApp.sendEmail('noah@bradsdeals.com', subject, results1)
	}

}
function cleanUrl(url) {
	if(WRAPPED_URLS) {
		url = url.substr(url.lastIndexOf('http'));
		if(decodeURIComponent(url) !== url) {
			url = decodeURIComponent(url);
		}
	if(STRIP_QUERY_STRING) {
		if(url.indexOf('?') >=0) {
			url = url.split('?')[0];
		}
	}
	if(url.indexOf('{') >= 0) {
		// lets remove value track params!
		url = url.replace(/\{[0-9a-zA-Z]+\}/g,'');
	}
	return url;
	}
}

function buildSelector() {
	var spreadsheet = SpreadsheetApp.openByUrl(spreadsheet_url);
	var sheet = spreadsheet.getRangeByName('ActiveDAA');
	var selector = new Array();
	var sheet_values = sheet.getValues();
	for (var i = 0; i < sheet_values.length; i++){
		//make sure there is some data here
		if(sheet_values[i][0] == "") continue;
		var selector = sheet_values
	}
	
	// Logger.log(selector);
	return selector;
}}