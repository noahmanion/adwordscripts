function main(){
	var spreadsheetUrl = "https://docs.google.com/a/bradsdeals.com/spreadsheets/d/1SEA7gEvFwhLffvE_qiUJG7DBWaAtm5-1bhN3_qH8tdY/edit#gid=0";
    var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var sheetName = "Sheet1";
    var sheet = SpreadsheetApp.openByUrl(spreadsheet_url).getActiveSheet();
    sheet.appendRow(columns);

	/*
     * *********** Export the report from AdWords **************
     */
    // The fields to retrieve from the API
    var fields = [
        "HourOfDay", "Date", "CampaignName", "AdGroupName", "Clicks", "Impressions", "Ctr", "AverageCpc", "Cost", "Conversions", "CostPerConversion"
    ];
 
    // Define the report
    var awql = "SELECT " + fields.join(",") +
            " FROM ADGROUP_PERFORMANCE_REPORT " +
            " DURING TODAY";
 /*
     Additional reporting API options        
    var reportOptions = {
        includeZeroImpressions: false,
        apiVersion: 'v201302'
    };
 */
    // Generate the report and extract its rows
    var reportRows = AdWordsApp.report(awql).rows();
 
    /*
     * ********** Import the data into the spreadsheet **************
     */
 
    // An array to hold the rows to insert into the report
    var rows = [];
 
    /* Add field names as a header row
    rows.push(fields); */
 
    // Iterate over the report rows
    for (var rowNum = 0; reportRows.hasNext(); rowNum++) {
        // Construct the row
        var reportRow = reportRows.next();
        var row = [];
        for (var colNum = 0; colNum < fields.length; colNum++) {
            row.push(reportRow[fields[colNum]]);
        }
        rows.push(row);
    }
 
    // Get the cells to hold the keyword data
    var range = sheet.getRange(1, 1, rows.length, fields.length);
 
    // Add the rows to the spreadsheet
    range.setValues(rows);
 
    // Sort the rows by the number of clicks
  range.sort({column: 1, ascending: true});
  range.sort({column: 2, ascending: true});
  range.sort({column: 4, ascending: true});
  range.sort({column: 3, ascending: true});
}