/**********************************
* 
*
*
*
**********************************/
function main() {

// Set Email address 
// You can add as many emails as needed. 
// E.g. "example@example.com, example@example.com, example@example.com"

  var eMail = "example@example.com"

// Set pecentage Increase/Decrease Alerts

  var imprChangeHigh = 1.20; //20% Increase 
  var imprChangeLow = 0.80; //20% Decrease 

  var totalCostHigh = 1.20; //20% Increase 
  var totalCostLow = 0.80; //20% Decrease 

  var totalConvHigh = 1.30; //30% Increase 
  var totalConvLow = 0.70; //30% Decrease 
  var accountName = AdWordsApp.currentAccount().getName();

  //create a date object 
  var today = new Date(); 

  // takes the input and moves the date back X number of days, 
  // returns in the required YYYYMMDD format. 
  function getDataFromPast(numDays) { 
    var today = new Date(); 
    today.setDate(today.getDate()-numDays); 
    return Utilities.formatDate(today, "GMT", "yyyyMMdd"); 
  } 

  // due to data gathering limitations, these variables are the metrics for the last two full days. 
  var dayPrevious = getDataFromPast(1); 
  var prevPrev = getDataFromPast(2); 


  // declares the iterator and initializes the needed variables 
  var campaignsIterator = AdWordsApp.campaigns() 
  .forDateRange('TODAY') 
  .get(); 

  var impressions = 0; 
  var impressions2 = 0; 
  var totalCost = 0; 
  var totalCost2 = 0; 
  var totalConversions = 0; 
  var totalConversions2 = 0; 

  var impressionTest = false; 
  var conversionTest = false; 
  var costTest = false; 

  // compiles the total stats across all campaigns for the past two days 
  while (campaignsIterator.hasNext()) { 
    var campaign = campaignsIterator.next(); 
    var stats = campaign.getStatsFor(dayPrevious, dayPrevious); 
    var stats2 = campaign.getStatsFor(prevPrev, prevPrev); 

    // day 1 stats 
    impressions += stats.getImpressions(); 
    totalCost += stats.getCost(); 
    totalConversions += stats.getConversions(); 

    // day 2 stats 
    impressions2 += stats2.getImpressions(); 
    totalCost2 += stats2.getCost(); 
    totalConversions2 += stats2.getConversions(); 
  } 

  // checks if KPI's total impressions have varied by a certain percentage over the last day. 

  if (impressions >= (impressions2 * imprChangeHigh)||impressions <= (impressions2 * imprChangeLow)) 
    { 
    impressionTest = true; 
    var recipient = eMail; 
    var subject = "Hero Pro Impression Alert: "+ accountName; 
    var body = "The account has recieved a 20% change in impressions over the last day. Check the account for any unwanted issues"; 

    MailApp.sendEmail(recipient, subject, body);

    Logger.log('The account has recieved a 20% change in impressions over the last day. Check the account for any unwanted issues'); 
    } 
  if (totalCost >= (totalCost2 * totalCostHigh) || totalCost <= (totalCost2 * totalCostLow)) { 
    costTest = true; 
    var recipient = eMail; 
    var subject = "Hero Pro Total Spend Alert: "+ accountName; 
    var body = "The account has recieved a 20% change in total spend over the last day. Check the account for any unwanted issues";

    MailApp.sendEmail(recipient, subject, body); 

    Logger.log('The account has recieved a 20% change in total cost over the last day. Check the account for any unwanted issues'); 
  } 

  if (totalConversions >= (totalConversions2 * totalConvHigh) || totalConversions <= (totalConversions2 * totalConvLow)) { 
    conversionTest = true; 
    var recipient = eMail; 
    var subject = "Hero Pro Conversion Alert: "+ accountName; 
    var body = "The account has recieved a 30% change in conversions over the last day. Check the account for any unwanted issues"; 

    MailApp.sendEmail(recipient, subject, body); 

    Logger.log('The account has recieved a 30% change in conversions over the last day. Check the account for any unwanted issues'); 
  } 

  if ((costTest == false)&&(impressionTest == false)&&(conversionTest == false)){ 
    var recipient = eMail; 
    var subject = "Hero Pro Update: "+ accountName; 
    var body = "There were not major deviations in metrics over the past day."; 

    MailApp.sendEmail(recipient, subject, body); 

    Logger.log('Everything is going well!'); 
  } 
};