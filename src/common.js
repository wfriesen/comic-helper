function grabTitle(srcString) {
/*
	Locate the first image to contain a given string.
	Returns an array of the images title, and the image itself.
	null values are returned if no matching image is found
*/
	var image = null;
	var title = null;
	$("img[src*='"+srcString+"']").each(function(i) {
		image = this;
		if (image.hasAttribute("title")) {
			title = image.getAttribute("title");
		}
	});
	return [title, image];
}

function addTitle(info) {
/*
	Simple way to add title text below a given image. For some comics,
	calling this with the output of grabTitle is all that's needed
*/
	var title = info[0];
	var image = info[1];
	var div = $("<div />").append(title);
	$(image.nextSibling).before(div);
}

function grabAndAdd(string) {
/*
	Puts together the grabTitle and addTitle functions, allowing some comics
	to be coded in just this one function call
*/
	var info = grabTitle(string);
	if (info[0] == null || info[1] == null) return;
	else addTitle(info);
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
