images = document.images;
for (i=0; i<images.length; i++) {
	if (images[i].getAttribute("src").indexOf("/comics/") != -1) {
		var title = images[i].getAttribute("title");

		var div = document.createElement("div");
		div.innerHTML = title;

		images[i].parentNode.insertBefore(div,images[i].nextSibling);
		break;
	}
}
