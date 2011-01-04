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

function go() {
	var info = grabTitle("/comics/");
	if (info[0] != null && info[1] != null) {
		var title = info[0];
		var image = info[1];

		var egg = grabTitle("ASPeasteregg.png")[1];
		if (egg != null) {
			var panel = egg.parentNode.getAttribute("href");
			addSecrets(image, panel, title);
		}
	}
}

checkOption("asp", go);
