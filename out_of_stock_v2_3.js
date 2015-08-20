
/***************************************
*Out of Stock Checker Script v2.3
*
*
*2.3 changes: Added Twilio capibility to send texts when there is a problem with a URL
******/

//variables needed for teh script
var spreadsheet_url = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/1IkFJkRhg39RNH_z_qVa-E6oN2Ne77E4ULpAszullAxM/edit#gid=2085496681";

var OUT_OF_STOCK_TEXT = "Expired";
var subject = "!!!!!!!EXPIRED DEALS!!!!!!!!";
var recipient = "noah@bradsdeals.com";
var results = "There was an expired deal at: ";
var sid = 'AC89b0d0c256dfcb83003c6fec10c1ca1e';
var auth = '0994ce37401cffb308f7084922075a5e';
var client = new Twilio(sid,auth);

function main() {
	//put a spreadsheet range into an array
	var iter = buildSelector();
	for (var i = 0; i < iter.length; i++) {
		//iterate through the range to create urls to fetch
		var deal = iter[i];
		//get the source of an item in the array
		htmlCode = UrlFetchApp.fetch(deal).getContentText();
		//check the source for text
		if (htmlCode.indexOf(OUT_OF_STOCK_TEXT) >= 0) {
			//send an email if expired
			MailApp.sendEmail(recipient, subject, results+entity);
			//send a text if expired
			client.sendMessage('+14124179263','+13123136668',"This Deal Has Expired: "+deal)
        	//log the expired urls. mostly here as a debugger
        	Logger.log("this is expired: "+deal);
		} else {
			//log the good urls. mostly here as a debugger
			Logger.log(deal+" is good")
		}
	} 
}



function buildSelector () {
	var spreadsheet = SpreadsheetApp.openByUrl(spreadsheet_url);
	var sheet = spreadsheet.getRangeByName('Active_Deals');
	var selector = new Array();
	var sheet_values = sheet.getValues();
	for (var i = 0; i < sheet_values.length; i++) {
		//if(sheet_values[i][0] == ""){
			//continue
			//var selector = sheet_values;
		//}
			var selector = sheet_values
	}
	return selector;
	//Logger.log(selector);
}

function Twilio(accountSid, authToken) {
  this.ACCOUNT_SID = accountSid;
  this.AUTH_TOKEN = authToken;
   
  this.MESSAGES_ENDPOINT = 'https://api.twilio.com/2010-04-01/Accounts/'+this.ACCOUNT_SID+'/Messages.json';
  this.CALLS_ENDPOINT = 'https://api.twilio.com/2010-04-01/Accounts/'+this.ACCOUNT_SID+'/Calls.json';
 
  this.sendMessage = function(to,from,body) {
    var httpOptions = {
      method : 'POST',
      payload : {
        To: to,
        From: from,
        Body: body
      },
      headers : getBasicAuth(this)
    };
    var resp = UrlFetchApp.fetch(this.MESSAGES_ENDPOINT, httpOptions).getContentText();
    return JSON.parse(resp)['sid'];
  }
   
  this.makeCall = function(to,from,whatToSay) {
    var url = 'http://proj.rjsavage.com/savageautomation/twilio_script/dynamicSay.php?alert='+encodeURIComponent(whatToSay);
    var httpOptions = {
      method : 'POST',
      payload : {
        To: to,
        From: from,
        Url: url
      },
      headers : getBasicAuth(this)
    };
    var resp = UrlFetchApp.fetch(this.CALLS_ENDPOINT, httpOptions).getContentText();
    return JSON.parse(resp)['sid'];
  
   
  function getBasicAuth(context) {
    return {
      'Authorization': 'Basic ' + Utilities.base64Encode(context.ACCOUNT_SID+':'+context.AUTH_TOKEN)
    };
  }
}

