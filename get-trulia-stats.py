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

for zipcode in SF_ZIPCODES:
	url = 'http://api.trulia.com/webservices.php?library=TruliaStats&function=getZipCodeStats&statType=listings&zipCode=%s&apiKey=%s&startDate=%s&endDate=%s' % (zipcode, API_KEY, START_DATE, END_DATE)
	response = requests.get(url)
	dom = parseString(response.text) 

	all_week_summaries = []
	weekStats = dom.getElementsByTagName('listingStat')
	for w in weekStats:

		ending_date_text = w.getElementsByTagName('weekEndingDate')[0].firstChild.nodeValue
		this_summary = {'week':ending_date_text, 'prices':{}}

		subcats = w.getElementsByTagName('subcategory')
		for s in subcats:
			# Normalize the category type
			cat_type = s.getElementsByTagName('type')[0].firstChild.nodeValue
			cat_type = 'all' if cat_type == 'All Properties' else cat_type[0] # Just the number of bedrooms or 'all'

			this_summary['prices'][cat_type] = {
				'count':int(s.getElementsByTagName('numberOfProperties')[0].firstChild.nodeValue),
				'median':int(s.getElementsByTagName('medianListingPrice')[0].firstChild.nodeValue),
				'average':int(s.getElementsByTagName('averageListingPrice')[0].firstChild.nodeValue)
			}

		# only put this week in if it has 1 bedroom and 'all' stats
		if this_summary['prices'].get('all') and this_summary['prices'].get('1'):
			all_week_summaries.append(this_summary)

	# Coalesce these by month
	grouped_by_month = defaultdict(list)
	for wsum in all_week_summaries:
		week_parts = wsum['week'].split('-')
		year = int(week_parts[0])
		month = int(week_parts[1])
		grouped_by_month['%d-%d' % (year, month)].append(wsum)


	month_summaries = []
	for key, wsums in grouped_by_month.iteritems():
		this_month = {'month': key, 'prices':{}}
		for t in ALL_TYPES:
			total_listings = sum(map(lambda w: w['prices'][t]['count'], wsums))
			weighted_median = sum(map(lambda w: w['prices'][t]['median'] * (float(w['prices'][t]['count'])/float(total_listings)), wsums))
			weighted_average = sum(map(lambda w: w['prices'][t]['average'] * (float(w['prices'][t]['count'])/float(total_listings)), wsums))
			this_month['prices'][t] = {
				'count': total_listings,
				'median': int(weighted_median),
				'average': int(weighted_average)
			}
		month_summaries.append(this_month)
	#print "month = %s" % month_summaries

	# save to JSON
	json_path = os.path.join(JSON_OUTPUT_DIR, "%s-prices.json" % zipcode)
	with open(json_path, 'wb') as f:
		json.dump(month_summaries, f)


# http://api.trulia.com/webservices.php?library=TruliaStats&function=getZipCodeStats&zipCode=94109&apikey=bve4hcvwxpuevuzar948dgmz&startDate=2010-01-01&endDate=2013-01-01