
import numpy as np
import matplotlib.pyplot as plt
import json, os, random
from pprint import pprint
from util import JSON_OUTPUT_DIR, PLOT_OUTPUT_DIR, SF_ZIPCODES, SF_NEIGHBORHOOD_NAMES

if not os.path.exists(PLOT_OUTPUT_DIR):
	os.mkdir(PLOT_OUTPUT_DIR)




def plot_year(desired_year):
	x_points = [] # price
	y_points = [] # petitions
	labels = []

	fig = plt.figure(desired_year)
	fig.clear()
	
	total_for_all_zips = 0
	for zipcode in SF_ZIPCODES:
		with open(os.path.join(JSON_OUTPUT_DIR, '%d-petitions.json' % zipcode), 'rb') as f:
			petitions_by_month = json.load(f)
		
		with open(os.path.join(JSON_OUTPUT_DIR, '%d-prices.json' % zipcode), 'rb') as f:
			prices_by_month = json.load(f)
		
		total_petitions_for_year = 0
		for month_string, month_total in petitions_by_month.iteritems():
			year, month = map(int, month_string.split("-"))
			if year == desired_year:
				total_petitions_for_year += month_total
				total_for_all_zips += month_total

		# get avg for year
		entries_for_year = []
		for entry in prices_by_month:
			year, month = map(int, entry['month'].split("-"))
			if year == desired_year:
				entries_for_year.append(entry)

		total_units = sum(map(lambda e: e['prices']['1']['count'], entries_for_year))
		weighted_average = sum(map(lambda e: float(e['prices']['1']['average']) * (float(e['prices']['1']['count']) / float(total_units)), entries_for_year))
	
		x_points.append(weighted_average)
		y_points.append(total_petitions_for_year)
		labels.append(SF_NEIGHBORHOOD_NAMES[zipcode])

		print "%s avg=%f, petitions=%d" % (zipcode, weighted_average, total_petitions_for_year)

	plt.scatter(x_points, y_points, alpha=0.5)
	plt.xlim(0,2000000)
	plt.ylim(0, 15)

	for label, x, y in zip(labels, x_points, y_points):
		plt.annotate(label, xy=(x, y), xytext=(random.randrange(10),random.randrange(10)),  textcoords = 'offset points', ha = 'right', va = 'bottom')

	plt.title("Ellis Act Evictions in %d" % desired_year)
	plt.savefig(os.path.join(PLOT_OUTPUT_DIR,"%d.png" % desired_year))
	print "total petitions for %d: %d" % (desired_year, total_for_all_zips)

for y in range(2009, 2014):
	print "plotting %d" % y
	plot_year(y)
