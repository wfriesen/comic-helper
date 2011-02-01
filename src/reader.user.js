// ==UserScript==
// @name			Comic Helper
// @namespace		http://github.com/wfriesen/comic-helper
// @description		Adds content to web comic RSS feeds shown in Google Reader,
// including comics for feeds that don't include it, and hidden "easter egg" content
// @version			3.1.2
// @include			http://reader.google.com/reader/*
// @include			http://www.google.com/reader/*
// @require			https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js
// ==/UserScript==

var comics = {
		"http://xkcd.com/*" : "xkcd",
		"http://www.amazingsuperpowers.com/.*" : "asp",
		"http://feedproxy.google.com/~r/AbstruseGoose/*" : "ag",
		"http://www.boatcrime.com/*" : "bc",
		"http://feedproxy.google.com/~r/smbc-comics/*" : "smbc",
		"http://www.smbc-comics.com/*" : "smbc",
		"http://www.explosm.net/comics/*" : "ch",
		"http://feeds.penny-arcade.com/*" : "pa"
}
function is_comic(link) {
	for (var c in comics) {
		var test = new RegExp(c);
		if ( test.test(link) ) return comics[c];
	}
	return null;
}

function add_secrets(item_body, title, panel_src) {
	var div = $("<div />");
	if ( title ) div.append($("<p />").append(title));
	if ( panel_src ) div.append($("<img />").attr("src", panel_src));
	$(item_body).after(div);
}

function handle_response(item_body, title, xmlHttp) {
	var panel_src = null;
	try {
		var responseJSON = JSON.parse(xmlHttp.responseText);
		panel_src = responseJSON.panel;
	} catch (e) {
	}

	if (panel_src || title) {
		add_secrets(item_body, title, panel_src);
	}
}

function ajax_panel(comic, link, item_body, title) {
	link = "http://comic-helper.appspot.com/panel?comic="+comic+"&link="+link;
	var xmlHttp = new XMLHttpRequest();

	if (xmlHttp) {
		try {
			xmlHttp.open("GET",link,true);
			xmlHttp.onreadystatechange = function () {
				if (!(xmlHttp.readyState == 4)) return;
				if (xmlHttp.status == 200) handle_response(item_body, title, xmlHttp);
			}
			xmlHttp.send();
		} catch (e) {}
	}
}

function get_extras(comic, item_body, link) {
	link = encodeURIComponent(link);
	var title = null;
	switch (comic) {
		case "ag":
		case "bc":
		case "xkcd":
			title = $(item_body).find("img").attr("title");
			if (title) {
				add_secrets(item_body,title,null);
			}
			break;
		case "asp":
			title = $(item_body).find("img").attr("title");
		case "smbc":
		case "ch":
			ajax_panel(comic,link, item_body, title);
			break;
		case "pa":
			var div_html = $(item_body).find("div").html();
			var test = /New Comic/i;
			if (( div_html ) && ( test.test(div_html) )) {
				ajax_panel("pa",link, item_body, null);
			}
			break;
	}
}

var process_node = function(e) {
	var entry_main = null;
	var entry_title_link = null;
	var item_body = null;
	$(e.target).children("div").each(function() {
		$(this).find("div[class='entry-main']").each(function() {
			entry_main = this;
			$(entry_main).find("a[class='entry-title-link']").each(function() {
				entry_title_link = $(this).attr("href");
			});
			$(entry_main).find("div[class='item-body']").each(function() {
				item_body = this;
			});
		});
	});
	if ( !entry_main || !entry_title_link || !item_body ) return;

	var comic = is_comic(entry_title_link);
	if ( !comic ) return;

	get_extras(comic, item_body, entry_title_link);
}

document.body.addEventListener('DOMNodeInserted', process_node, false);
