/**********************************
* 
*
*
*
**********************************/
function main() {

  //UPDATE WITH YOUR EMAIL 
  var email = "email@email.com"; 
  
  var accountName = AdWordsApp.currentAccount().getName();

  var spreadsheet = SpreadsheetApp.create("Decrease in CTR: " + accountName); 
  var sheet = spreadsheet.getActiveSheet();

  //Spreadsheet formatting 
  
  //sets font for entire spreadsheet 
  var cell = sheet.getRange("A:J"); 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10");

  // Centers Columns B:E 
  var cell = sheet.getRange("B:E"); 
  cell.setHorizontalAlignment("center");

  //Add a title to the spreadsheet 
  sheet.getRange("A2").setValue("Hero Pro: Decrease in CTR");  
  sheet.getRange("A2:E2").setBackground("#34495E"); 
  sheet.getRange("A2:E2").setFontColor("White"); 
  sheet.getRange("A2:E2").setFontSize("14");

  //grabs todays date and puts it in cell A1 
  var today = new Date(); 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd"); 
  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic"); 

  //Shows account name in cell E2 
  var range = sheet.getRange("E2:E2").setValue(accountName); 
  range.setFontColor("White"); 
  range.setFontSize("14"); 
  
  //Add spreadsheet column categories 
  sheet.getRange("A4").setValue("Campaign");  
  sheet.getRange("B4").setValue("Ad Group"); 
  sheet.getRange("C4").setValue("CTR Last Week"); 
  sheet.getRange("D4").setValue("CTR Two Weeks Ago"); 
  sheet.getRange("E4").setValue("CTR Three Weeks Ago");

  //Set formatting for column categories 
  var range = sheet.getRange("A4:E4"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10"); 
  sheet.setColumnWidth(1, 200); //Campaign 
  sheet.setColumnWidth(2, 200); //Ad Group 
  sheet.setColumnWidth(3, 200); //CTR Last Week 
  sheet.setColumnWidth(4, 200); //CTR Two Weeks Ago 
  sheet.setColumnWidth(5, 200); //CTR Three Weeks Ago 
  
  //Get ad groups that are enabled and running 
  var adGroupsIterator = AdWordsApp.adGroups() 
    .withCondition("Status = 'ENABLED'") 
    .withCondition("CampaignStatus = 'ENABLED'") 
    .forDateRange("TODAY") 
    .orderBy("Ctr ASC") 
    .withLimit(500) 
    .get();

  var today = getDateInThePast(0); 
  var oneWeekAgo = getDateInThePast(7); 
  var twoWeeksAgo = getDateInThePast(14); 
  var threeWeeksAgo = getDateInThePast(21);

  var ctrRows = []; 
  
  while (adGroupsIterator.hasNext()) {

    var adGroup = adGroupsIterator.next();

    // Let's look at the trend of the ad group's CTR. 
    var statsThreeWeeksAgo = adGroup.getStatsFor(threeWeeksAgo, twoWeeksAgo); 
    var statsTwoWeeksAgo = adGroup.getStatsFor(twoWeeksAgo, oneWeekAgo); 
    var statsLastWeek = adGroup.getStatsFor(oneWeekAgo, today);

    // Week over week, the ad group is decreasing - record that! 
    if (statsLastWeek.getCtr() < statsTwoWeeksAgo.getCtr() && statsTwoWeeksAgo.getCtr() < statsThreeWeeksAgo.getCtr()) { 
      
      ctrRows.push([adGroup.getCampaign().getName(), adGroup.getName(), 
        statsLastWeek.getCtr(), statsTwoWeeksAgo.getCtr(), 
        statsThreeWeeksAgo.getCtr()]); 
    } 
  }

  if (ctrRows.length > 0){ 
    sheet.getRange(5, 1, ctrRows.length, 5).setValues(ctrRows); 
    sheet.getRange(5, 1, ctrRows.length, 5).setNumberFormat("#0.00%"); 
  }

  if (email) { 
    var body = []; 
 

    if(ctrRows.length>0){ 
      var subjectline = []; 
      subjectline.push(" Ad Group CTR's Are Decreasing In " + accountName);  
      body.push("The CTR has decreased over the last 3 weeks for ad groups in " + accountName + "." + " " + "Full report at: " + spreadsheet.getUrl());  
      MailApp.sendEmail(email, subjectline, body); 
    } 
  }

  else{ 
    body.push("No ad groups in " + accountName + " have consistently decreasing CTR for the past three weeks. 
");  
    MailApp.sendEmail(email, subjectline, body); 
  } 
}

function ctr(number) { 
  return parseInt(number * 10000) / 10000 + "%";  
}

// Returns YYYYMMDD-formatted date. 
function getDateInThePast(numDays) { 
  var today = new Date(); 
  today.setDate(today.getDate() - numDays); 
  return Utilities.formatDate(today, "PST", "yyyyMMdd"); 
}