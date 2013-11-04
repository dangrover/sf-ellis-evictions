import os, csv, json
from util import JSON_OUTPUT_DIR, SCRIPT_DIR
from collections import defaultdict
from pprint import pprint

json_data = []

with open(os.path.join(SCRIPT_DIR, 'housing-inventory.csv'), 'rU') as csvfile:
	reader = csv.reader(csvfile)
	is_header = True
	for row in reader:
		if is_header:
			is_header = False
			continue

		year, authorized, completed, demolished, altered, net_change = row

		json_data.append({
			'year':int(year),
			'authorized':int(authorized.replace(',', '')),
			'completed':int(completed.replace(',', '')),
			'demolished':int(demolished.replace(',', '')),
			'altered':int(altered.replace(',', '')),
			'net':int(net_change.replace(',', ''))
			});
		print "row = %s" % row

print json.dumps(json_data)