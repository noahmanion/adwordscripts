//code.js
function doGet() {
	var html = HtmlService.createTemplateFromFile("textbrowser").evaluate();
	html.setTitle("Text Browser = Digital Inspiration")
	return html;	
}

function getHtml(url) {
	try {
		var response = UrlFetchApp.fetch(url);
	} catch(e) {
		return "Sorry but Google couldn't fetch the requested web page. "
		+ "Please Try another URL!<br />"
		+ "<small>" + e.toString() + "</small>"
	}
	return resonse.getContentText();
}