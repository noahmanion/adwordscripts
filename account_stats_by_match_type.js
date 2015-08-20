// Copyright www.optmyzr.com all rights reserved. This script is provided on a as-is basis with no guarantee.
// This script may be distributed freely, without changing this notice

function main()
{
  var EMAIL_ADDRESS = "REPLACE_WITH_EMAIL_ADDRESS";
  
  var workbook = SpreadsheetApp.create(
    "Account Structure - Keyword Match Types (" + 
    Utilities.formatDate(new Date(), "PST", "MM-dd HH:mm)"));
  
  
  var currentSheet = workbook.getActiveSheet();
  currentSheet.setName("Overview");
  currentSheet.appendRow(["Campaign Name", "Broad Match Keywords", "Exact Match Keywords", "Phrase Match Keywords", "Total Active Keywords"]);
  currentSheet.getRange("1:1").setFontWeight("bold");
  
  var campaigns = AdWordsApp.campaigns().withCondition("Status = ENABLED").get();
  
  var accountTotalKeywords = 0;
  var accountTotalKeywordsBroad = 0;
  var accountTotalKeywordsExact = 0;
  var accountTotalKeywordsPhrase = 0;
  
  while(campaigns.hasNext())
  {
    var campaign = campaigns.next();
    var numberOfKeywords = countNumberOfKeywords(campaign);
    var numberOfKeywordsBroad = countNumberOfKeywordsMatchType(campaign, "BROAD");
    var numberOfKeywordsExact = countNumberOfKeywordsMatchType(campaign, "EXACT");
    var numberOfKeywordsPhrase = countNumberOfKeywordsMatchType(campaign, "PHRASE");
    
    accountTotalKeywords += numberOfKeywords;
    accountTotalKeywordsBroad += numberOfKeywordsBroad;
    accountTotalKeywordsExact += numberOfKeywordsExact;
    accountTotalKeywordsPhrase += numberOfKeywordsPhrase;
    
    currentSheet.appendRow([campaign.getName(), numberOfKeywordsBroad, numberOfKeywordsExact, numberOfKeywordsPhrase, numberOfKeywords]);
  }
  
  currentSheet.appendRow(["Account Total", accountTotalKeywordsBroad, accountTotalKeywordsExact, accountTotalKeywordsPhrase, accountTotalKeywords]);
  var lastRow = currentSheet.getLastRow();
  currentSheet.getRange(lastRow + ":" + lastRow).setFontWeight("bold");
  
  currentSheet.appendRow([" "]);
  currentSheet.appendRow(["AdWords Solutions by http://www.optmyzr.com"]);
  lastRow = currentSheet.getLastRow();
  currentSheet.getRange("A"+lastRow + ":E" + lastRow).merge().setBackgroundColor("Darkorange").setFontWeight("bold").setFontColor("White").setHorizontalAlignment("center");
  
  // Next Sheet
  var broadMatchData = getDataForMatchType("BROAD");
  var exactMatchData = getDataForMatchType("EXACT");
  var phraseMatchData = getDataForMatchType("PHRASE");
  
  currentSheet = workbook.insertSheet("Keyword match type performance");
  currentSheet.appendRow(["Match type", "Impressions", "Clicks", "CTR", "Cost (account currency)", "Cost Per Click", "Conversions",  "Conversion Rate", "Cost per Conversion"]);
  currentSheet.getRange("1:1").setFontWeight("bold");
  
  
  var impressions = broadMatchData[1]+exactMatchData[1]+phraseMatchData[1];
  var clicks = broadMatchData[2]+exactMatchData[2]+phraseMatchData[2];
  var cost = broadMatchData[4]+exactMatchData[4]+phraseMatchData[4];
  var conversions = broadMatchData[6]+exactMatchData[6]+phraseMatchData[6];
  var ctr = (impressions > 0)?(clicks/impressions):"NA";
  var costPerClick = (clicks >0)?(cost/clicks):"NA";
  var convRate = (conversions > 0)?(conversions/clicks):"NA";
  var cpconv = (conversions > 0)?(cost/conversions):"NA";
  
  currentSheet.appendRow(broadMatchData);
  currentSheet.appendRow(exactMatchData);
  currentSheet.appendRow(phraseMatchData);
  currentSheet.appendRow(["TOTAL", impressions, clicks, ctr, cost, costPerClick, conversions, convRate, cpconv]);
  
  currentSheet.getRange("B:B").setNumberFormat("#,##0"); // impressions
  currentSheet.getRange("C:C").setNumberFormat("#,##0"); // clicks
  currentSheet.getRange("D:D").setNumberFormat("0.00%"); // CTR
  currentSheet.getRange("E:E").setNumberFormat("#,##0.00"); // Cost
  currentSheet.getRange("F:F").setNumberFormat("#,##0.00"); // CPClick
  currentSheet.getRange("G:G").setNumberFormat("#,##0"); // Conversions
  currentSheet.getRange("H:H").setNumberFormat("0.00%"); // conv rate
  currentSheet.getRange("I:I").setNumberFormat("#,##0.00"); // CPConv
  
  lastRow = currentSheet.getLastRow();
  currentSheet.getRange(lastRow+":"+lastRow).setFontWeight("bold");
  
  currentSheet.appendRow([" "]);
  currentSheet.appendRow(["AdWords Solutions by http://www.optmyzr.com"]);
  lastRow = currentSheet.getLastRow();
  currentSheet.getRange("A"+lastRow + ":I" + lastRow).merge().setBackgroundColor("Darkorange").setFontWeight("bold").setFontColor("White").setHorizontalAlignment("center");
    
var chart = currentSheet.newChart()
    .setPosition(10, 1, 5, 5)
    .asColumnChart()   
    .setTitle("CTR for each Keyword Match Type")
    .setYAxisTitle("CTR")
    .addRange(currentSheet.getRange("A2:A5"))
    .addRange(currentSheet.getRange("D2:D5"))
    .build();
currentSheet.insertChart(chart);
  
  Logger.log("Success! File Name: '" + workbook.getName()+"'");
  Logger.log("Report Saved at " + workbook.getUrl());
  MailApp.sendEmail(EMAIL_ADDRESS, 
                    "[Report Ready] Account Level Keyword Match Type Analysys", 
                    "Hello!\r\n\r\nYour report 'Keyword Match Type Analysis' report is ready! You can see it on " 
                    + workbook.getUrl() + "\r\n\r\nThanks for running this script. \r\n\r\nAdWords Solutions on http://www.optmyzr.com");
}

function getDataForMatchType(matchType)
{
  var keyWords = AdWordsApp.keywords().withCondition("Status = ENABLED").withCondition("KeywordMatchType = " + matchType).get();
  var impressions = 0;
  var clicks = 0;
  var cost = 0;
  var conversions = 0;
   while(keyWords.hasNext())
    {
      var temp = keyWords.next();
      
      if(!temp.getAdGroup().isEnabled())
      {
        continue; 
      }
      
      var tempStats = temp.getStatsFor("LAST_30_DAYS");
      impressions += tempStats.getImpressions();
      clicks += tempStats.getClicks();
      cost += tempStats.getCost();
      conversions += tempStats.getConversions();
    }
  
  var ctr = (impressions > 0)?(clicks/impressions):"NA";
  var costPerClick = (clicks >0)?(cost/clicks):"NA";
  var convRate = (conversions > 0)?(conversions/clicks):"NA";
  var cpconv = (conversions > 0)?(cost/conversions):"NA";
  
  return [matchType, impressions, clicks, ctr, cost, costPerClick, conversions, convRate, cpconv];
  
}

function countNumberOfKeywordsMatchType(campaign, matchtype)
{
   var keywords = campaign.keywords().withCondition("Status = ENABLED").withCondition("KeywordMatchType = " + matchtype).get();
    var count = 0;
    while(keywords.hasNext())
    {
     var temp = keywords.next();
      count++;
    }
  return count;
  
}

function countNumberOfKeywords(campaign)
{
   var keywords = campaign.keywords().withCondition("Status = ENABLED").get();
    var count = 0;
    while(keywords.hasNext())
    {
     var temp = keywords.next();
      count++;
    }
  return count;
  
}

function countNumberOfAdGroups(campaign)
{
  var count = 0;
  var adGroups = campaign.adGroups().withCondition("Status = ENABLED").get();
    var count = 0;
    while(adGroups.hasNext())
    {
     var temp = adGroups.next();
      count++;
    }
  
  return count;
}