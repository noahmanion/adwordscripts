function main() {
    /*
     * *************** Prepare the spreadsheet ****************
     */
    // The URL of the template spreadsheet
    var spreadsheetUrl = "YOUR_TEMPLATE_URL";
 
    // Open the template spreadsheet
    var templateSpreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
 
    // Get the name of the previous month
    var monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    var today = new Date();
    today.setMonth(today.getMonth() - 1);
    var month = monthNames[today.getMonth()] + ", " + today.getFullYear();
 
    // Create a new copy to hold this month's report
    var newSpreadsheetName = "AdWords Performance Report: " + month;
    var spreadsheet = templateSpreadsheet.copy(newSpreadsheetName);
 
    // Get the sheet that holds the data
    var sheetName = "Keyword Data";
    var sheet = spreadsheet.getSheetByName(sheetName);
 
    // Make sure the data sheet is clear
    sheet.clear();
 
    // Add the report date to the data sheet
    sheet.getRange(1, 10).setValue("Report Date:");
    sheet.getRange(1, 11).setValue(month);
 
    /*
     * *********** Export the report from AdWords **************
     */
    // The fields to retrieve from the API
    var fields = [
        "KeywordText", "KeywordMatchType", "Impressions", "Clicks",
        "Cost", "AveragePosition", "Conversions", "ConversionValue"
    ];
 
    // Define the report
    var awql = "SELECT " + fields.join(",") +
            " FROM KEYWORDS_PERFORMANCE_REPORT " +
            " DURING LAST_MONTH";
 
    // Additional reporting API options        
    var reportOptions = {
        includeZeroImpressions: false,
        apiVersion: 'v201302'
    };
 
    // Generate the report and extract its rows
    var reportRows = AdWordsApp.report(awql, reportOptions).rows();
 
    /*
     * ********** Import the data into the spreadsheet **************
     */
 
    // An array to hold the rows to insert into the report
    var rows = [];
 
    // Add field names as a header row
    rows.push(fields);
 
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
    range.sort({column: 4, ascending: false});
}