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
		var src = $(image).attr("src");
		var re = new RegExp(/http:\/\/www\.amazingsuperpowers\.com\/comics\/(\d{4}-\d{2}-\d{2})-.*\.png/);
		var match = re.exec(src);
		if (match != null) {
			panel = "http://www.amazingsuperpowers.com/hc/comics/" + match[1] + ".jpg";
			addSecrets(image, panel, title);
		}
	}
}

checkOption("asp", go);
