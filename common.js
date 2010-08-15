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
