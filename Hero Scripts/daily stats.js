/**********************************
* 
*
*
*
**********************************/
//ENTER your e-mail address below between quotation marks. This script will notify you by email when complete. 
var eMail = "username@email.com";

//--------------------------------------------------------------------------- 
//CHANGING ANY OF THE CODE BELOW COULD BREAK SCRIPT! CHANGE AT YOUR OWN RISK! 
//---------------------------------------------------------------------------

function main() {

    var accountName = AdWordsApp.currentAccount().getName();

    var spreadsheet = SpreadsheetApp.create("Daily Stats " + accountName); 
    var sheet = spreadsheet.getActiveSheet();

    formatSpreadSheet(sheet, accountName); 
    getAllCampaigns(sheet);

    //creates and sends email 
    var subject = "Daily Stats for " + accountName; 
    var body = "Your daily stats have been posted to: " + spreadsheet.getUrl(); 
    MailApp.sendEmail(eMail, subject, body); 
}

//cycles through campaigns and calculates values 

function getAllCampaigns(sheet) { 
    var campaignIterator = AdWordsApp.campaigns().get();

    var today = new Date();

    // due to data gathering limitations, these variables are the metrics 
    // for the last two full days. 
    var dayPrevious = getDataFromPast(1); 
    var prevPrev = getDataFromPast(2);

    while (campaignIterator.hasNext()) { 
        var campaign = campaignIterator.next(); 
        var campaignName = campaign.getName() ? campaign.getName() : '--';

        //intialize variables to 0 
        var totalCost = 0; 
        var totalCost2 = 0; 
        var totalConversions = 0; 
        var totalConversions2 = 0; 
        var cpa = 0; 
        var cpa2 = 0; 
        var changeCPA = 0; 
        var changeSpend = 0;

        var stats = campaign.getStatsFor(dayPrevious, dayPrevious); 
        var stats2 = campaign.getStatsFor(prevPrev, prevPrev);

        //day 1 stats 
        totalCost += stats.getCost(); 
        totalConversions += stats.getConversions();

        //check if yesterdays conversions were zero 
        //if so make cpa in spreadsheet zero to avoid error read out. 
        if (totalConversions == 0) { 
            cpa = 0; 
        } else { 
            cpa = totalCost / totalConversions; 
        }

        //day 2 stats 
        totalCost2 += stats2.getCost(); 
        totalConversions2 += stats2.getConversions();

        //check if conversions two days ago were zero 
        //if so make cpa in spread zero to avoid error read out. 
        if (totalConversions2 == 0) { 
            cpa = 0; 
        } else { 
            cpa2 += totalCost2 / totalConversions2; 
        }

        //change in cpa 
        if ((totalConversions == 0) || (totalConversions2 == 0)) { 
            changeCPA = 0; 
        } else { 
            changeCPA = ((cpa - cpa2) / cpa2) * 100; 
        }

        //change in spend 
        if ((totalCost == 0) && (totalCost2 == 0)) { 
            changeSpend = 0; 
        } else { 
            changeSpend = ((totalCost - totalCost2) / totalCost2) * 100; 
        }

        //fill in row  with campaign data 
        var row = [ 
            campaignName, 
            changeCPA + "%", 
            changeSpend + "%", 
            "$" + cpa, 
            "$" + cpa2, 
            "$" + totalCost, 
            "$" + totalCost2, 
            totalConversions, 
            totalConversions2 
        ];

        sheet.appendRow(row); 
    } 
}

//spreadsheet formatting

function formatSpreadSheet(sheet, accountName) {

    //sets font for entire spreadsheet 
    var cell = sheet.getRange("A:I"); 
    cell.setFontFamily("Lato"); 
    cell.setFontSize("10");

    // Centers Columns B:G 
    var cell = sheet.getRange("B:I"); 
    cell.setHorizontalAlignment("center");

    //Add a title to the spreadsheet 
    sheet.getRange("A2").setValue("Hero Pro: Daily Stats"); 
    sheet.getRange("A2:I2").setBackground("#34495E"); 
    sheet.getRange("A2:I2").setFontColor("White"); 
    sheet.getRange("A2:I2").setFontSize("14");

    //grabs todays date and puts it in cell A1 
    var today = new Date(); 
    today.getDate(); 
    Utilities.formatDate(today, "PST", "yyyyMMdd"); 
    var range = sheet.getRange("A1:A1").setValue(today); 
    range.setFontStyle("italic");

    //Shows account name in cell E2 
    var range = sheet.getRange("B2:B2").setValue(accountName); 
    range.setFontColor("White"); 
    range.setFontSize("14");

    //Add spreadsheet column categories 
    sheet.getRange("A4").setValue("Campaign"); 
    sheet.getRange("B4").setValue("CPA Change"); 
    sheet.getRange("C4").setValue("Cost Change"); 
    sheet.getRange("D4").setValue("CPA (1 Day Ago)"); 
    sheet.getRange("E4").setValue("CPA (2 Days Ago"); 
    sheet.getRange("F4").setValue("Cost (1 Day Ago)"); 
    sheet.getRange("G4").setValue("Cost (2 Days Ago)"); 
    sheet.getRange("H4").setValue("Conv. (1 Day Ago)"); 
    sheet.getRange("I4").setValue("Conv. (2 Days Ago)");

    //Set formatting for column categories 
    var range = sheet.getRange("A4:I4"); 
    range.setFontColor("White"); 
    range.setBackground("#7492af"); 
    range.setFontSize("10"); 
    sheet.setColumnWidth(1, 200); //campaign 
    sheet.setColumnWidth(2, 110); //change in cpa 
    sheet.setColumnWidth(3, 110); //change in spend 
    sheet.setColumnWidth(4, 110); //cpa 1 day ago 
    sheet.setColumnWidth(5, 110); //cpa 2 days ago 
    sheet.setColumnWidth(6, 110); //cost 1 day ago 
    sheet.setColumnWidth(7, 110); //cost 2 days ago 
    sheet.setColumnWidth(8, 110); //conversions 1 day ago 
    sheet.setColumnWidth(9, 110); //conversions 2 days ago 
}

// takes the input and moves the date back X number of days, 
// returns in the required YYYYMMDD format

function getDataFromPast(numDays) { 
    var today = new Date(); 
    today.setDate(today.getDate() - numDays); 
    return Utilities.formatDate(today, "GMT", "yyyyMMdd"); 
}