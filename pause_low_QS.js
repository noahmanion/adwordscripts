                                             
// Copyright www.optmyzr.com all rights reserved. This script is provided on a as-is basis with no guarantee.
// This script may be distributed freely, without changing this notice

function main() {
  
  //EDIT- SECTION
  
  //Enter email address. For mulitple addresses please enter the the addresses separated by a comma.
  var email_address = "example@example.com";
  
  //Change the pause value to true to pause the keywords with below quality score.
  var pause = false; 
  
  //This quality score defines the threshold to find keywords below it.
  var quality_score = 5; 
  
  //ENTER the number of days you would like to get the stats of keywords for. By default it checks for last 30 days.
  var date_range = "LAST_30_DAYS";
  
  //END OF EDIT-SECTION
  
  var workbook = SpreadsheetApp.create("Keywords with low Quality Score (" + 
    Utilities.formatDate(new Date(), "PST", "MM-dd HH:mm)"));
  var currentSheet = workbook.getActiveSheet();
  var keyword_found=false;
  
  currentSheet.setName("Overview");
  currentSheet.appendRow(["Campaign Name","Adgroup","Keyword","Cost","Impressions","Conversions","Quality Score"]);
  currentSheet.getRange("1:1").setFontWeight("bold");
  
  var report = AdWordsApp.report("SELECT CampaignName, AdGroupName, KeywordText, Cost, Impressions, Conversions, QualityScore "+
                                "FROM KEYWORDS_PERFORMANCE_REPORT "+
                                 "WHERE CampaignStatus= ACTIVE and AdGroupStatus = ENABLED and Status = ACTIVE and QualityScore<"+quality_score+
                                " DURING "+date_range);
  
  report.exportToSheet(currentSheet);
  var rows = report.rows();
  if(!rows.hasNext()){
   currentSheet.appendRow(["No active Keywords Found"]); 
  }  
  
  MailApp.sendEmail(email_address, "Quality Score Tracker for Keywords", "You can see the keywords on the following url\n\n"+workbook.getUrl());
}