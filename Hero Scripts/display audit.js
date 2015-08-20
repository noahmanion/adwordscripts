/**********************************
* 
*
*
*
**********************************/
function main() {

// how are view through conversions valued? The default is 1/4 of a conversion.

// Enter your max CPA Here 
var cost_Threshold = 8;

// Set View Through Conversions 
var vtc_Value = 0.25; 
// how are view through conversions valued? The default is 1/4 of a conversion.

var accountName = AdWordsApp.currentAccount().getName();

var date = new Date();

var spreadsheet = SpreadsheetApp.create("Display Audit: " + accountName); 
var sheet = spreadsheet.getActiveSheet(); 
    sheet.setColumnWidth(1, 160); // Placement 
    sheet.setColumnWidth(2, 160); // Campaign 
    sheet.setColumnWidth(3, 160); // Ad Group 

var cell = sheet.getRange("D:G");// Centers Columns D:G 
    cell.setHorizontalAlignment("center");

createHeadings(spreadsheet); 

  function createHeadings(ss){ 
    ss.getActiveSheet(); 
    var range = sheet.getRange("A4:G4"); 
    range.setFontColor("White"); 
    range.setBackground("#7492af"); 
    ss.getRange("A4").setValue("Placement"); 
    ss.getRange("B4").setValue("Campaign"); 
    ss.getRange("C4").setValue("Ad Group"); 
    ss.getRange("D4").setValue("Cost"); 
    ss.getRange("E4").setValue("Conversions"); 
    ss.getRange("F4").setValue("VTC"); 
    ss.getRange("G4").setValue("CPA"); 
  }

var cell = sheet.getRange("A:J"); // sets font for entire spreadsheet 
    cell.setFontFamily("Lato"); 
    cell.setFontSize("10");

var today = new Date(); // grabs todays date and puts it in cell A1 
    today.getDate(); 
    Utilities.formatDate(today, "PST", "yyyyMMdd"); 
var range = sheet.getRange("A1:A1").setValue(today); 
    range.setFontStyle("italic");

var range = sheet.getRange("A2:G2").setBackground("#34495E"); // sets cell background color

var range = sheet.getRange("F2:F2").setValue(accountName); // Shows account name in cell F2 
    range.setFontColor("White"); 
    range.setFontSize("14");

var range = sheet.getRange("A2:A2").setValue("Hero Pro: Display Audit"); 
    range.setFontColor("White"); 
    range.setFontSize("14");

var cost_Threshhold = cost_Threshold; 
var report = AdWordsApp.report( 
    "SELECT DisplayName,CampaignName,AdGroupName,DestinationUrl,Cost,ViewThroughConversions,Conversions " + 
    " FROM PLACEMENT_PERFORMANCE_REPORT " + 
    " WHERE " + 
    " Cost > " + cost_Threshold + 
    " AND Conversions > 0 " + 
    " DURING LAST_30_DAYS"); 
var rows = report.rows();

while(rows.hasNext()) { 
  var row = rows.next(); 
  ratePlacement(row); 
}

function ratePlacement(placementObject) { 
  var cost = placementObject['Cost']; 
  var conversions = placementObject['Conversions']; 
  var placementName = placementObject['DisplayName']; 
  var campaignName = placementObject['CampaignName']; 
  var adGroupName = placementObject['AdGroupName']; 
  var vtcConv = placementObject['ViewThroughConversions']; 
  parseFloat(vtcConv); 
  Math.round(vtcConv); 
  parseFloat(cost); 
  parseFloat(conversions); 

  var CPA = cost/conversions; 
  var vtcMod = parseFloat(vtcConv) * vtc_Value; 
  var totalConversions = parseFloat(conversions) + parseFloat(vtcMod); 
  var adjCPA = cost/totalConversions; 

  if (adjCPA > cost_Threshold) { 
    // Logger.log(placementName + " " + campaignName + " " + adGroupName + " " + cost + " " + conversions + " " + vtcMod + " " + adjCPA); 
    // Logger.log(conversions + " " + vtcMod + " " + totalConversions ); 
    sheet.appendRow([placementName, campaignName, adGroupName, cost, conversions, vtcConv, adjCPA] ) 
  } 
} 
};