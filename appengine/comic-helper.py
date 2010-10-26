from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp.util import run_wsgi_app
import urllib2
from urlparse import urljoin
from BeautifulSoup import BeautifulSoup
from django.utils import simplejson as json

def get_html(url):
	try:
		handle = urllib2.urlopen(url)
	except Exception:
		return None
	return handle.read()

class SecretModel(db.Model):
	link = db.StringProperty()
	secret = db.StringProperty()
	date = db.DateTimeProperty(auto_now_add=True)

def get_secrets(link):
	cache = db.GqlQuery("SELECT * FROM SecretModel WHERE link='"+link+"' LIMIT 1")
	if cache.count() == 1:
		return cache[0].secret

	html = get_html(link)
	if not html:
		return None

	soup = BeautifulSoup(html)
	secret = None
	for img in soup.findAll("img"):
		if "ASPeasteregg.png" in img["src"]:
			try:
				secret = urljoin(link,img.parent["href"])
			except KeyError:
				pass
	new_secret = SecretModel()
	new_secret.link = link
	new_secret.secret = secret
	new_secret.put()

	return secret

class ASP(webapp.RequestHandler):
	def get(self):
		link = self.request.get("link")

		secret = get_secrets(link)

		self.response.headers["Access-Control-Allow-Origin"] = "http://www.google.com"
		if secret:
			self.response.out.write(json.dumps({"panel":secret}))
		else:
			self.response.out.write(json.dumps({}))

application = webapp.WSGIApplication(
		[("/asp", ASP)],
		debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()
