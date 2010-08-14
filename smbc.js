for (i=0; i<document.images.length; i++) {
	if (document.images[i].getAttribute("src").indexOf("after.gif") != -1) {
		var votey = document.images[i].getAttribute("src");
		break;
	}
}

for (i=0; i<document.getElementsByTagName("img").length; i++) {
	if (document.getElementsByTagName("img")[i].src.indexOf("secretvoteybutton.gif") != -1) {
		document.getElementsByTagName("img")[i].src = votey;
		break;
	}
}

