/**********************************
* 
*
*
*
**********************************/
function main() {

  //CPA Formula is (Cost / Conv. = CPA) 
  //Script Note: If Zero Conv. are recorded then CPA is the same as Cost.

  //Set Script Variables: 

  var cpalimit = 50; //Set CPA Goal 
  var eMail = "email@email.com"; //Enter Email Address 
  var campaignStatus = ("Status = ENABLED"); //Options: ENABLED, PAUSED, REMOVED 
  var timerange = "LAST_30_DAYS"; //Set Date Range from Options Below

  //(Date range choices are: TODAY, YESTERDAY, LAST_7_DAYS, THIS_WEEK_SUN_TODAY, LAST_WEEK, LAST_14_DAYS, 
  //LAST_30_DAYS, LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, THIS_MONTH, LAST_MONTH, ALL_TIME) 

  var spreadsheet = SpreadsheetApp.create("Campaigns Over CPA"); 
  var sheet = spreadsheet.getActiveSheet(); 
  var currentRow = sheet.getLastRow(); 
  var accountName = AdWordsApp.currentAccount().getName();

  var subject = "Campaigns Over CPA: " + accountName; 
  var body = "Here is a list of all campaigns over CPA in your account." + spreadsheet.getUrl(); 
  var body2 = "Date range is defaulted to 'LAST_30_DAYS'. You can customize date range within the scrips.";

  MailApp.sendEmail(eMail, subject, body, body2);

  var filelocation = spreadsheet.getUrl();

  sheet.getRange("A4").setValue("Campaign"); 
  sheet.getRange("B4").setValue("Cost"); 
  sheet.getRange("C4").setValue("Conversions"); 
  sheet.getRange("D4").setValue("Current CPA"); 
  sheet.getRange("E4").setValue("Target CPA");

  var range = sheet.getRange("A4:E4"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10"); 
  sheet.setColumnWidth(1, 250); //Campaign 
  sheet.setColumnWidth(2, 160); //Cost 
  sheet.setColumnWidth(3, 160); //Conversions 
  sheet.setColumnWidth(4, 160); //Curret CPA 
  sheet.setColumnWidth(5, 160); //Target CPA

  var cell = sheet.getRange("A:E"); //sets font for entire spreadsheet 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10");

  var cell = sheet.getRange("B:E"); // Centers Columns D:E 
  cell.setHorizontalAlignment("center");

  var today = new Date(); //grabs todays date and puts it in cell A1 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd"); 
  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic");

  var range = sheet.getRange("A2:E2").setBackground("#34495E"); //sets cell background color

  var range = sheet.getRange("A2:A2").setValue("Hero Pro: Campaigns Over CPA"); 
  range.setFontColor("White"); 
  range.setFontSize("14");

  var range = sheet.getRange("D2:D2").setValue(accountName); //Shows account name in cell D2 
  range.setFontColor("White"); 
  range.setFontSize("14");

  //Array definition and get data  
  var campaignIterator = AdWordsApp.campaigns().forDateRange(timerange).withCondition(campaignStatus).get(); 
  for (var row = 100; campaignIterator.hasNext(); row++) { 
    var campaign = campaignIterator.next(); 
    var campaignName = campaign.getName(); 
    var stats = campaign.getStatsFor(timerange); 
    var Conv = stats.getConversions(); 
    var Cost = stats.getCost(); 
    var cpa = (Cost / Conv);

    if (Conv > 0) { 
      if (cpa > cpalimit) { 
        var row = [ 
            campaignName, Cost, Conv, cpa.toFixed(2), cpalimit 
          ]; 
        sheet.appendRow(row); 
      } 
    }

    if (Conv == 0) { 
      if (Cost > cpalimit) { 
        var row = [ 
            campaignName, Cost, Conv, Cost, cpalimit 
          ]; 
        sheet.appendRow(row); 
      } 
    }

  } 
}

