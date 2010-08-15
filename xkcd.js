var info = grabTitle("/comics/");
var title = info[0];
var image = info[1];

var div = document.createElement("div");
div.innerHTML = title;

image.parentNode.insertBefore(div,image.nextSibling);
