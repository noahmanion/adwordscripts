/**********************************
* 
*
*
*
**********************************/
function main() { 
  
  var emailaddress = 'email@email.com'  
  var timerange = 'LAST_30_DAYS' 
  
  ///Timerange options - YESTERDAY, LAST_7_DAYS, THIS_WEEK_SUN_TODAY, 
  //LAST_WEEK, LAST_14_DAYS, LAST_30_DAYS, 
  //LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, THIS_MONTH, LAST_MONTH, ALL_TIME)

  var reportName = "Hero Pro: Geo and Device Data" + new Date(); 
  var spreadsheet = SpreadsheetApp.create(reportName); 
  spreadsheet.insertSheet('Device Data'); 
  spreadsheet.insertSheet('Geo: Campaign'); 
  spreadsheet.insertSheet('Geo: Account'); 
  var firstsheet = spreadsheet.getSheets()[0]; 
  spreadsheet.deleteSheet(firstsheet); 
  var sheet = spreadsheet.getSheets()[0];

  //spreadsheet formatting

  var accountName = AdWordsApp.currentAccount().getName();

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var range = sheet.getRange("A4:F4"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10"); 
  sheet.setColumnWidth(1, 160); //Campaign 
  sheet.setColumnWidth(2, 120); //Device 
  sheet.setColumnWidth(3, 120); //Conversions 
  sheet.setColumnWidth(4, 120); //Cost 
  sheet.setColumnWidth(5, 120); //CPA 
  sheet.setColumnWidth(6, 120); //CR (%)

  var today = new Date(); //grabs todays date and puts it in cell A1 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd"); 
  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic");

  var cell = sheet.getRange("A:F"); //sets font for entire spreadsheet 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10");

  var cell = sheet.getRange("C:F"); // Centers Columns D:I 
  cell.setHorizontalAlignment("center");

  var cell = sheet.getRange("A2:E2"); //sets cell values to middle 
  cell.setVerticalAlignment("middle");

  var range = sheet.getRange("A2:F2").setBackground("#34495E"); //sets cell background color

  var range = sheet.getRange("E2:E2").setValue(accountName); //Shows account name in cell D2 
  range.setFontColor("White"); 
  range.setFontSize("14");

  var range = sheet.getRange("A2:A2").setValue("Device Data"); 
  range.setFontColor("White"); 
  range.setFontSize("14");

  //spreadhseet formatting

  // Output header row 
  headerRow = []; 
  var header = [ 
      'Campaign', 'Device', 'Conversions', 'Cost', 'CPA', 'CR (%)' 
    ]; 
  headerRow.push(header); 
  sheet.getRange(4, 1, 1, 6).setValues(headerRow);

  var platformIterator = AdWordsApp.targeting().platforms().withCondition("Cost>0").forDateRange(timerange).orderBy("Cost DESC").get();

  var platformData = {}; 
  var allPlacements = {};

  var rows = []; 
  var cr = 0; 
  var cost = 0.00; 
  var cpa = 0.00;

  for (var row = 2; platformIterator.hasNext(); row++) { 
    var platform = platformIterator.next(); 
    var stats = platform.getStatsFor(timerange); 
    var platformList = platform.getName(); 
    var platformCampaign = platform.getCampaign().getName();

    platformData.totalClicks = stats.getClicks(); 
    platformData.totalConversions = stats.getConversions(); 
    platformData.totalCost = stats.getCost();

    var clicks; 
    var conversions; 
    var spend;

    if (!allPlacements[platform]) { 
      allPlacements[platform] = [ 
        platformList, conversions = platformData.totalConversions, spend = platformData.totalCost, clicks = platformData.totalClicks 
      ] 
    } else { 
      allPlacements[platform][1] += platformData.totalConversions; 
      allPlacements[platform][2] += platformData.totalCost; 
      allPlacements[platform][3] += platformData.totalClicks; 
    }

    cr = platformData.totalConversions / platformData.totalClicks * 100 
    if (platformData.totalConversions > 0) { 
      cpa = platformData.totalCost / platformData.totalConversions 
    } else { 
      cpa = 0; 
    } 
    if (platformData.totalCost > 0) { 
      var row = [ 
          platformCampaign, platformList, platformData.totalConversions, platformData.totalCost, cpa.toFixed(2), cr.toFixed(2) 
        ]; 
      rows.push(row); 
    } 
  } 
  sheet.getRange(5, 1, rows.length, 6).setValues(rows);

  for (var i in allPlacements) { 
    var summaryRows = []; 
    if (allPlacements[i][1] > 0) { 
      allPlacements[i][4] = (allPlacements[i][2] / allPlacements[i][1]).toFixed(2); 
      allPlacements[i][5] = (allPlacements[i][1] / allPlacements[i][3] * 100).toFixed(2); 
    } else { 
      allPlacements[i][4] = "----"; 
      allPlacements[i][5]     = "----"; 
    } 
    summaryRows.push("Total", allPlacements[i][0], allPlacements[i][1], allPlacements[i][2], allPlacements[i][4], allPlacements[i][5]); 
    sheet.appendRow(summaryRows); 
  }

  var sheet = spreadsheet.getSheets()[1];

  //spreadsheet formatting

  var accountName = AdWordsApp.currentAccount().getName();

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var range = sheet.getRange("A4:F4"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10"); 
  sheet.setColumnWidth(1, 160); //Campaign 
  sheet.setColumnWidth(2, 120); //Device 
  sheet.setColumnWidth(3, 120); //Conversions 
  sheet.setColumnWidth(4, 120); //Cost 
  sheet.setColumnWidth(5, 120); //CPA 
  sheet.setColumnWidth(6, 120); //CR (%)

  var today = new Date(); //grabs todays date and puts it in cell A1 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd"); 
  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic");

  var cell = sheet.getRange("A:F"); //sets font for entire spreadsheet 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10");

  var cell = sheet.getRange("C:F"); // Centers Columns D:I 
  cell.setHorizontalAlignment("center");

  var cell = sheet.getRange("A2:F2"); //sets cell values to middle 
  cell.setVerticalAlignment("middle");

  var range = sheet.getRange("A2:F2").setBackground("#34495E"); //sets cell background color

  var range = sheet.getRange("E2:E2").setValue(accountName); //Shows account name in cell E2 
  range.setFontColor("White"); 
  range.setFontSize("14");

  var range = sheet.getRange("A2:A2").setValue("Geo Data"); 
  range.setFontColor("White"); 
  range.setFontSize("14");

  //spreadhseet formatting

  // Output header row 
  headerRow = []; 
  var header = [ 
      'Campaign', 'Location', 'Conversions', 'Cost', 'CPA', 'CR (%)' 
    ]; 
  headerRow.push(header); 
  sheet.getRange(4, 1, 1, 6).setValues(headerRow);

  var locationIterator = AdWordsApp.targeting().targetedLocations().withCondition("Cost > 0").forDateRange(timerange).orderBy("Cost DESC").get();

  var locationData = {}; 
  var allLocations = {};

  var rows = []; 
  var cr = 0; 
  var cost = 0.00; 
  var cpa = 0.00;

  for (var row = 2; locationIterator.hasNext(); row++) { 
    var location = locationIterator.next(); 
    var stats = location.getStatsFor(timerange); 
    var locationList = location.getName(); 
    var locationCampaign = location.getCampaign().getName();

    locationData.totalClicks = stats.getClicks(); 
    locationData.totalConversions = stats.getConversions(); 
    locationData.totalCost = stats.getCost();

    var clicks; 
    var conversions; 
    var spend;

    if (!allLocations[location]) { 
      allLocations[location] = [ 
        locationList, conversions = locationData.totalConversions, spend = locationData.totalCost, clicks = locationData.totalClicks 
      ] 
    } else { 
      allLocations[location][1] += locationData.totalConversions; 
      allLocations[location][2] += locationData.totalCost; 
      allLocations[location][3] += locationData.totalClicks; 
    }

    cr = locationData.totalConversions / locationData.totalClicks * 100 
    if (locationData.totalConversions > 0) { 
      cpa = locationData.totalCost / locationData.totalConversions 
    } else { 
      cpa = 0; 
    } 
    if (locationData.totalCost > 0) { 
      var row = [ 
          locationCampaign, locationList, locationData.totalConversions, locationData.totalCost, cpa.toFixed(2), cr.toFixed(2) 
        ]; 
      rows.push(row); 
    } 
  } 
  sheet.getRange(5, 1, rows.length, 6).setValues(rows);

  for (var i in allLocations) { 
    var summaryRows = []; 
    if (allLocations[i][1] > 0) { 
      allLocations[i][4] = (allLocations[i][2] / allLocations[i][1]).toFixed(2); 
      allLocations[i][5] = (allLocations[i][1] / allLocations[i][3] * 100).toFixed(2); 
    } else { 
      allLocations[i][4] = "----"; 
      allLocations[i][5] = "----"; 
    } 
    summaryRows.push(allLocations[i][0], allLocations[i][1], allLocations[i][2], allLocations[i][4], allLocations[i][5]);

    //spreadsheet formatting

    var accountName = AdWordsApp.currentAccount().getName();

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var range = sheet.getRange("A4:F4"); 
    range.setFontColor("White"); 
    range.setBackground("#7492af"); 
    range.setFontSize("10"); 
    sheet.setColumnWidth(1, 160); //Campaign 
    sheet.setColumnWidth(2, 120); //Device 
    sheet.setColumnWidth(3, 120); //Conversions 
    sheet.setColumnWidth(4, 120); //Cost 
    sheet.setColumnWidth(5, 120); //CPA 
    sheet.setColumnWidth(6, 120); //CR (%)

    var today = new Date(); //grabs todays date and puts it in cell A1 
    today.getDate(); 
    Utilities.formatDate(today, "PST", "yyyyMMdd"); 
    var range = sheet.getRange("A1:A1").setValue(today); 
    range.setFontStyle("italic");

    var cell = sheet.getRange("A:F"); //sets font for entire spreadsheet 
    cell.setFontFamily("Lato"); 
    cell.setFontSize("10");

    var cell = sheet.getRange("B:F"); // Centers Columns D:I 
    cell.setHorizontalAlignment("center");

    var cell = sheet.getRange("A2:F2"); //sets cell values to middle 
    cell.setVerticalAlignment("middle");

    var range = sheet.getRange("A2:F2").setBackground("#34495E"); //sets cell background color

    var range = sheet.getRange("E2:E2").setValue(accountName); //Shows account name in cell H2 
    range.setFontColor("White"); 
    range.setFontSize("14");

    var range = sheet.getRange("A2:A2").setValue("Geo Data"); 
    range.setFontColor("White"); 
    range.setFontSize("14");

    //spreadhseet formatting

    var sheet = spreadsheet.getSheets()[2]; 
    var headerRow2 = []; 
    var header2 = [ 
        'Location', 'Conversions', 'Cost', 'CPA', 'CR (%)' 
      ]; 
    headerRow2.push(header2); 
    sheet.getRange(4, 1, 1, 5).setValues(headerRow2); 
    sheet.appendRow(summaryRows); 
  }

  Logger.log("Report ready! Visit the following URL to see it:" + spreadsheet.getUrl()); 
  MailApp.sendEmail(emailaddress, "Segmentation Report", "Your Segmentation report is ready. You can find the report here: " + spreadsheet.getUrl()); 
}