import requests
from pprint import pprint
from xml.dom.minidom import parse, parseString
from collections import defaultdict
import json
import os
from util import JSON_OUTPUT_DIR, SF_ZIPCODES

API_KEY = 'bve4hcvwxpuevuzar948dgmz'


START_DATE = '2000-1-01'
END_DATE = '2013-11-01'

ALL_TYPES = 'all', '1' # types of listings. 'all' = all of them, 1 bedroom, 2 bedroom, etc.


# make sure the output dir exists
if not os.path.exists(JSON_OUTPUT_DIR):
	os.mkdir(JSON_OUTPUT_DIR)


url = 'http://api.trulia.com/webservices.php?library=TruliaStats&function=getCityStats&city=San%%20Francisco&state=CA&statType=listings&apiKey=%s&startDate=%s&endDate=%s' % (API_KEY, START_DATE, END_DATE)
response = requests.get(url)

print response.text