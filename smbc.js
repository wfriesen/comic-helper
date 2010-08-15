for (i=0; i<document.images.length; i++) {
	if (document.images[i].getAttribute("src").indexOf("after.gif") != -1) {
		var votey = document.images[i].getAttribute("src");

		for (i=0; i<document.getElementsByTagName("img").length; i++) {
			if (document.getElementsByTagName("img")[i].src.indexOf("secretvoteybutton.gif") != -1) {
				var e = document.getElementsByTagName("img")[i];
				while (e.tagName.toLowerCase() != "table") e = e.parentNode;
				e = e.parentNode;
				var voteyElement = document.createElement("img");
				voteyElement.setAttribute("src",votey);
				e.insertBefore(voteyElement);
			}
		}
		break;
	}
}

