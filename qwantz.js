//title tag
var info = grabTitle("/comics/");
var title = info[0];
var image = info[1];

//subject line of "contact" email address
var subject = ""
links = document.getElementsByTagName("a")
for (i=0; i<links.length; i++) {
	if (links[i].innerHTML == "contact") {
		var contact = links[i].getAttribute("href");
		var index = contact.indexOf("mailto:ryan@qwantz.com?subject=");
		subject = contact.substring(index+31);
		break;
	}
}

var div = document.createElement("div");
var titleElement = document.createElement("p");
titleElement.innerHTML = title;
div.appendChild(titleElement);
var subjectElement = document.createElement("p");
subjectElement.innerHTML = subject;
div.appendChild(subjectElement);
image.parentNode.insertBefore(div,image.nextSibling);
