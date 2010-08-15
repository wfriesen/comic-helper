function addSecrets(image, panel, text) {
	image = image.parentNode;
	var panelElement = document.createElement("img");
	panelElement.setAttribute("src",panel);
	image.appendChild(document.createElement("br"));
	image.appendChild(panelElement);
	image.appendChild(document.createElement("br"));
	var p = document.createElement("p");
	p.innerHTML = text;
	image.appendChild(p);
	image.setAttribute("bgcolor","#f5f4d1");
}

for (i=0; i<document.images.length; i++) {
	var image = document.images[i];
	if (image.getAttribute("src").indexOf("ASPeasteregg.png") != -1) {
		var panel = image.parentNode.getAttribute("href");

		for (i=0; i<document.images.length; i++) {
			var image = document.images[i];
			if (image.getAttribute("src").indexOf("/comics/") != -1) {
				var text = image.getAttribute("title");

				addSecrets(image, panel, text);

				break;
			}
		}
		break;
	}
}
