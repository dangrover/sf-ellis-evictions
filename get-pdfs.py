# Grabs all the monthly reports off the SF rent board site

import os, sys
from BeautifulSoup import BeautifulSoup
from urlparse import urljoin, parse_qs, urlparse
import requests
from util import PDF_OUTPUT_DIR

# make sure the output dir exists
if not os.path.exists(PDF_OUTPUT_DIR):
	os.mkdir(PDF_OUTPUT_DIR)

# Grab the URLs of all the monthly reports from the SFRB site
page = requests.get('http://sfrb.org/index.aspx?page=47')
soup = BeautifulSoup(page.text)
soup.prettify()
link_urls = map(lambda a: a['href'], soup.findAll('a', href=True))
document_links = filter(lambda u: u.startswith('Modules/ShowDocument.aspx?documentid'), link_urls)
document_links = map(lambda u: urljoin('http://sfrb.org', u), document_links)

# Now download each of the pdfs
for u in document_links:
	print "Downloading %s..." % u
	doc_id = parse_qs(urlparse(u)[4])['documentid'][0] # get documentid out of the query string
	file_path = os.path.join(PDF_OUTPUT_DIR, "%s.pdf" % doc_id)

	with open(file_path, 'wb') as handle:
		request = requests.get(u, stream=True)
		for block in request.iter_content(1024):
			if not block:
				break
			handle.write(block)