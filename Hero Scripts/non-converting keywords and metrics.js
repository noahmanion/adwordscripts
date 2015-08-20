/**********************************
* What it does: Quickly see which keywords are NOT converting in your account. Analyze your keywords by date range and view KPI’s like Conversions, Impressions, Clicks, Avg. CPC, and Avg. Pos. to help your decide if a keyword should be paused or not.
* Seeing which keywords are not converting in your account and the metrics associated with your campaign will help you determine if a keyword is accomplishing something other than a conversion like introducing a customer to your product.
*
*
*
*
**********************************/
function main() {

  //Set Script Variables 
  var eMail = "email@email.com"; //enter email address  
  var timerange = 'LAST_30_DAYS'; //select a date rainge from optoins below

  //Define timerange with range you want statistics for, must be in all caps. Available ranges 
  //include (TODAY, YESTERDAY, LAST_7_DAYS, THIS_WEEK_SUN_TODAY, LAST_WEEK, LAST_14_DAYS, 
  //LAST_30_DAYS, LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, THIS_MONTH, LAST_MONTH, ALL_TIME). 
  
  //Unless you know what you're doing don't edit the below or your computer will blow up. :) 
  
  var campaignStatus = ("Status = ENABLED"); //Options: ENABLED, PAUSED, REMOVED 
  var accountName = AdWordsApp.currentAccount().getName(); 
  var spreadsheet = SpreadsheetApp.create("Non-Converting Keywords + Metrics: " + accountName); 
  var sheet = spreadsheet.getActiveSheet();

  var subject = "Non-Converting Keywords + Metrics: " + accountName; 
  var body = "Here is a list of all the non-converting keywords + metrics in your account: " + spreadsheet.getUrl(); 
 

  MailApp.sendEmail(eMail, subject, body);

  var filelocation = spreadsheet.getUrl();

  var keywordsIterator = AdWordsApp.keywords() 
    //You can change the number from "0" to any number.  
    .withCondition(campaignStatus).withCondition("Impressions > 0") 
    .withCondition("Conversions = 0") 
    .orderBy ("Clicks DESC") 
    .forDateRange(timerange) 
    .get();

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var range = sheet.getRange("A4:J4"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10");

  sheet.setColumnWidth(1, 160); //Campaign 
  sheet.setColumnWidth(2, 160); //AdGroup 
  sheet.setColumnWidth(3, 160); //Keyword 
  sheet.setColumnWidth(4, 120); //Conv. 
  sheet.setColumnWidth(5, 80); //Clicks 
  sheet.setColumnWidth(6, 120); //Impr. 
  sheet.setColumnWidth(7, 80); //CTR 
  sheet.setColumnWidth(8, 110); //Avg. CPC 
  sheet.setColumnWidth(9, 125); //Avg. Pos 
  sheet.setColumnWidth(10, 125); //Cost

  var today = new Date(); //grabs todays date and puts it in cell A1 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd");

  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic");

  var cell = sheet.getRange("A:J"); //sets font for entire spreadsheet 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10");

  var cell = sheet.getRange("D:J"); // Centers Columns D:I 
  cell.setHorizontalAlignment("center");

  var cell = sheet.getRange("A2:J2"); //sets cell values to middle 
  cell.setVerticalAlignment("middle");

  var range = sheet.getRange("A2:J2").setBackground("#34495E"); //sets cell background color

  var range = sheet.getRange("H2:H2").setValue(accountName); //Shows account name in cell H2 
  range.setFontColor("White"); 
  range.setFontSize("14");

  var range = sheet.getRange("A2:A2").setValue("Hero Pro: Non-Converting Keywords + Metrics"); 
  range.setFontColor("White"); 
  range.setFontSize("14");

  var currentAccount = AdWordsApp.currentAccount(); 
  currentAccount.getCurrencyCode(); //provides currency code for symbols

  var sheet = spreadsheet.getActiveSheet(); 
  var currentrow = sheet.getLastRow();

  var header = [ 
      'Campaign', 'Ad Group', 'Keyword', 'Conversions', 'Clicks', 'Impressions', 'CTR (%)', 'Avg. CPC', 'Avg. Position', 'Cost' 
    ];

  sheet.getRange(4, 1, 1, 10).setValues([header]);

  var current = []; 
  for (var i = 0; i <= currentrow; i++) { 
    var currentdata = sheet.getRange("A:J").getValues(); 
    var data = {};

    for (i in currentdata) { 
      var key = [ 
          currentdata[i][0], currentdata[i][1], currentdata[i][2], currentdata[i][3], 
          currentdata[i][4], currentdata[i][5], currentdata[i][6], currentdata[i][7], 
          currentdata[i][8], currentdata[i][9] 
        ].join(","); 
      data[key] = currentdata[i];

    } 
  }

  for (var row = 3; keywordsIterator.hasNext(); row++) { 
    var keyword = keywordsIterator.next(); 
    var stats = keyword.getStatsFor(timerange); 
    var keywordtext = " " + keyword.getText(); 
    var keywordcampaign = keyword.getCampaign().getName(); 
    var keywordadgroup = keyword.getAdGroup().getName(); 
    var conversions = stats.getConversions(); 
    var clicks = stats.getClicks(); 
    var impressions = stats.getImpressions(); 
    var ctr = stats.getCtr().toFixed(4) * 100 + "%"; //fixed to 4 decimal places and adds "%" 
    var avgcpc = stats.getAverageCpc().toFixed(2)*100/100; //fixed to 4 decimal places 
    var avgposition = stats.getAveragePosition(); 
    var cost = stats.getCost();

    var key = [ 
        keywordcampaign, keywordadgroup, keywordtext, conversions, clicks, impressions, ctr, avgcpc, avgposition, cost, 
      ].join(",");

    if (!(key in data)) {

      var row = [ 
          keywordcampaign, keywordadgroup, keywordtext, conversions, clicks, impressions, ctr, avgcpc, avgposition, cost, 
        ];

      sheet.appendRow(row);

    } 
  }

  var wraps = [ 
      [ 
        true, true, true, true, true, true, true, true, true, true, 
      ] 
    ];

  var range = sheet.getRange("A2:J2");

  Logger.log("Report ready! Visit the following URL to see it:"); 
  Logger.log(filelocation); 
}