function addSecrets(image, panel, text) {
	$(image).after(
		$("<div />").append(
			$("<br />"),
			$("<img />").attr("src",panel),
			$("<br />"),
			$("<p />").append(text)
		)
	);
	$(image.parentNode).attr("bgcolor","#f5f4d1");
}

function go() {
	var image = getTitleImage("/comics/");
	if ( image != null ) {
		var title = $(image).attr("title");
		var egg = getTitleImage("ASPeasteregg.png", false);
		if (egg != null) {
			var panel = $(egg.parentNode).attr("href");
			addSecrets(image, panel, title);
		}
	}
}

checkOption("asp", go);
