/********************
*
*http://www.freeadwordsscripts.com/2013/06/ad-creative-test-automation-script.html
*
*
*
*
*
**********************/
//you can use any of the same valus here as you can for metric below
var THRESHOLD = {metric: 'Clicks', value : 100};
var TO = ['noah@bradsdeals.com'];

//Try any of these values for METRIC:
//AverageCpc, AverageCpm, AveragePageviews, AveragePosition, 
//AverageTimeOnSite, BounceRate, Clicks, ConversionRate, 
//Conversions, Cost, Ctr, Impressions
var METRIC = 'Ctr';
var ASC_OR_DESC = 'ASC' // ASC - paise ad with the lowest value, DESC, pause ad with the highest value

function main(){
	//Start by finding what has changed 
	var ad_map = buildCurrentAdMap();
	var prev_ad_map = readMapFromSpreadsheet();
	prev_ad_map = updatePreviousAdMap(prev_ad_map,ad_map);
	writeMapToSpreadsheet(prev_ad_map);

	//Now run through the ad groups to find creative tests
	var ag_iter = AdwordsApp.adGroups().withCondition('CampaignId=196131259').get();
	var paused_ads = [];
	while(ag_iter.hasNext()){
		var ag = ag_iter.next();
		if(!prev_ad_map[ag.getId()]) { continue; }

		//Here is the date range for the test metircs
		var last_touched_str = _getDateString(prev_ad_map[ag.getId()].last_touched, 'yyyMMdd');
		var get_today_str = _getDateString(new Date(), 'yyyMMdd');

		var ag_stats = ag.getStatsFor(last_touched_str, get_today_str);
		if(ag_stats['get'+THRESHOLD.metric]() >= THRESHOLD.value) {
			var ad_iter = ag.ads().withCondition('Status = ENABLED')
								  .forDateRange(last_touched_str, get_today_str)
								  .orderBy(METRIC+" "+ASC_OR_DESC).get();
			var ad = ad_iter.next();
			var metric = ad.getStatsFor(last_touched_str, get_today_str)['get'+METRIC]();
			ad.pause();
			paused_ads.push({a : ad, m : metric});
		}
	}
	sendEmailForPausedAds(paused_ads);
}

// A dunction to send email with an attached reports of ads it has paused
function sendEmailForPausedAds(ads) {
	if(ads.length == 0){ return; }//No ads paused, no email
	var email_body = '"' + ['CampaignName','AdGroupname','Headline','Desc1','Desc2','DisplayUrl',METRIC].join('","') + '"\n';
	for(var i in ads) {
		var ad = ads[i].a;
		var metric = ads[i].m;
		email_body += '"' + [ad.getCampaign().getName(),
							ad.getAdGroup().getName(),
							ad.getHeadline(),
							ad.getDescription1(),
							ad.getDescription2(),
							ad.getDisplayUrl(),
							metric
							].join('","') +
						'"\n';
	}
	var date_str = _getDateString(new Date(), 'yyyy-MM-dd');
	var options = { attachments: [Utilities.newBlob(email_body, 'text/csv', "FinishedTests_"+date_str+'.csv')] }
	var subject = 'Finished Tests - ' + date_str;
	for(var i in TO) {
		MailApp.sendEmail(TO[i], subject, 'See Attached.', options)
	}
}

//Given two lists of ads, this checks to make sure they are the same.
function sameAds(ads1,ads2) {
	for(var i in ads1) {
		if(ads1[i] != ads2[2]) { return false; }
	}
	return true;
}

//This reads the stored data from the spreadsheet
function readMapFromSpreadsheet() {
	var ad_map = {};
	var sheet = SpreadsheetApp.openById(findSpreadsheetId()).getActiveSheet();
	var data = sheet.getRange('A:C').getValues();
	for(var i in data) {
		if(data[i][0] == '') { break; }
		var [ag_id,last_touched,ad_ids] = data[i];
      ad_map[ag_id = { ad_ids : (''+ad_ids).split(','), last_touched : new Date (last_touched) }];
	}
	return ad_map;
}

//This will search for a label containting the spreadsheet id
//if one isn't found, it will create a new one and the label as well
function findSpreadsheetId() {
	var spreadsheet_id = "";
	var label_iter = AdwordsApp.labels().withCondition("Name STARTS_WITH 'history_script:'").get();
	if(label_iter.hasNext()) {
		var label = label_iter.next();
		return label.getName().Split(':')[1];
	} else {
		var sheet = SpreadsheetApp.create('Adgroups History');
		var sheet_id = sheet.getId();
		AdwordsApp.createLabel('history_script:'+sheet_id, 'stores sheet id for adgroup changes script.');
		return sheet_id;
	}
}

//This will store the data from the account into a spreadsheet
function writeMapToSpreadsheet(ad_map) {
	var toWrite = [];
	for (var ag_id in ad_map) {
		var ad_ids = ad_map[ag_id].ad_ids;
		var last_touched = ad_map[ag_id].last_touched;
		toWrite.push([ag_id,last_touched,ad_ids.join(',')]);
	}
	writeToSpreadsheet(toWrite);
}

//Wiret the keyword data to the spreadsheet
function writeToSpreadsheet(toWrite) {
	var sheet = SpreadsheetApp.openById(findSpreadsheetId()).getActiveSheet();
	sheet.clear

	var numRows = sheet.getMaxRows();
	if(numRows < toWrite.length) {
		sheet.insertRows(1,toWrite.length-numRows);
	}
	var range = sheet.getRange(1,1,toWrite.length,toWrite[0].length);
	range.setValues(toWrite)
}

//This builds a map of the ads in teh account so that it is easy to compare
function buildCurrentAdMap() {
	var ad_map = {}; //{ ag_id : { ad_ids : [ ad_id, ... ], last_touched : date } }
	var ad_iter = AdWordsApp.ads().withCondition('Status = ENABLED').get();
	while(ad_iter.hasNext()) {
		var ad = ad_iter.next();
		var ag_id = ad.getAdGroup().getId();
		if(ad_map[ag_id]) {
			ad_map[ag_id].ad_ids.push(ad.getId());
			ad_map[ag_id].ad_ids.sort();
		} else {
			ad_map[ag_id] = { ad_ids : [ad.getId()], last_touched : new Date() };
		}
	}
	return ad_map;
}

//This takes the old ad map and the curreent ad map and returns an
//updated map with all changes
function updatePreviousAdMap(prev_ad_map,ad_map) {
	for(var ag_id in ad_map) {
		var current_ads = ad_Map[ag_id].ad_ids;
		var previous_ads = (prev_ad_map[ag_id]) ? prev_ad_map[ag_id].ad_ids : [];
    if(!sameAds(current_ads,previous_ads)) {
      prev_ad_map[ag_id] = ad_map[ag_id];
    	}
	}
	return prev_ad_map;
}

//Helper function to format the date
function _getDateString(date,format) {
  return Utilities.formatDate(date,AdWordsApp.currentAccount().getTimeZone(),format); 
}
