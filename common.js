function grabTitle(srcString) {
/*
	Locate the first image to contain a given string.
	Returns an array of the images title, and the image itself.
	null values are returned if no matching image is found
*/
	var image = null;
	images = document.images;
	for (i=0; i<images.length; i++) {
		if (!images[i].hasAttribute("src")) continue;
		if (images[i].getAttribute("src").indexOf(srcString) != -1) {
			image = document.images[i];
			if (image.hasAttribute("title")) {
				return [image.getAttribute("title"),image];
			} else return [null, image];
		}
	}
	return [null,null];
}

function addTitle(info) {
/*
	Simple way to add title text below a given image. For some comics,
	calling this with the output of grabTitle is all that's needed
*/
	var title = info[0];
	var image = info[1];
	var div = document.createElement("div");
	div.innerHTML = title;
	image.parentNode.insertBefore(div,image.nextSibling);
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
