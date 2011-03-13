from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
from urlparse import urljoin, urlparse
import re
import urllib
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
		result = urlfetch.fetch(url, method="HEAD", follow_redirects=False)
		if "location" not in result.headers:
			return None
		else:
			url = result.headers["location"]
			netloc = urlparse(url).netloc
	return url if netloc in comic_urls else None

def get_html(url):
	url = valid_comic_url(url)
	if not url:
		return None
	result = urlfetch.fetch(url)
	return result.content if result.status_code == 200 else None

class SecretModel(db.Model):
	link = db.StringProperty()
	secret = db.StringProperty()
	date = db.DateTimeProperty(auto_now_add=True)

def get_src(link, soup, name):
	src = None
	for img in soup.findAll(
		"img",
		attrs={
			"src" : re.compile(name,re.IGNORECASE)
		}
	):
		src = urljoin(link,img["src"])
		break
	return src

def asp(link, soup):
	secret = None
	for img in soup.findAll(
		"img",
		attrs={
			"src" : re.compile("aspeasteregg.png$",re.IGNORECASE)
		}
	):
		try:
			secret = urljoin(link,img.parent["href"])
			break
		except KeyError:
			pass
	return secret

def ch(link, soup):
	comic = get_src(link, soup, "/comics/");
	if not comic:
		for img in soup.findAll(
			"img",
			attrs={
				"alt" : "Cyanide and Happiness, a daily webcomic",
				"src" : True
			}
		):
			comic = img["src"]
			break
	return comic

def smbc(link, soup):
	return get_src(link, soup, "after.gif")

def pa(link, soup):
	return get_src(link, soup, "art.penny-arcade.com")

def get_secret(link, path):
	cache = db.GqlQuery("SELECT * FROM SecretModel WHERE link = :link LIMIT 1",
			link=link)
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

def get_panel_secret(comic, link):
	cache = db.GqlQuery("SELECT * FROM SecretModel WHERE link = :link LIMIT 1",
			link=link)
	if cache.count() == 1:
		if cache[0].secret:
			return cache[0].secret
		else:
			last_checked = cache[0].date
			check_cutoff = datetime.datetime.now() - datetime.timedelta(minutes=15)
			html = get_html(link) if last_checked < check_cutoff else None
	else:
		html = get_html(link)

	if comic not in comics:
		return None

	secret = comics[comic](link,BeautifulSoup(html)) if html else None

	if cache.count():
		new_secret = cache[0]
	else:
		new_secret = SecretModel()
		new_secret.link = link
	new_secret.secret = secret
	new_secret.put()

	return secret

def link_to_comic(link):
	comic_urls = {
		"http://www.amazingsuperpowers.com/" : "asp",
		"http://feedproxy.google.com/~r/smbc-comics/" : "smbc",
		"http://www.smbc-comics.com/" : "smbc",
		"http://www.explosm.net/comics/" : "ch",
		"http://feeds.penny-arcade.com/" : "pa"
	}
	for c in comic_urls:
		if link.startswith(c):
			return comic_urls[c]
	return None

class Panel(webapp.RequestHandler):
	def get(self):
		self.response.headers["Access-Control-Allow-Origin"] = \
				"http://www.google.com"
		link = self.request.get("link")
		if link:
			link = urllib.unquote(link)
		comic = self.request.get("comic")
		if not comic:
			comic = link_to_comic(link)
		if not (comic and link):
			self.response.out.write(json.dumps({}))
			return
		secret = get_panel_secret(comic, link)
		json_response = {"panel":secret} if secret else {}
		self.response.out.write(json.dumps(json_response))

class DefaultHandler(webapp.RequestHandler):
	def get(self):
		self.response.headers["Access-Control-Allow-Origin"] = \
				"http://www.google.com"
		path = self.request.path
		if path in handlers:
			link = self.request.get("link")
			secret = get_secret(link,path)
			json_response = {"panel":secret} if secret else {}
			self.response.out.write(json.dumps(json_response))

comics = {
		"asp": asp,
		"smbc": smbc,
		"ch": ch,
		"pa": pa}
handlers = {
		"/asp": asp,
		"/smbc": smbc,
		"/ch": ch,
		"/pa": pa}
application = webapp.WSGIApplication(
		[("/panel",Panel),
		("/.*", DefaultHandler)],
		debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()
