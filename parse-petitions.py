import os, csv, json
from util import JSON_OUTPUT_DIR, SCRIPT_DIR
from collections import defaultdict
from pprint import pprint

month_summaries = defaultdict(lambda: defaultdict(lambda: 0))

with open(os.path.join(SCRIPT_DIR, 'petition-list.csv'), 'rU') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		month, day, year = map(int, row[0].split('/'))
		zip_text = row[8]
		month_summaries[zip_text]["%d-%d" % (year, month)] += 1

for zipcode, counts_by_month in month_summaries.iteritems():
	json_path = os.path.join(JSON_OUTPUT_DIR, "%s-petitions.json" % zipcode)
	with open(json_path, 'wb') as f:
		json.dump(counts_by_month, f)
