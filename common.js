/*
	Locate the first image to contain a given string.
	Returns an array of the images title, and the image itself.
	If a matching image is not found, it will return as a blank title,
	along with the last image searched.
*/
function grabTitle(srcString) {
	var title = "";
	images = document.images;
	for (i=0; i<images.length; i++) {
		if (images[i].getAttribute("src").indexOf(srcString) != -1) {
			if (images[i].hasAttribute("title")) {
				title = images[i].getAttribute("title");
			}
			break;
		}
	}
	return [title,document.images[i]];
}

/*
	Simple way to add title text below a given image. For some comics, calling this with
	the output of grabTitle is all that's needed
*/
function addTitle(info) {
	var title = info[0];
	var image = info[1];
	var div = document.createElement("div");
	div.innerHTML = title;
	image.parentNode.insertBefore(div,image.nextSibling);
}

function grabAndAdd(string) {
	addTitle(grabTitle(string));
}
