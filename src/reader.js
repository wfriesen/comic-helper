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
function is_comic(link) {
	for (var c in comics) {
		var test = new RegExp(c);
		if ( test.test(link) ) return comics[c];
	}
	return null;
}

function get_extras(comic, item_body, link) {
	var p = document.createElement("p");
	switch (comic) {
		case "xkcd":
			var title = getChildByTagName("img",item_body).getAttribute("title");
			if (title) {
				p.innerHTML = title;
				return p;
			}
		case "asp":
			var title = getChildByTagName("img",item_body).getAttribute("title");
			if (title) {
				p.innerHTML = title;
				return p;
			}
		default:
			return null;
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

	var extraElement = get_extras(comic, item_body, entry_title_link);
	if ( extraElement ) item_body.appendChild(extraElement);
}

document.body.addEventListener('DOMNodeInserted', process_node, false);
