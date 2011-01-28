function go() {
	$("img[src$='after.gif']").each(function(i) {
		var votey = $(this).attr("src");

		$("img[src*='/comics/']").each(function(j) {
			if (i == j) return;
			var img = $("<img />").attr("src",votey);
			var div = $("<center></center>").append(img);
			$(this.nextSibling).before(div);
		});
	});
}

checkOption("smbc", go);
