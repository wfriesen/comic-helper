from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
import urllib2
from BeautifulSoup import BeautifulSoup

def get_html(url):
	req = urllib2.Request(url)
	try:
		handle = urllib2.urlopen(req)
	except DownloadError:
		return None
	return handle.read()

class ASP(webapp.RequestHandler):
	def get(self):
		link = self.request.get("link")
		html = get_html(link)
		if not html: return
		self.response.headers["Access-Control-Allow-Origin"] = "http://www.google.com"
		soup = BeautifulSoup(html)
		secret = None
		for img in soup.findAll("img"):
			if "ASPeasteregg.png" in img["src"]:
				try:
					secret = link + img.parent["href"]
				except KeyError:
					pass
		if secret:
			self.response.out.write("<p><img src=\""+secret+"\" /></p>")

application = webapp.WSGIApplication(
		[("/asp", ASP)],
		debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()
