/**********************************
* 
*
*
*
**********************************/
function main() {

  // Insert your email address here to get a sharable spreadsheet link 
  // or go to your Google drive to look at the spreadsheet. 
  var eMail = "example@example.com"; 

  // Define 'timerange' with date range you are interested in 
  // (TODAY, YESTERDAY, LAST_7_DAYS, THIS_WEEK_SUN_TODAY, LAST_WEEK, LAST_14_DAYS, LAST_30_DAYS, 
  // LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, THIS_MONTH, LAST_MONTH, ALL_TIME). 
  var timerange = "LAST_MONTH";

  var accountName = AdWordsApp.currentAccount().getName(); 
  var spreadsheet = SpreadsheetApp.create("Average Position: " + accountName); 
  var sheet = spreadsheet.getActiveSheet();

  var recipient = eMail; 
  var subject = "Average Position: " + accountName; 
  var body = "See your Average Position results here - "+ spreadsheet.getUrl(); 

  MailApp.sendEmail(eMail, subject, body); 


  sheet.getRange(1, 1, 1, 1).setValue("Date"); 
  Logger.log("Report ready! Visit the following URL to see it:"); 
  Logger.log("https://docs.google.com/spreadsheet/ccc?key=" + spreadsheet.getId()); 

  var ss = SpreadsheetApp.getActiveSpreadsheet(); 

  var range = sheet.getRange("A4:E4"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10"); 
  sheet.setColumnWidth(1, 160); // Average Position 
  sheet.setColumnWidth(2, 160); // CR (%) 
  sheet.setColumnWidth(3, 160); // Cost 
  sheet.setColumnWidth(4, 160); // CPA 

  var today = new Date(); // Grabs todays date and puts it in cell A1 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd"); 
  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic"); 

  var cell = sheet.getRange("A:E"); // Sets font for entire spreadsheet 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10"); 

  var cell = sheet.getRange("A:E"); // Centers Columns A:E 
  cell.setHorizontalAlignment("center"); 

  var cell = sheet.getRange("A2:E2"); // Sets cell values to middle 
  cell.setVerticalAlignment("middle"); 

  var range = sheet.getRange("A2:E2").setBackground("#34495E"); // Sets cell background color 

  var range = sheet.getRange("D2:D2").setValue(accountName); // Shows account name in cell D2 
  range.setFontColor("White"); 
  range.setFontSize("14"); 

  // var reportName = "Average Position: " + accountName; 
  var range = sheet.getRange("A2:A2").setValue("Hero Pro: Average Position - " + timerange); 
  var cell = sheet.getRange("A2:A2"); // left justify name 
  cell.setHorizontalAlignment("left"); 
  range.setFontColor("White"); 
  range.setFontSize("14");

  // Output header row 
  headerRow = []; 
  var header = [ 
    'Average Position', 
    'CTR (%)', 
    'Cost', 
    'CPA' 
  ]; 
  headerRow.push(header); 
  sheet.getRange(4, 1, 1, 4).setValues(headerRow);

  // Initialize 
  var positionMap = []; 
  for (i = 1; i <= 12; i++) { 
    positionMap[i] = { 
      totalClicks: 0, 
      totalConversions: 0, 
      totalCost: 0.00 
    }; 
  }

  // Compute data 
  var keywordIterator = AdWordsApp.keywords() 
      .forDateRange(timerange) 
      .withCondition('Clicks > 0') 
      .get(); 
  while (keywordIterator.hasNext()) { 
    var keyword = keywordIterator.next(); 
    var stats = keyword.getStatsFor(timerange); 
    if (stats.getAveragePosition() <= 11) { 
      var data = positionMap[Math.ceil(stats.getAveragePosition())]; 
    } else { 
      // All positions greater than 11 
      var data = positionMap[12]; 
    } 
    data.totalClicks += stats.getClicks(); 
    data.totalConversions += stats.getConversions(); 
    data.totalCost += stats.getCost(); 
  }

  // Output data to spreadsheet 
  var rows = []; 
  for (var key in positionMap) { 
    var cr = 0; 
    var cost = 0.00; 
    var cpa = 0.00 
    if (positionMap[key].totalConversions > 0) { 
      cr = (positionMap[key].totalConversions / 
        positionMap[key].totalClicks) * 100; 
      cpa = (positionMap[key].totalCost / 
        positionMap[key].totalConversions); 
    } 
    var row = [ 
      key <= 11 ? key - 1 + ' to ' + key : '>11', 
      cr.toFixed(2), 
      positionMap[key].totalCost, 
      cpa.toFixed(2) 
    ]; 
    rows.push(row); 
  } 
  sheet.getRange(5, 1, rows.length, 4).setValues(rows); 
}