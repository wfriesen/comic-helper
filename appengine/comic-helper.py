from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
import re
from urlparse import urljoin, urlparse
from BeautifulSoup import BeautifulSoup
from django.utils import simplejson as json
import datetime

def valid_comic_url(url):
	comic_urls = (
			"www.amazingsuperpowers.com",
			"www.smbc-comics.com",
			"www.explosm.net",
			"feeds.penny-arcade.com",
	)
	netloc = urlparse(url).netloc
	if netloc == "feedproxy.google.com":
		matches = re.findall("http://feedproxy.google.com/~r/(.*?)/.*", url)
		return True if len(matches) == 1 and matches[0] == "smbc-comics" else False
	return True if netloc in comic_urls else False

def get_html(url):
	if not valid_comic_url(url):
		return None
	result = urlfetch.fetch(url)
	return result.content if result.status_code == 200 else None

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

def pa(link, soup):
	return get_src(link, soup, "art.penny-arcade.com")

def get_secret(link, path):
	cache = db.GqlQuery("SELECT * FROM SecretModel WHERE link = :link LIMIT 1", link=link)
	if cache.count() == 1:
		if cache[0].secret:
			return cache[0].secret
		else:
			last_checked = cache[0].date
			check_cutoff = datetime.datetime.now() - datetime.timedelta(minutes=15)
			html = get_html(link) if last_checked < check_cutoff else None
	else:
		html = get_html(link)

	secret = handlers[path](link,BeautifulSoup(html)) if html else None

	if cache.count():
		new_secret = cache[0]
	else:
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
		"/ch": ch,
		"/pa": pa}
application = webapp.WSGIApplication(
		[("/.*", DefaultHandler)],
		debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()
