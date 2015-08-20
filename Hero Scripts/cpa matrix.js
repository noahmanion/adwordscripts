/**********************************
* 
*
*
*
**********************************/
function main() {

  //SET CPA GOAL HERE 
  var cpaTarget = 10;

  var CPA_THRESHOLD = cpaTarget;

  var spreadsheet = SpreadsheetApp.create("CPA Matrix"); 
  var sheet = spreadsheet.getActiveSheet(); 
  var accountName = AdWordsApp.currentAccount().getName();

  function getDataFromPast(numDays) { 
    var today = new Date(); 
    today.setDate(today.getDate() - numDays); 
    return Utilities.formatDate(today, "GMT", "yyyyMMdd"); 
  }

  var day1 = getDataFromPast(90); 
  var day2 = getDataFromPast(1);

  sheet.getRange("A4").setValue("Keyword"); 
  sheet.getRange("B4").setValue("Campaign"); 
  sheet.getRange("C4").setValue("Ad Group"); 
  sheet.getRange("D4").setValue("Conversions"); 
  sheet.getRange("E4").setValue("CPA"); 
  sheet.getRange("F4").setValue("Condition");

  var range = sheet.getRange("A4:G4"); 
  range.setFontColor("White"); 
  range.setBackground("#7492af"); 
  range.setFontSize("10"); 
  sheet.setColumnWidth(1, 160); //Keyword 
  sheet.setColumnWidth(2, 160); //Campaign 
  sheet.setColumnWidth(3, 160); //AdGroup 
  sheet.setColumnWidth(4, 120); //Conversions 
  sheet.setColumnWidth(5, 80); //CPA 
  sheet.setColumnWidth(6, 120); //Condition

  var cell = sheet.getRange("A:J"); //sets font for entire spreadsheet 
  cell.setFontFamily("Lato"); 
  cell.setFontSize("10");

  var cell = sheet.getRange("D:E"); // Centers Columns D:E 
  cell.setHorizontalAlignment("center");

  var today = new Date(); //grabs todays date and puts it in cell A1 
  today.getDate(); 
  Utilities.formatDate(today, "PST", "yyyyMMdd"); 
  var range = sheet.getRange("A1:A1").setValue(today); 
  range.setFontStyle("italic");

  var range = sheet.getRange("A2:G2").setBackground("#34495E"); //sets cell background color

  var range = sheet.getRange("F2:F2").setValue(accountName); //Shows account name in cell H2 
  range.setFontColor("White"); 
  range.setFontSize("14");

  var range = sheet.getRange("A2:A2").setValue("Hero Pro: CPA Matrix"); 
  range.setFontColor("White"); 
  range.setFontSize("14");

  //create storage arrays 
  var t1 = []; 
  var t2 = []; 
  var t3 = []; 
  var t4 = []; 
  var t5 = []; 
  var t6 = [];

  var keywordIterator = AdWordsApp.keywords().withCondition("Cost > 8").forDateRange("LAST_30_DAYS").get();

  //loop them all 
  while (keywordIterator.hasNext()) { 
    var keyword = keywordIterator.next();

    //change the date below if you are using a predefined date range 
    var stats = keyword.getStatsFor("LAST_30_DAYS");

    //use the line below if you want to use a custom date range 
    //If you use the line below, make sure to add // before the var stats =.. above. Otherwise they will conflict. 
    //var stats = keyword.getStatsFor(day1,day2);

    var keywordConv = stats.getConversions(); 
    var keywordCost = stats.getCost(); 
    var keywordCPA = (keywordCost / keywordConv).toFixed(2); 
    var added = false;

    if ((keywordCPA > (CPA_THRESHOLD * 4.5)) && (keywordConv > 1)) { 
      t4.push([ 
        " " + keyword.getText(), keyword.getCampaign().getName(), keyword.getAdGroup().getName(), keywordConv, keywordCPA 
      ]); 
    } else if ((keywordCPA > (CPA_THRESHOLD * 3.5)) && (keywordConv > 2)) { 
      t3.push([ 
        " " + keyword.getText(), keyword.getCampaign().getName(), keyword.getAdGroup().getName(), keywordConv, keywordCPA 
      ]);

    } else if ((keywordCPA > (CPA_THRESHOLD * 2.5)) && (keywordConv > 3)) { 
      t2.push([ 
        " " + keyword.getText(), keyword.getCampaign().getName(), keyword.getAdGroup().getName(), keywordConv, keywordCPA 
      ]);

    } else if ((keywordCPA > (CPA_THRESHOLD * 1.5)) && (keywordConv > 4)) { 
      t1.push([ 
        " " + keyword.getText(), keyword.getCampaign().getName(), keyword.getAdGroup().getName(), keywordConv, keywordCPA 
      ]);

    } else if ((keywordCost > (CPA_THRESHOLD * 5)) && (keywordConv === 0)) { 
      t5.push([ 
        " " + keyword.getText(), keyword.getCampaign().getName(), keyword.getAdGroup().getName(), keywordConv, keywordCost 
      ]);

    } else { 
      t6.push(keyword); 
    } 
  }

  for (var i = 0; i < t1.length; i++) { 
    var piece1 = t1[i]; 
    sheet.appendRow([ 
      piece1[0], piece1[1], piece1[2], piece1[3], piece1[4], "CPA > 1.5x with >4 Conversions" 
    ]);

  } 
  for (var j = 0; j < t2.length; j++) { 
    var piece2 = t2[j]; 
    sheet.appendRow([ 
      piece2[0], piece2[1], piece2[2], piece2[3], piece2[4], "CPA > 2.5x with >3 Conversions" 
    ]); 
  } 
  for (var k = 0; k < t3.length; k++) { 
    var piece3 = t3[k]; 
    sheet.appendRow([ 
      piece3[0], piece3[1], piece3[2], piece3[3], piece3[4], "CPA > 3.5x with >2 Conversions" 
    ]); 
  }

  for (var l = 0; l < t4.length; l++) { 
    var piece4 = t4[l]; 
    sheet.appendRow([ 
      piece4[0], piece4[1], piece4[2], piece4[3], piece4[4], "CPA > 4.5x with >1 Conversion" 
    ]); 
  }

  for (var z = 0; z < t5.length; z++) { 
    var piece5 = t5[z]; 
    sheet.appendRow([ 
      piece5[0], piece5[1], piece5[2], piece5[3], piece5[4], "Spent 5x CPA With No Conversions" 
    ]); 
  } 
}