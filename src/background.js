chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		sendResponse({option: localStorage[request.option]});
	}
);
