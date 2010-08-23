//title tag
var info = grabTitle("/comics/");
var title = "";
if (info[0] != null) title = "Title: " + info[0];
var image = info[1];

//subject line of "contact" email address
var subject = "";
links = document.getElementsByTagName("a");
for (i=0; i<links.length; i++) {
	if (links[i].innerHTML == "contact") {
		var contact = links[i].getAttribute("href");
		var index = contact.indexOf("mailto:ryan@qwantz.com?subject=");
		if (index != -1) {
			subject = "Contact: " + contact.substring(index+31);
		}
		break;
	}
}

//RSS title
var rss = "";
var txt = new RegExp("<span class=\"rss-title\">(.*?)</span>","m");
if (txt.test(document.documentElement.outerHTML)) {
	rss = txt.exec(document.documentElement.outerHTML)[1];
	if (rss == null) rss = "";
	else rss = "RSS: " + rss;
}

var div = document.createElement("div");
var titleElement = document.createElement("p");
titleElement.innerHTML = title;
div.appendChild(titleElement);
var subjectElement = document.createElement("p");
subjectElement.innerHTML = subject;
div.appendChild(subjectElement);
var rssElement = document.createElement("p");
rssElement.innerHTML = rss;
div.appendChild(rssElement);
image.parentNode.insertBefore(div,image.nextSibling);
