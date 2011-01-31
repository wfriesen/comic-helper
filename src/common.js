function getTitleImage (srcString, needsTitle) {
/*
	Locate the first image whose src attribute contains srcString.
	needsTitle is a boolean (defaults to true), and causes the function
	to only return the image if it contains a "title" attribute, otherwise
	it returns null
*/
	if ( needsTitle == undefined ) needsTitle = true;
	var image = null;
	$("img[src*='"+srcString+"']").each(function(i) {
		if ( !needsTitle || this.hasAttribute("title") ) {
			image = this;
		}
	});
	return image;
}

function addTitle(image) {
/*
	Simple way to add title text below a given image. For some comics,
	calling this with the output of getTitleImage is all that's needed
*/
	var div = $("<div />").append($(image).attr("title"));
	$(image).after(div);
}

function grabAndAdd(srcString) {
/*
	Puts together the getTitleImage and addTitle functions, allowing some
	comics to be coded in just this one function call
*/
		var titleImage = getTitleImage(srcString);
		if ( titleImage != null ) addTitle(titleImage);
}

function checkOption(name, cb) {
/*
	Send a request to background.html to retrieve variable 'name'
	from localStorage. If it is "true", then call the callback
	function cb
*/
	chrome.extension.sendRequest({option: name}, function(response) {
		if ( !response.option || response.option == "true" ) {
			cb();
		}
	});
}
