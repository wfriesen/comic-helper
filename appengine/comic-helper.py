from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp.util import run_wsgi_app
import urllib2
from urlparse import urljoin, urlparse
from BeautifulSoup import BeautifulSoup
from django.utils import simplejson as json

comic_urls = (
		"www.amazingsuperpowers.com",
		"www.smbc-comics.com",
		"www.explosm.net"
		)

def get_html(url):
	netloc = urlparse(url).netloc
	if netloc not in comic_urls:
		return None
	try:
		handle = urllib2.urlopen(url)
	except Exception:
		return None
	return handle.read()

class SecretModel(db.Model):
	link = db.StringProperty()
	secret = db.StringProperty()
	date = db.DateTimeProperty(auto_now_add=True)

def get_src(link, soup, name):
	src = None
	for img in soup.findAll("img"):
		if name.lower() in img["src"].lower():
			try:
				src = urljoin(link,img["src"])
				break
			except KeyError:
				pass
	return src

def asp(link, soup):
	secret = None
	for img in soup.findAll("img"):
		if "ASPeasteregg.png" in img["src"]:
			try:
				secret = urljoin(link,img.parent["href"])
				break
			except KeyError:
				pass
	return secret

def ch(link, soup):
	return get_src(link, soup, "/comics/")

def smbc(link, soup):
	return get_src(link, soup, "after.gif")

def get_secret(link, path):
	cache = db.GqlQuery("SELECT * FROM SecretModel WHERE link='"+link+"' LIMIT 1")
	if cache.count() == 1:
		return cache[0].secret

	html = get_html(link)
	if not html:
		return None

	soup = BeautifulSoup(html)
	secret = handlers[path](link,soup)
	new_secret = SecretModel()
	new_secret.link = link
	new_secret.secret = secret
	new_secret.put()

	return secret

class DefaultHandler(webapp.RequestHandler):
	def get(self):
		self.response.headers["Access-Control-Allow-Origin"] = "http://www.google.com"
		path = self.request.path
		if path in handlers:
			link = self.request.get("link")
			secret = get_secret(link,path)
			json_response = {"panel":secret} if secret else {}
			self.response.out.write(json.dumps(json_response))

handlers = {
		"/asp": asp,
		"/smbc": smbc,
		"/ch": ch}
application = webapp.WSGIApplication(
		[("/.*", DefaultHandler)],
		debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()
