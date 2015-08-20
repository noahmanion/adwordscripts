/**********************************
* 
*
*
*
**********************************/
function main() {

  // Set Email address. You can add as many emails as needed. 
  // E.g. "example@example.com, example@example.com, example@example.com" 
  var eMail = "email@example.com"; 
  var monthlyBudget = "10000.00";

  var accountName = AdWordsApp.currentAccount().getName(); 
  // Create spreadsheet to put data in. 
  var spreadsheet = SpreadsheetApp.create( 
    "Monthly Budget Projections: " + accountName); 
  var sheet = spreadsheet.getActiveSheet();

  function daysInMonth(month, year) { 
    //returns number of days in a given month of a given year 
    return new Date(year, month, 0).getDate(); 
  }

  // Spreadsheet formatting

  // Sets font for entire spreadsheet 
  var cell = sheet.getRange("A:K"); 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10");

  // Centers Columns B:K 
  var cell = sheet.getRange("B:GK"); 
  cell.setHorizontalAlignment("center");

  // Add a title to the spreadsheet 
  sheet.getRange("A2").setValue( 
    "Hero Pro: Monthly Budget Projections"); 
  sheet.getRange("A2:K2").setBackground("#34495E"); 
  sheet.getRange("A2:K2").setFontColor("White"); 
  sheet.getRange("A2:K2").setFontSize("14");

  // Grabs todays date and puts it in cell A1 
  var today = new Date(); 
  var thisMonth = today.getMonth(); 
  var thisYear = today.getFullYear(); 
  var totalDays = daysInMonth(thisMonth + 1, thisYear); 
  var daysSoFar = today.getDate() - 1; 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd"); 
  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic");

  // Shows account name in cell E2 
  var range = sheet.getRange("E2:E2").setValue(accountName); 
  range.setFontColor("White"); 
  range.setFontSize("14");

  //Budget Area 
  sheet.getRange("A3").setValue("Budget"); 
  sheet.getRange("B3").setValue(monthlyBudget);

  sheet.getRange("A4").setValue("Today's Date:"); 
  sheet.getRange("B4").setValue(today);

  sheet.getRange("A5").setValue("End of Month:"); 
  var endDate = new Date(thisYear, thisMonth, totalDays); 
  sheet.getRange("B5").setValue(endDate);

  sheet.getRange("A6").setValue("Days Left:"); 
  var daysLeft = (totalDays - daysSoFar); 
  sheet.getRange("B6").setValue(daysLeft);

  sheet.getRange("A7").setValue("7 Day Cost:");// 7 Day Cost 
  sheet.getRange(7, 2).setFormula("=sum(F:F)"); 
  
  sheet.getRange("A8").setValue("MTD Cost:"); // Month to Date Cost 
  sheet.getRange(8, 2).setFormula("=sum(G:G)");

  sheet.getRange("B10").setValue("Projected"); 
  sheet.getRange("B10:C10").setBackground("#34495E"); 
  sheet.getRange("B10:C10").setFontColor("White"); 
  sheet.getRange("B10:C10").setFontSize("10"); 
  
  sheet.getRange("A11").setValue("Cost:"); //Projected Cost 
  sheet.getRange(11, 2).setFormula("=sum(H:H)"); //Projected Cost 
  
  sheet.getRange("A12").setValue("Conversions:"); //Projected Conversions 
  sheet.getRange(12, 2).setFormula("=sum(J:J)"); //Projected Conversions

  sheet.getRange("A13").setValue("Cost Per Lead:"); //Projected cost per lead 
  sheet.getRange(13, 2).setFormula("=ROUND(B11/B12)"); // Projected Conv. / Projected Cost

  sheet.getRange("A15").setValue("% of Budget Spent:"); 
  sheet.getRange(15, 2).setFormula("=sum((B8/B3)*100)"); // (MDT Cost / Budget)*100

  sheet.getRange("A16").setValue("Amount Over Budget:"); 
  sheet.getRange(16, 2).setFormula("B11-B3"); // Projected Cost - Budget

  sheet.getRange("A17").setValue("Daily Cut Needed:"); 
  sheet.getRange(17, 2).setFormula("=ROUND(B16/B6)"); // Amount Over Budget / Days Left 
  
  sheet.getRange("C10").setValue("Last Month"); 
  sheet.getRange("C11").setValue("=sum(I:I)"); 
  sheet.getRange("C12").setValue("=sum(K:K)"); 
  sheet.getRange("C13").setValue("=Round(C11/C12)"); 
    
  
  // Add spreadsheet column categories 
  sheet.getRange("A19").setValue("Campaign"); 
  sheet.getRange("B19").setValue("Projected Clicks"); 
  sheet.getRange("C19").setValue("Clicks Last Month"); 
  sheet.getRange("D19").setValue("Projected Impr."); 
  sheet.getRange("E19").setValue("Impr. Last Month"); 
  sheet.getRange("F19").setValue("Seven Day Cost"); 
  sheet.getRange("G19").setValue("Month To Date Cost"); 
  sheet.getRange("H19").setValue("Projected Cost"); 
  sheet.getRange("I19").setValue("Cost Last Month"); 
  sheet.getRange("J19").setValue("Projected Conv."); 
  sheet.getRange("K19").setValue("Conv. Last Month");

  // Set formatting for column categories 
  var range = sheet.getRange("A19:K19"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10"); 
  sheet.setColumnWidth(1, 190); // Account 
  sheet.setColumnWidth(2, 140); // Projected Clicks 
  sheet.setColumnWidth(3, 140); // Clicks Last Month 
  sheet.setColumnWidth(4, 140); // Projected Impressions 
  sheet.setColumnWidth(5, 140); // Impressions Last Month 
  sheet.setColumnWidth(6, 140); // Seven Day Cost 
  sheet.setColumnWidth(7, 140); // Month To Date Cost 
  sheet.setColumnWidth(8, 140); // Projected Cost 
  sheet.setColumnWidth(9, 140); // Cost Last Month 
  sheet.setColumnWidth(10, 140); // Conversions 
  sheet.setColumnWidth(11, 140); // Conversions Last Month

  //format date 
  var today = new Date(); 
  var date = new Date(); 
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0); 
  var daysLeft = days_between(lastDay, today);

  getAllCampaigns();

  var subject = "Monthly Account Budget Projections " + accountName; 
  var body = "Your monthly projections have been posted to: " + 
    spreadsheet.getUrl();

  MailApp.sendEmail(eMail, subject, body);

  function getAllCampaigns() {

    var campaignIterator = AdWordsApp.campaigns().get();

    while (campaignIterator.hasNext()) { 
      var campaign = campaignIterator.next(); 
      var campaignName = campaign.getName() ? campaign.getName() : 
        '--';

      var statsSevenDays = campaign.getStatsFor("LAST_7_DAYS"); 
      var statsMonth = campaign.getStatsFor("THIS_MONTH"); 
      var statsLastMonth = campaign.getStatsFor("LAST_MONTH"); 
                
      // objects 
      
      var lmtdTotal = {}; 
      lmtdTotal['last month clicks'] = 0; 
      lmtdTotal['last month cost'] = 0; 
      lmtdTotal['last month impressions'] = 0; 
      lmtdTotal['last month conversions'] = 0; 
      
      var mtdTotal = {}; 
      mtdTotal['clicks'] = 0; 
      mtdTotal['cost'] = 0; 
      mtdTotal['impressions'] = 0; 
      mtdTotal['conversions'] = 0;

      var sevenDayTotal = {}; 
      sevenDayTotal['clicks'] = 0; 
      sevenDayTotal['cost'] = 0; 
      sevenDayTotal['impressions'] = 0; 
      sevenDayTotal['conversions'] = 0;

      var projectedTotal = {}; 
      projectedTotal['clicks'] = 0; 
      projectedTotal['cost'] = 0; 
      projectedTotal['impressions'] = 0; 
      projectedTotal['conversions'] = 0;

  lmtdTotal['last month clicks'] += statsLastMonth.getClicks(); 
      lmtdTotal['last month impressions'] += statsLastMonth.getImpressions(); 
      lmtdTotal['last month cost'] += statsLastMonth.getCost(); 
      lmtdTotal['last month conversions'] += statsLastMonth.getConversions();

      mtdTotal['clicks'] += statsMonth.getClicks(); 
      mtdTotal['impressions'] += statsMonth.getImpressions(); 
      mtdTotal['cost'] += statsMonth.getCost(); 
      mtdTotal['conversions'] += statsMonth.getConversions();

      sevenDayTotal['clicks'] += statsSevenDays.getClicks(); 
      sevenDayTotal['impressions'] += statsSevenDays.getImpressions(); 
      sevenDayTotal['cost'] += statsSevenDays.getCost(); 
      sevenDayTotal['conversions'] += statsSevenDays.getConversions();

      projectedTotal['clicks'] = Math.round(makeProjections( 
        mtdTotal['clicks'], 
        sevenDayTotal['clicks'], daysLeft)); 
      projectedTotal['impressions'] = Math.round(makeProjections( 
        mtdTotal['impressions'], 
        sevenDayTotal['impressions'], daysLeft)); 
      projectedTotal['cost'] = makeProjections(mtdTotal['cost'], 
        sevenDayTotal['cost'], 
        daysLeft).toFixed(2); 
      projectedTotal['conversions'] = Math.round(makeProjections( 
        mtdTotal['conversions'], 
        sevenDayTotal['conversions'], daysLeft));

      // Add a row of data to the spreadsheet 
      var row = [ 
        campaignName, 
        projectedTotal['clicks'], 
        lmtdTotal['last month clicks'], 
        projectedTotal['impressions'], 
        lmtdTotal['last month impressions'], 
        sevenDayTotal['cost'], 
        mtdTotal['cost'], 
        projectedTotal['cost'], 
        lmtdTotal['last month cost'], 
        projectedTotal['conversions'], 
        lmtdTotal['last month conversions'] 
      ];

      sheet.appendRow(row); 
    } 
  }

  function days_between(date1, date2) { 
    // The number of milliseconds in one day 
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds 
    var date1_ms = date1.getTime(); 
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds 
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return 
    return Math.round(difference_ms / ONE_DAY); 
  }

  function makeProjections(month, lastWeek, time) { 
    var total = month + ((lastWeek / 7) * time); 
    return total; 
  } 
}