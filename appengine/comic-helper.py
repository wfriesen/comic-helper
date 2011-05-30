from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
import urllib
from django.utils import simplejson as json
import comic_objects

# Determine comic argument from given link
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
		# Header needed to stop the browser preventing CORS
		self.response.headers["Access-Control-Allow-Origin"] = \
				"http://www.google.com"

		# Obtain and validate arguments
		link = self.request.get("link")
		if link:
			link = urllib.unquote(link)
		comic_arg = self.request.get("comic")
		if not comic_arg:
			comic_arg = link_to_comic(link)
		if comic_arg not in comics or not (comic_arg and link):
			# Invalid comic and/or link given
			self.response.out.write(json.dumps({}))
			return

		# Instantiate appropriate comic class
		# This assumes that comic_arg is a key of comics
		comic = comics[comic_arg](link)

		# Obtain the comic secret
		if not comic.check_cache():
			comic.update_cache()
		secret = comic.secret

		# Return JSON
		json_response = {"panel":secret} if secret else {}
		self.response.out.write(json.dumps(json_response))

# Mappings of comic arguments to classes to use
comics = {
		"asp" : comic_objects.AmazingSuperPowers,
		"smbc" : comic_objects.SaturdayMorningBreakfastCereal,
		"ch" : comic_objects.CyanideAndHappiness,
		"pa" : comic_objects.PennyArcade
}

# Application setup
application = webapp.WSGIApplication(
		[("/panel",Panel)],
		debug=True)
def main():
	run_wsgi_app(application)
if __name__ == "__main__":
	main()
