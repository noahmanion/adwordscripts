/*****************************
*Deal Expired Checker
*
*
*
*****************************/
var STRIP_QUERY_STRING = true;
var WRAPPED_URLS = true
var OUT_OF_STOCK_TEXT = 'Expired'
var URL_TO_TEST = 'http://www.bradsdeals.com/deals/macy-s-25-off-north-face-p190412'

function main(){
	var urlToTest = URL_TO_TEST;
	urlToTest = cleanUrl(urlToTest);
	var htmlCode = UrlFetchApp.fetch(urlToTest).getContentText();
	if(htmlCode.indexOf(OUT_OF_STOCK_TEXT) >= 0) {
		Logger.log('The item is out of stock.');
	} else {
		Logger.log('The item is in stock.');	
	}
}
function cleanUrl(url) {
	if(WRAPPED_URLS) {
		url = url.substr(url.lastIndexOf('http'));
		if(decodeURIComponent(url) !== url) {
			url = decodeURIComponent(url);
		}
	}
	if(STRIP_QUERY_STRING) {
		if(url.indexOf('?') >= 0) {
			url = url.split('?')[0];
		}
	}
	if(url.indexOf('{') >= 0) {
		//lets move the value track params
		url = url.replace(/\{[0-9a-zA-Z]+\}/g,'');
	}
	return url;
}