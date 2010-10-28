function getChildByClassName(className, parent) {
	/*
	Search the children of parent recursively, returning the first element
	that has the given className
	*/
	for (var i=0; i<parent.childNodes.length; i++) {
		if (parent.childNodes[i].className == className) return parent.childNodes[i];
		if (parent.childNodes[i].hasChildNodes()) {
			var childNodes = getChildByClassName(className,parent.childNodes[i]);
			if (childNodes) return childNodes;
		}
	}
	return null;
}

function getChildByTagName(tagName, parent) {
	/*
	Search the children of parent recursively, returning the first element
	that has the given tagName
	*/
	for (var i=0; i<parent.childNodes.length; i++) {
		if (parent.childNodes[i].tagName.toLowerCase() == tagName ) return parent.childNodes[i];
		if (parent.childNodes[i].hasChildNodes()) {
			var childNodes = getChildByTagName(tagName,parent.childNodes[i]);
			if (childNodes) return childNodes;
		}
	}
	return null;
}

function get_entry_main(element) {
	entryTest = new RegExp("entry entry-\d*");
	if ( !entryTest.test(element.className) ) return null;

	var main = getChildByClassName("entry-main",element);
	if (!main) return null;
	else return main;
}

function get_item_body(entry_main) {
	var item_body = getChildByClassName("item-body",entry_main);
	if (!item_body) return null;
	else return item_body;
}

function get_entry_title_link(entry_main) {
	var link = getChildByClassName("entry-title-link",entry_main);
	if (!link || !link.hasAttribute("href")) return null;
	else return link.getAttribute("href");
}

var comics = new Array();
comics["http://xkcd.com/\d*"] = "xkcd";
comics["http://www.amazingsuperpowers.com/.*"] = "asp";
comics["http://feedproxy.google.com/~r/AbstruseGoose/*"] = "ag";
comics["http://www.boatcrime.com/*"] = "bc";
comics["http://www.smbc-comics.com/*"] = "smbc";
comics["http://www.explosm.net/comics/*"] = "ch";
comics["http://feeds.penny-arcade.com/*"] = "pa";
function is_comic(link) {
	for (var c in comics) {
		var test = new RegExp(c);
		if ( test.test(link) ) return comics[c];
	}
	return null;
}

function add_secrets(item_body, title, panel_src) {
	var secrets = document.createElement("div");
	if (title) {
		var p = document.createElement("p");
		p.innerHTML = title;
		secrets.appendChild(p);
	}

	if (panel_src) {
		var panel = document.createElement("img");
		panel.setAttribute("src",panel_src);
		secrets.appendChild(panel);
	}

	if (secrets.hasChildNodes()) item_body.appendChild(secrets);
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

function ajax_panel(link, item_body, title) {
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
	var p = document.createElement("p");
	switch (comic) {
		case "ag":
		case "bc":
		case "xkcd":
			var title = getChildByTagName("img",item_body).getAttribute("title");
			if (title) {
				p.innerHTML = title;
				add_secrets(item_body,title,null);
			}
			break;
		case "asp":
			var title = getChildByTagName("img",item_body).getAttribute("title");
			ajax_panel("http://comic-helper.appspot.com/asp?link="+link, item_body, title);
			break;
		case "smbc":
			ajax_panel("http://comic-helper.appspot.com/smbc?link="+link, item_body, null);
			break;
		case "ch":
			ajax_panel("http://comic-helper.appspot.com/ch?link="+link, item_body, null);
			break;
		case "pa":
			var div = getChildByTagName("div", item_body);
			var test = /New Comic/i;
			if (( div ) && ( test.test(div.innerHTML) )) {
				ajax_panel("http://comic-helper.appspot.com/pa?link="+link, item_body, null);
			}
			break;
	}
}

var process_node = function(e) {
	var entry_main = get_entry_main(e.target);
	if ( !entry_main ) return;

	var entry_title_link = get_entry_title_link(entry_main);
	if ( !entry_title_link ) return;

	var item_body = get_item_body(entry_main);
	if ( !item_body ) return;

	var comic = is_comic(entry_title_link);
	if ( !comic ) return;

	get_extras(comic, item_body, entry_title_link);
}

document.body.addEventListener('DOMNodeInserted', process_node, false);
