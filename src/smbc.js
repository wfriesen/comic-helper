function go() {
	images = document.images;
	for (i=0; i<images.length; i++) {
		if (images[i].getAttribute("src").indexOf("after.gif") != -1) {
			var votey = images[i].getAttribute("src");

			for (j=0; j<images.length; j++) {
				if (images[j].getAttribute("src").indexOf("/comics/") != -1 && i != j) {
					var div = document.createElement("center");
					var img = document.createElement("img");
					img.setAttribute("src",votey);
					div.appendChild(img);

					images[j].parentNode.insertBefore(div,images[j].nextSibling);
					break;
				}
			}
			break;
		}
	}
}

checkOption("smbc", go);
