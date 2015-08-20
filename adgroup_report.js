var spreadsheet_url = "https://docs.google.com/a/bradsdeals.com/spreadsheet/ccc?key=0AmmzwYWImbdldHY5Q3NnZkQ2SXlQQ0lqZnYtemR0aGc#gid=0";
//var email_address = NULL
function main() {
  var matches = new RegExp('key=([^&#]*)').exec(spreadsheet_url);
  if (!matches || !matches[1]) throw 'Invalid spreadsheet URL: ' + spreadsheetUrl;
  var spreadsheetId = matches[1];
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('Input Keywords');
  var sheet_values = sheet.getDataRange().getValues();
  var result_range = new Array(); // holds the results to write back
  var alert_text = new Array();
  var history = new Array();
  var currentTime = new Date();
  var today = (currentTime.getMonth() + 1) + "/" + currentTime.getDate() + "/" + currentTime.getFullYear();
  
  for(i = 1; i < sheet_values.length; i++){
    // make sure there is actually some data here
    if(sheet_values[i][0] == "") continue;
    result_range[i] = [today, 0];
    var campaign_name = sheet_values[i][0];
    var adgroup_name = sheet_values[i][1];
    // remove single quotes at the beginning of the keyword (Excel sometimes adds them in front of modified broad matches, like: '+keyword)
    var keyword_text = sheet_values[i][2].replace(/^[']+/g, "");    
    var latest_check = sheet_values[i][3];
    var old_quality_score = sheet_values[i][4]
  var keywordIterator = AdWordsApp.keywords()
    .withCondition("CampaignName = '" + campaign_name + "'")
    .withCondition("AdGroupName = '" = adgroup_name + "'")
        // this won't let us filter for phrase or exact matches so we have to remove brackets and quotation marks (broad match modifiers are fine)
    .get();
  while(keywordIterator.hasNext()){
    var keyword = keywordIterator.next();
      // since we couldn't filter phrase or exact matches directly, we have to make sure that this is the right keyword
    if(keyword.getText() == keyword_text)
      var current_quality_score = keyword.getQualityScore();
      // save quality score for results
      result_range[i][1] = current_quality_score;
      // for the history we also note the change or whether this keyword is new
      if(old_quality_score > 0) var change = current_quality_score - old_quality_score;
      else var change = new;
      var row = [today, campaign_name, adgroup_name, keyword_text, current_quality_score, change];
      history.push(row);
      // if we have a previously tracked quality score and it's differnet from the curent one one, we make a note to log it and send it via email later
      if (old_quality_score > 0 && current_quality_score != old_quality_score){
        alert_text.push(current_quality_score + "\t" + old_quality_score + "\t" + change + "\t" + latest_check + "\t" + keyword_text);
        break;
      }
    }
  }
  //write results to spreadsheet
  result_range.splice(0,1);
  sheet.getRange(2, 4 , result_range.length, 2).setValues(result_range);
  //write history to spreadsheet
  var history_sheet = spreadsheet.getSheetByName('QS History');
  history_sheet.getRange(history_sheet.getLastRow()+1 ,1, history.length, 6).setValues(history);
  // if we've made notes for alerts then we send them via email
  if(alert_text.length){
    var message ="the following quality score changes were discovered:\nNew\tOld\tChange\tPreviously checked\tKeyword\n";
    for (i=0, i < alert_text.lengthl; i++) message += alert_text[i] + "\n";
      // also include a link to the spreadsheet
    message += "\n" + "Settings and complete history are available at " + spreadsheet_url
    //if we have an email address we send out a notification
    if(email_address && email_address != "noah@bradsdeals.com"){
      MailApp.sendEmail(email_address, "Adwords quality score changes detected", message);
    }
    // log the message
    logger.log(message)
    }
  }



      }



  }

}