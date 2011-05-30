from google.appengine.ext import db
from google.appengine.api import urlfetch
from urlparse import urljoin, urlparse
import re
from BeautifulSoup import BeautifulSoup
import datetime

class SecretModel(db.Model):
	link = db.StringProperty()
	secret = db.StringProperty()
	date = db.DateTimeProperty(auto_now_add=True)

class Comic:
	link = None
	secret = None
	should_update = False
	has_cache = False
	html = None
	soup = None

	def get_src(self, name):
	       src = None
	       for img in self.soup.findAll(
	               "img",
	               attrs={
	                       "src" : re.compile(name,re.IGNORECASE)
	               }
	       ):
	               src = urljoin(self.link,img["src"])
	               break
	       return src

	def __init__(self, link):
		self.link = link

	def _validate_comic_url(self, url):
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
		self.link = url if netloc in comic_urls else None

	def _get_html(self):
		self._validate_comic_url(self.link)
		if self.link:
			result = urlfetch.fetch(self.link)
			if result.status_code == 200:
				self.html = result.content

	def parse_secret(self):
		pass

	def _get_cache(self):
		return db.GqlQuery("SELECT * FROM SecretModel WHERE link = :link LIMIT 1",
				link=self.link)

	def check_cache(self):
		"""
		Check the database for the given link.
		Set the secret if it is given.
		Set should_update based on the last time the site was checked
		Return True if the secret is taken from cache,
		False otherwise.
		"""
		if not self.link:
			return False
		cache = self._get_cache()
		if cache.count() == 1:
			has_cache = True
			if cache[0].secret:
				self.secret = cache[0].secret
				return True
			else:
				last_checked = cache[0].date
				check_cutoff = datetime.datetime.now() - datetime.timedelta(minutes=15)
				self.should_update = last_checked < check_cutoff
		else:
			self.should_update = True
		return False

	def update_cache(self):
		"""
		If should_update is True, then get the HTML for the page.
		call the get_secret method that should be overridden
		Write to the database
		"""
		if not self.should_update:
			return
		self._get_html()
		if self.html:
			self.soup = BeautifulSoup(self.html)
		self._parse_secret()
		if self.has_cache:
			# Get entry to update
			cache = self._get_cache()
			new_secret = cache[0]
		else:
			# Create new entry
			new_secret = SecretModel()
			new_secret.link = self.link
		new_secret.secret = self.secret
		new_secret.put()

class AmazingSuperPowers(Comic):
	def _parse_secret(self):
		"""
		scrape the secret out of self.soup
		"""
		for img in self.soup.findAll(
			"img",
			attrs={
				"src" : re.compile("aspeasteregg.png$",re.IGNORECASE)
			}
		):
			try:
				self.secret = urljoin(self.link,img.parent["href"])
				break
			except KeyError:
				pass

class SaturdayMorningBreakfastCereal(Comic):
	def _parse_secret(self):
		self.secret = self.get_src("after.gif")

class CyanideAndHappiness(Comic):
	def _parse_secret(self):
		comic = self.get_src("/comics/");
		if not comic:
			for img in self.soup.findAll(
				"img",
				attrs={
					"alt" : "Cyanide and Happiness, a daily webcomic",
					"src" : True
				}
			):
				comic = img["src"]
				break
		self.secret = comic

class PennyArcade(Comic):
	def _parse_secret(self):
		self.secret = self.get_src("art.penny-arcade.com")
