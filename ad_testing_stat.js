/*********************************************
* Automated Creative Testing With Statistical Significance
* Version 2.0
* Changelog v2.0
*   - Fixed bug in setting the correct date
*   - Script now uses a minimum visitors threshold 
*        per Ad instead of AdGroup
*   - Added the ability to add the start date as a label to AdGroups
*   - Added ability to check mobile and desktop ads separately
* Changelog v1.1.1 - Fixed bug with getDisplayUrl
* Changelog v1.1 
*   - Added ability to only run on some campaigns
*   - Fixed bug in info logging
* Russ Savage
* FreeAdWordsScripts.com
**********************************************/
var EXTRA_LOGS = true;
var TO = ['user@email.com'];
var CONFIDENCE_LEVEL = 95; // 90%, 95%, or 99% are most common
  
//If you only want to run on some campaigns, apply a label to them
//and put the name of the label here.  Leave blank to run on all campaigns.
var CAMPAIGN_LABEL = '';
  
//These two metrics are the components that make up the metric you
//want to compare. For example, this measures CTR = Clicks/Impressions
//Other examples might be:
// Cost Per Conv = Cost/Conversions
// Conversion Rate = Conversions/Clicks

// Cost Per Click = Cost/Clicks
var VISITORS_METRIC = 'Impressions';
var CONVERSIONS_METRIC = 'Clicks';
//This is the number of impressions the Ad needs to have in order
//to start measuring the results of a test.
var VISITORS_THRESHOLD = 100;
 
//Setting this to true to enable the script to check mobile ads
//against other mobile ads only. Enabling this will start new tests
//in all your AdGroups so only enable this after you have completed
//a testing cycle.
var ENABLE_MOBILE_AD_TESTING = false;
 
//Set this on the first run which should be the approximate last time
//you started a new creative test. After the first run, this setting
//will be ignored.
var OVERRIDE_LAST_TOUCHED_DATE = 'Jan 1, 2014';
  
var LOSER_LABEL = 'Loser '+CONFIDENCE_LEVEL+'% Confidence';
var CHAMPION_LABEL = 'Current Champion';
 
// Set this to true and the script will apply a label to 
// each AdGroup to let you know the date the test started
// This helps you validate the results of the script.
var APPLY_TEST_START_DATE_LABELS = true;
  
//These come from the url when you are logged into AdWords
//Set these if you want your emails to link directly to the AdGroup
var __c = '';
var __u = '';
  
function main() {
  createLabelIfNeeded(LOSER_LABEL,"#FF00FF"); //Set the colors of the labels here
  createLabelIfNeeded(CHAMPION_LABEL,"#0000FF"); //Set the colors of the labels here
    
  //Let's find all the AdGroups that have new tests starting
  var currentAdMap = getCurrentAdsSnapshot();
  var previousAdMap = getPreviousAdsSnapshot();
  if(previousAdMap) {
    currentAdMap = updateCurrentAdMap(currentAdMap,previousAdMap);
  }
  storeAdsSnapshot(currentAdMap);
  previousAdMap = null;
    
  //Now run through the AdGroups to find tests
   var agSelector = AdWordsApp.adGroups()
    .withCondition('CampaignStatus = ENABLED')
    .withCondition('AdGroupStatus = ENABLED')
    .withCondition('Status = ENABLED');
  if(CAMPAIGN_LABEL !== '') {
    var campNames = getCampaignNames();
    agSelector = agSelector.withCondition("CampaignName IN ['"+campNames.join("','")+"']");
  }
  var agIter = agSelector.get();
  var todayDate = getDateString(new Date(),'yyyyMMdd');
  var touchedAdGroups = [];
  var finishedEarly = false;
  while(agIter.hasNext()) {
    var ag = agIter.next();
 
    var numLoops = (ENABLE_MOBILE_AD_TESTING) ? 2 : 1;
    for(var loopNum = 0; loopNum < numLoops; loopNum++) {
      var isMobile = (loopNum == 1);
      var rowKey;
      if(isMobile) {
        info('Checking Mobile Ads in AdGroup: "'+ag.getName()+'"');
        rowKey = [ag.getCampaign().getId(),ag.getId(),'Mobile'].join('-');
      } else {
        info('Checking Ads in AdGroup: "'+ag.getName()+'"');
        rowKey = [ag.getCampaign().getId(),ag.getId()].join('-');
      }
 
      if(!currentAdMap[rowKey]) {  //This shouldn't happen
        warn('Could not find AdGroup: '+ag.getName()+' in current ad map.');
        continue; 
      }
       
      if(APPLY_TEST_START_DATE_LABELS) {
        var dateLabel;
        if(isMobile) {
          dateLabel = 'Mobile Tests Started: '+getDateString(currentAdMap[rowKey].lastTouched,'yyyy-MM-dd');
        } else {
          dateLabel = 'Tests Started: '+getDateString(currentAdMap[rowKey].lastTouched,'yyyy-MM-dd');
        }
 
        createLabelIfNeeded(dateLabel,"#8A2BE2");
        //remove old start date
        var labelIter = ag.labels().withCondition("Name STARTS_WITH '"+dateLabel.split(':')[0]+"'")
                                   .withCondition("Name != '"+dateLabel+"'").get();
        while(labelIter.hasNext()) {
          var label = labelIter.next();
          ag.removeLabel(label.getName());
          if(!label.adGroups().get().hasNext()) {
            //if there are no more entities with that label, delete it.
            label.remove();
          }
        }
        applyLabel(ag,dateLabel);
      }
           
      //Here is the date range for the test metrics
      var lastTouchedDate = getDateString(currentAdMap[rowKey].lastTouched,'yyyyMMdd');
      info('Last Touched Date: '+lastTouchedDate+' Todays Date: '+ todayDate);
      if(lastTouchedDate === todayDate) {
        //Special case where the AdGroup was updated today which means a new test has started.
        //Remove the old labels, but keep the champion as the control for the next test
        info('New test is starting in AdGroup: '+ag.getName());
        removeLoserLabelsFromAds(ag,isMobile);
        continue;
      }
       
      //Is there a previous winner? if so we should use it as the control.
      var controlAd = checkForPreviousWinner(ag,isMobile);
       
      //Here we order by the Visitors metric and use that as a control if we don't have one
      var adSelector = ag.ads().withCondition('Status = ENABLED').withCondition('AdType = TEXT_AD');
      if(!AdWordsApp.getExecutionInfo().isPreview()) {
        adSelector = adSelector.withCondition("LabelNames CONTAINS_NONE ['"+[LOSER_LABEL,CHAMPION_LABEL].join("','")+"']");
      }
      var adIter = adSelector.forDateRange(lastTouchedDate, todayDate)
                             .orderBy(VISITORS_METRIC+" DESC")
                             .get();
      if( (controlAd == null && adIter.totalNumEntities() < 2) ||
          (controlAd != null && adIter.totalNumEntities() < 1) )
      { 
        info('AdGroup did not have enough eligible Ads. Had: '+adIter.totalNumEntities()+', Needed at least 2'); 
        continue; 
      }
       
      if(!controlAd) {
        info('No control set for AdGroup. Setting one.');
        while(adIter.hasNext()) {
          var ad = adIter.next();
          if(shouldSkip(isMobile,ad)) { continue; }
          controlAd = ad;
          break;
        }
        if(!controlAd) {
          continue;
        }
        applyLabel(controlAd,CHAMPION_LABEL);
      }
       
      while(adIter.hasNext()) {
        var testAd = adIter.next();
        if(shouldSkip(isMobile,testAd)) { continue; }
        //The Test object does all the heavy lifting for us.
        var test = new Test(controlAd,testAd,
                            CONFIDENCE_LEVEL,
                            lastTouchedDate,todayDate,
                            VISITORS_METRIC,CONVERSIONS_METRIC);
        info('Control - Visitors: '+test.getControlVisitors()+' Conversions: '+test.getControlConversions());
        info('Test    - Visitors: '+test.getTestVisitors()+' Conversions: '+test.getTestConversions());
        info('P-Value: '+test.getPValue());
         
        if(test.getControlVisitors() < VISITORS_THRESHOLD ||
           test.getTestVisitors() < VISITORS_THRESHOLD)
        {
          info('Not enough visitors in the control or test ad.  Skipping.');
          continue;
        }
         
        //Check for significance
        if(test.isSignificant()) {
          var loser = test.getLoser();
          removeLabel(loser,CHAMPION_LABEL); //Champion has been dethroned
          applyLabel(loser,LOSER_LABEL);
           
          //The winner is the new control. Could be the same as the old one.
          controlAd = test.getWinner();
          applyLabel(controlAd,CHAMPION_LABEL);
           
          //We store some metrics for a nice email later
          if(!ag['touchCount']) {
            ag['touchCount'] = 0;
            touchedAdGroups.push(ag);
          }
          ag['touchCount']++;
        }
      }
       
      //Let's bail if we run out of time so we can send the emails.
      if((!AdWordsApp.getExecutionInfo().isPreview() && AdWordsApp.getExecutionInfo().getRemainingTime() < 60) ||
         ( AdWordsApp.getExecutionInfo().isPreview() && AdWordsApp.getExecutionInfo().getRemainingTime() < 10) )
      {
        finishedEarly = true;
        break;
      }
    }
  }
  if(touchedAdGroups.length > 0) {
    sendMailForTouchedAdGroups(touchedAdGroups,finishedEarly);
  }
  beacon();
}
  
// A helper function to return the list of campaign ids with a label for filtering 
function getCampaignNames() {
  var campNames = [];
  var labelIter = AdWordsApp.labels().withCondition("Name = '"+CAMPAIGN_LABEL+"'").get();
  if(labelIter.hasNext()) {
    var label = labelIter.next();
    var campIter = label.campaigns().get();
    while(campIter.hasNext()) {
      campNames.push(campIter.next().getName()); 
    }
  }
  return campNames;
}
  
function applyLabel(entity,label) {
  if(!AdWordsApp.getExecutionInfo().isPreview()) {
    entity.applyLabel(label);
  } else {
    var adText = (entity.getEntityType() === 'Ad') ? [entity.getHeadline(),entity.getDescription1(),
                                                      entity.getDescription2(),entity.getDisplayUrl()].join(' ') 
                                                   : entity.getName();
    Logger.log('PREVIEW: Would have applied label: '+label+' to Entity: '+ adText);
  }
}
  
function removeLabel(ad,label) {
  if(!AdWordsApp.getExecutionInfo().isPreview()) {
    ad.removeLabel(label);
  } else {
    var adText = [ad.getHeadline(),ad.getDescription1(),ad.getDescription2(),ad.getDisplayUrl()].join(' ');
    Logger.log('PREVIEW: Would have removed label: '+label+' from Ad: '+ adText);
  }
}
  
// This function checks if the AdGroup has an Ad with a Champion Label
// If so, the new test should use that as the control.
function checkForPreviousWinner(ag,isMobile) {
  var adSelector = ag.ads().withCondition('Status = ENABLED')
                           .withCondition('AdType = TEXT_AD');
  if(!AdWordsApp.getExecutionInfo().isPreview()) {
    adSelector = adSelector.withCondition("LabelNames CONTAINS_ANY ['"+CHAMPION_LABEL+"']");
  }
  var adIter = adSelector.get();
  while(adIter.hasNext()) {
    var ad = adIter.next();
    if(shouldSkip(isMobile,ad)) { continue; }
    info('Found a previous winner. Using it as the control.');
    return ad;
  }
  return null;
}
 
function shouldSkip(isMobile,ad) {
  if(isMobile) {
    if(!ad.isMobilePreferred()) {
      return true;
    }
  } else {
    if(ad.isMobilePreferred()) {
      return true;
    }
  }
  return false;
}
  
// This function sends the email to the people in the TO array.
// If the script finishes early, it adds a notice to the email.
function sendMailForTouchedAdGroups(ags,finishedEarly) {
  var htmlBody = '<html><head></head><body>';
  if(finishedEarly) {
    htmlBody += 'The script was not able to check all AdGroups. ' +
                'It will check additional AdGroups on the next run.<br / >' ;
  }
  htmlBody += 'The following AdGroups have one or more creative tests that have finished.' ;
  htmlBody += buildHtmlTable(ags);
  htmlBody += '<p><small>Generated by <a href="http://www.freeadwordsscripts.com">FreeAdWordsScripts.com</a></small></p>' ;
  htmlBody += '</body></html>';
  var options = { 
    htmlBody : htmlBody,
  };
  var subject = ags.length + ' Creative Test(s) Completed - ' + 
    Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd');
  for(var i in TO) {
    MailApp.sendEmail(TO[i], subject, ags.length+' AdGroup(s) have creative tests that have finished.', options);
  }
}
 
// This function uses my HTMLTable object to build the styled html table for the email.
function buildHtmlTable(ags) {
  var table = new HTMLTable();
  //CSS from: http://coding.smashingmagazine.com/2008/08/13/top-10-css-table-designs/
  //Inlined using: http://inlinestyler.torchboxapps.com/
  table.setTableStyle(['font-family: "Lucida Sans Unicode","Lucida Grande",Sans-Serif;',
                       'font-size: 12px;',
                       'background: #fff;',
                       'margin: 45px;',
                       'width: 480px;',
                       'border-collapse: collapse;',
                       'text-align: left'].join(''));
  table.setHeaderStyle(['font-size: 14px;',
                        'font-weight: normal;',
                        'color: #039;',
                        'padding: 10px 8px;',
                        'border-bottom: 2px solid #6678b1'].join(''));
  table.setCellStyle(['border-bottom: 1px solid #ccc;',
                      'padding: 4px 6px'].join(''));
  table.addHeaderColumn('#');
  table.addHeaderColumn('Campaign Name');
  table.addHeaderColumn('AdGroup Name');
  table.addHeaderColumn('Tests Completed');
  for(var i in ags) {
    table.newRow();
    table.addCell(table.getRowCount());
    var campName = ags[i].getCampaign().getName();
    var name = ags[i].getName();
    var touchCount = ags[i]['touchCount'];
    var campLink, agLink;
    if(__c !== '' && __u !== '') { // You should really set these.
      campLink = getUrl(ags[i].getCampaign(),'Ad groups');
      agLink = getUrl(ags[i],'Ads');
      table.addCell(a(campLink,campName));
      table.addCell(a(agLink,name));
    } else {
      table.addCell(campName);
      table.addCell(name);
    }
    table.addCell(touchCount,'text-align: right');
  }
  return table.toString();
}
 
// Just a helper to build the html for a link.
function a(link,val) {
  return '<a href="'+link+'">'+val+'</a>';
}
  
// This function finds all the previous losers and removes their label.
// It is used when the script detects a change in the AdGroup and needs to 
// start a new test.
function removeLoserLabelsFromAds(ag,isMobile) {
  var adSelector = ag.ads().withCondition('Status = ENABLED');
  if(!AdWordsApp.getExecutionInfo().isPreview()) {
    adSelector = adSelector.withCondition("LabelNames CONTAINS_ANY ['"+LOSER_LABEL+"']");
  }
  var adIter = adSelector.get();
  while(adIter.hasNext()) {
    var ad = adIter.next();
    if(shouldSkip(isMobile,ad)) { continue; }
    removeLabel(ad,LOSER_LABEL);
  }
}
  
// A helper function to create a new label if it doesn't exist in the account.
function createLabelIfNeeded(name,color) {
  if(!AdWordsApp.labels().withCondition("Name = '"+name+"'").get().hasNext()) {
    info('Creating label: "'+name+'"');
    AdWordsApp.createLabel(name,"",color);
  } else {
    info('Label: "'+name+'" already exists.');
  }
}
  
// This function compares the previous and current Ad maps and
// updates the current map with the date that the AdGroup was last touched.
// If OVERRIDE_LAST_TOUCHED_DATE is set and there is no previous data for the 
// AdGroup, it uses that as the last touched date.
function updateCurrentAdMap(current,previous) {
  info('Updating the current Ads map using historical snapshot.');
  for(var rowKey in current) {
    var currentAds = current[rowKey].adIds;
    var previousAds = (previous[rowKey]) ? previous[rowKey].adIds : [];
    if(currentAds.join('-') === previousAds.join('-')) {
      current[rowKey].lastTouched = previous[rowKey].lastTouched;
    }
    if(previousAds.length === 0 && OVERRIDE_LAST_TOUCHED_DATE !== '') {
      current[rowKey].lastTouched = new Date(OVERRIDE_LAST_TOUCHED_DATE);
    }
    //if we make it here without going into the above if statements
    //then the adgroup has changed and we should keep the new date
  }
  info('Finished updating the current Ad map.');
  return current;
}
  
// This stores the Ad map snapshot to a file so it can be used for the next run.
// The data is stored as a JSON string for easy reading later.
function storeAdsSnapshot(data) {
  info('Storing the Ads snapshot to Google Drive.');
  var fileName = getSnapshotFilename();
  var file = DriveApp.getFilesByName(fileName).next();
  file.setContent(Utilities.jsonStringify(data));
  info('Finished.');
}
  
// This reads the JSON formatted previous snapshot from a file on GDrive
// If the file doesn't exist, it creates a new one and returns an empty map.
function getPreviousAdsSnapshot() {
  info('Loading the previous Ads snapshot from Google Drive.');
  var fileName = getSnapshotFilename();
  var fileIter = DriveApp.getFilesByName(fileName);
  if(fileIter.hasNext()) {
    return Utilities.jsonParse(fileIter.next().getBlob().getDataAsString());
  } else {
    DriveApp.createFile(fileName, '');
    return {};
  }
}
  
// A helper function to build the filename for the snapshot.
function getSnapshotFilename() {
  var accountId = AdWordsApp.currentAccount().getCustomerId();
  return (accountId + ' Ad Testing Script Snapshot.json');
}
  
// This function pulls the Ad Performance Report which is the fastest
// way to build a snapshot of the current ads in the account.
// This only pulls in active text ads.
function getCurrentAdsSnapshot() {
  info('Running Ad Performance Report to get current Ads snapshot.');
  var OPTIONS = { includeZeroImpressions : true };
  var cols = ['CampaignId','AdGroupId','Id','DevicePreference','Impressions'];
  var report = 'AD_PERFORMANCE_REPORT';
  var query = ['select',cols.join(','),'from',report,
               'where AdType = TEXT_AD',
               'and AdNetworkType1 = SEARCH',
               'and CampaignStatus = ACTIVE',
               'and AdGroupStatus = ENABLED',
               'and Status = ENABLED',
               'during','TODAY'].join(' ');
  var results = {}; // { campId-agId : row, ... }
  var reportIter = AdWordsApp.report(query, OPTIONS).rows();
  while(reportIter.hasNext()) {
    var row = reportIter.next();
    var rowKey = [row.CampaignId,row.AdGroupId].join('-');
    if(ENABLE_MOBILE_AD_TESTING && row.DevicePreference == 30001) {
      rowKey += '-Mobile';
    }
    if(!results[rowKey]) {
      results[rowKey] = { adIds : [], lastTouched : new Date() };
    }
    results[rowKey].adIds.push(row.Id);
  }
  for(var i in results) {
    results[i].adIds.sort();
  }
  info('Finished building the current Ad map.');
  return results;
}
  
//Helper function to format the date
function getDateString(date,format) {
  return Utilities.formatDate(new Date(date),AdWordsApp.currentAccount().getTimeZone(),format); 
}
  
// Function to build out the urls for deeplinking into the AdWords account.
// For this to work, you need to have __c and __u filled in.
// Taken from: http://www.freeadwordsscripts.com/2013/11/building-entity-deep-links-with-adwords.html
function getUrl(entity,tab) {
  var customerId = __c;
  var effectiveUserId = __u;
  var decodedTab = getTab(tab);  
     
  var base = 'https://adwords.google.com/cm/CampaignMgmt?';
  var url = base+'__c='+customerId+'&__u='+effectiveUserId+'#';
    
  if(typeof entity['getEntityType'] === 'undefined') {
    return url+'r.ONLINE.di&app=cm';
  }
    
  var type = entity.getEntityType()
  if(type === 'Campaign') {
    return url+'c.'+entity.getId()+'.'+decodedTab+'&app=cm';
  }
  if(type === 'AdGroup') {
    return url+'a.'+entity.getId()+'_'+entity.getCampaign().getId()+'.'+decodedTab+'&app=cm';
  }
  if(type === 'Keyword') {
    return url+'a.'+entity.getAdGroup().getId()+'_'+entity.getCampaign().getId()+'.key&app=cm';
  }
  if(type === 'Ad') {
    return url+'a.'+entity.getAdGroup().getId()+'_'+entity.getCampaign().getId()+'.create&app=cm';
  }
  return url+'r.ONLINE.di&app=cm';
     
  function getTab(tab) {
    var mapping = {
      'Ad groups':'ag','Settings:All settings':'st_sum',
      'Settings:Locations':'st_loc','Settings:Ad schedule':'st_as',
      'Settings:Devices':'st_p','Ads':'create',
      'Keywords':'key','Audiences':'au','Ad extensions':'ae',
      'Auto targets':'at','Dimensions' : 'di'
    };
    if(mapping[tab]) { return mapping[tab]; }
    return 'key'; //default to keyword tab
  }
}
  
// Helper function to print info logs
function info(msg) {
  if(EXTRA_LOGS) {
    Logger.log('INFO: '+msg);
  }
}
  
// Helper function to print more serious warnings
function warn(msg) {
  Logger.log('WARNING: '+msg);
}
  
/********************************
* Track Script Runs in Google Analytics
* Created By: Russ Savage
* FreeAdWordsScripts.com
********************************/
function beacon() {
  var TAG_ID = 'UA-40187672-2';
  var CAMPAIGN_SOURCE = 'adwords';
  var CAMPAIGN_MEDIUM = 'scripts';
  var CAMPAIGN_NAME = 'AdTestingScriptV2_0';
  var HOSTNAME = 'www.freeadwordsscripts.com';
  var PAGE = '/Ad_Testing_Script_v2_0';
  if(AdWordsApp.getExecutionInfo().isPreview()) {
    PAGE += '/preview';
  }
  var DOMAIN_LINK = 'http://'+HOSTNAME+PAGE;
   
  //Pulled from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
    function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
     
  var url = 'http://www.google-analytics.com/collect?';
  var payload = {
    'v':1,'tid':TAG_ID,'cid':uuid,    
    't':'pageview','cs':CAMPAIGN_SOURCE,'cm':CAMPAIGN_MEDIUM,'cn':CAMPAIGN_NAME,
    'dl':DOMAIN_LINK
  };
  var qs = '';
  for(var key in payload) {
    qs += key + '=' + encodeURIComponent(payload[key]) + '&';
  }
  url += qs.substring(0,qs.length-1);
  UrlFetchApp.fetch(url);
}
  
/*********************************************
* Test: A class for runnning A/B Tests for Ads
* Version 1.0
* Based on VisualWebsiteOptimizer logic: http://goo.gl/jiImn
* Russ Savage
* FreeAdWordsScripts.com
**********************************************/
// A description of the parmeters:
// control - the control Ad, test - the test Ad
// startDate, endDate - the start and end dates for the test
// visitorMetric, conversionMetric - the components of the metric to use for the test
function Test(control,test,desiredConf,startDate,endDate,visitorMetric,conversionMetric) {
  this.desiredConfidence = desiredConf/100;
  this.verMetric = visitorMetric;
  this.conMetric = conversionMetric;
  this.startDate = startDate;
  this.endDate = endDate;
  this.winner;
    
  this.controlAd = control;
  this.controlStats = (this.controlAd['stats']) ? this.controlAd['stats'] : this.controlAd.getStatsFor(this.startDate, this.endDate);
  this.controlAd['stats'] = this.controlStats;
  this.controlVisitors = this.controlStats['get'+this.verMetric]();
  this.controlConversions = this.controlStats['get'+this.conMetric]();
  this.controlCR = getConversionRate(this.controlVisitors,this.controlConversions);
    
  this.testAd = test;
  this.testStats = (this.testAd['stats']) ? this.testAd['stats'] : this.testAd.getStatsFor(this.startDate, this.endDate);
  this.testAd['stats'] = this.testStats;
  this.testVisitors = this.testStats['get'+this.verMetric]();
  this.testConversions = this.testStats['get'+this.conMetric]();
  this.testCR = getConversionRate(this.testVisitors,this.testConversions);
    
  this.pValue;
    
  this.getControlVisitors = function() { return this.controlVisitors; }
  this.getControlConversions = function() { return this.controlConversions; }
  this.getTestVisitors = function() { return this.testVisitors; }
  this.getTestConversions = function() { return this.testConversions; }
    
  // Returns the P-Value for the two Ads
  this.getPValue = function() {
    if(!this.pValue) {
      this.pValue = calculatePValue(this);
    }
    return this.pValue;
  };
    
  // Determines if the test has hit significance
  this.isSignificant = function() {
    var pValue = this.getPValue();
    if(pValue && pValue !== 'N/A' && (pValue >= this.desiredConfidence || pValue <= (1 - this.desiredConfidence))) {
      return true;
    }
    return false;
  }
    
  // Returns the winning Ad
  this.getWinner = function() {
    if(this.decideWinner() === 'control') {
      return this.controlAd;
    }
    if(this.decideWinner() === 'challenger') {
      return this.testAd;
    }
    return null;
  };
    
  // Returns the losing Ad
  this.getLoser = function() {
    if(this.decideWinner() === 'control') {
      return this.testAd;
    }
    if(this.decideWinner() === 'challenger') {
      return this.controlAd;
    }
    return null;
  };
    
  // Determines if the control or the challenger won
  this.decideWinner = function () {
    if(this.winner) {
      return this.winner;
    }
    if(this.isSignificant()) {
      if(this.controlCR >= this.testCR) {
        this.winner = 'control';
      } else {
        this.winner = 'challenger';
      }
    } else {
      this.winner = 'no winner';
    }
    return this.winner;
  }
    
  // This function returns the confidence level for the test
  function calculatePValue(instance) {
    var control = { 
      visitors: instance.controlVisitors, 
      conversions: instance.controlConversions,
      cr: instance.controlCR
    };
    var challenger = { 
      visitors: instance.testVisitors, 
      conversions: instance.testConversions,
      cr: instance.testCR
    };
    var z = getZScore(control,challenger);
    if(z == -1) { return 'N/A'; }
    var norm = normSDist(z);
    return norm;
  }
    
  // A helper function to make rounding a little easier
  function round(value) {
    var decimals = Math.pow(10,5);
    return Math.round(value*decimals)/decimals;
  }
    
  // Return the conversion rate for the test
  function getConversionRate(visitors,conversions) {
    if(visitors == 0) {
      return -1;
    }
    return conversions/visitors;
  }
    
  function getStandardError(cr,visitors) {
    if(visitors == 0) {
      throw 'Visitors cannot be 0.';
    }
    return Math.sqrt((cr*(1-cr)/visitors));
  }
    
  function getZScore(c,t) {
    try {
      if(!c['se']) { c['se'] = getStandardError(c.cr,c.visitors); }
      if(!t['se']) { t['se'] = getStandardError(t.cr,t.visitors); }
    } catch(e) {
      Logger.log(e);
      return -1;
    }
      
    if((Math.sqrt(Math.pow(c.se,2)+Math.pow(t.se,2))) == 0) { 
      Logger.log('WARNING: Somehow the denominator in the Z-Score calulator was 0.');
      return -1;
    }
    return ((c.cr-t.cr)/Math.sqrt(Math.pow(c.se,2)+Math.pow(t.se,2)));
  }
    
  //From: http://www.codeproject.com/Articles/408214/Excel-Function-NORMSDIST-z
  function normSDist(z) {
    var sign = 1.0;
    if (z < 0) { sign = -1; }
    return round(0.5 * (1.0 + sign * erf(Math.abs(z)/Math.sqrt(2))));
  }
    
  // From: http://picomath.org/javascript/erf.js.html
  function erf(x) {
    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;
      
    // Save the sign of x
    var sign = 1;
    if (x < 0) {
      sign = -1;
    }
    x = Math.abs(x);
      
    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
      
    return sign*y;
  }
}
  
/*********************************************
* HTMLTable: A class for building HTML Tables
* Version 1.0
* Russ Savage
* FreeAdWordsScripts.com
**********************************************/
function HTMLTable() {
  this.headers = [];
  this.columnStyle = {};
  this.body = [];
  this.currentRow = 0;
  this.tableStyle;
  this.headerStyle;
  this.cellStyle;
   
  this.addHeaderColumn = function(text) {
    this.headers.push(text);
  };
   
  this.addCell = function(text,style) {
    if(!this.body[this.currentRow]) {
      this.body[this.currentRow] = [];
    }
    this.body[this.currentRow].push({ val:text, style:(style) ? style : '' });
  };
   
  this.newRow = function() {
    if(this.body != []) {
      this.currentRow++;
    }
  };
   
  this.getRowCount = function() {
    return this.currentRow;
  };
   
  this.setTableStyle = function(css) {
    this.tableStyle = css;
  };
   
  this.setHeaderStyle = function(css) {
    this.headerStyle = css; 
  };
   
  this.setCellStyle = function(css) {
    this.cellStyle = css;
    if(css[css.length-1] !== ';') {
      this.cellStyle += ';';
    }
  };
   
  this.toString = function() {
    var retVal = '<table ';
    if(this.tableStyle) {
      retVal += 'style="'+this.tableStyle+'"';
    }
    retVal += '>'+_getTableHead(this)+_getTableBody(this)+'</table>';
    return retVal;
  };
   
  function _getTableHead(instance) {
    var headerRow = '';
    for(var i in instance.headers) {
      headerRow += _th(instance,instance.headers[i]);
    }
    return '<thead><tr>'+headerRow+'</tr></thead>';
  };
   
  function _getTableBody(instance) {
    var retVal = '<tbody>';
    for(var r in instance.body) {
      var rowHtml = '<tr>';
      for(var c in instance.body[r]) {
        rowHtml += _td(instance,instance.body[r][c]);
      }
      rowHtml += '</tr>';
      retVal += rowHtml;
    }
    retVal += '</tbody>';
    return retVal;
  };
   
  function _th(instance,val) {
    var retVal = '<th scope="col" ';
    if(instance.headerStyle) {
      retVal += 'style="'+instance.headerStyle+'"';
    }
    retVal += '>'+val+'</th>';
    return retVal;
  };
   
  function _td(instance,cell) {
    var retVal = '<td ';
    if(instance.cellStyle || cell.style) {
      retVal += 'style="';
      if(instance.cellStyle) {
        retVal += instance.cellStyle;
      }
      if(cell.style) {
        retVal += cell.style;
      }
      retVal += '"';
    }
    retVal += '>'+cell.val+'</td>';
    return retVal;
  };
}