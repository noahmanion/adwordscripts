/**************************************************
*Out of Stock Checker
*Version 1.0
*Checks Adwords Ad Destination URLs for Expired Deals
*
* http://www.freeadwordsscripts.com/2013/10/disable-ads-and-keywords-for-out-of.html
**************************************************/
var URL_LEVEL = 'Keyword';// or 'Ad'
var ONLY_ACTIVE = true; // set to false for all ads/keywords 
var CAMPAIGN_LABEL = 'Script Test';
var STRIP_QUERY_STRING = true; // false would leave params
var WRAPPED_URLS = false; // we don't need this
//
//
//
var OUT_OF_STOCK_TEXT = 'Expired';

function main(){
	var alreadyCheckedUrls = {};
  var iter = buildSelector().get();
  while(iter.hasNext()) {
    var entity = iter.next();
    var url = cleanUrl(entity.getDestinationUrl());
    if(alreadyCheckedUrls[url]) {
      if(alreadyCheckedUrls[url] === 'out of stock') {
        entity.pause();
      } else {
        entity.enable();
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
			entity.pause();
		} else {
			alreadyCheckedUrls[url] = 'in stock';
			entity.enable();
		}
	}
	Logger.log('Url: '+url+' is '+alreadyCheckedUrls[url]);
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
	var selector = (URL_LEVEL === 'Ad') ? AdwordsApp.ads() : AdWordsApp.keywords();
	selector = selector.withCondition('CampaignStatus != DELETED').withCondition('AdGroupStatus != DELETED');
	if(ONLY_ACTIVE){
		selector = selector.withCondition('CampaignStatus = ENABLED').withCondition('AdGroupStatus = ENABLED');
		if(URL_LEVEL !== 'Ad') {
			selector = selector.withCondition('AdGroupStatus = ENABLED');
		}
	}

		var label = AdWordsApp.labels().withCondition("Name = '"+CAMPAIGN_LABEL+"'").get().next();
		var campIter = label.campaigns().get();
		var CampaignNames = [];
		while(campIter.hasNext()) {
			CampaignNames.push(campIter.next().getName());
		}
		selector = selector.withCondition("CampaignName IN ['"+CampaignNames.join("','")+"']");
	}
	return selector;
}