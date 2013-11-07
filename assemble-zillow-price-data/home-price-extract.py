import os, sys, json, csv, datetime

SCRIPT_DIR = os.path.abspath(os.path.dirname(sys.argv[0]))

CSV_FILES = ['1bed.csv', '2bed.csv', '3bed.csv', 'all.csv', 'single.csv', 'condo.csv']

final_data = {}

for fname in CSV_FILES:
	base = fname.replace('.csv','')

	
	final_data[base] = []
	with open(os.path.join(SCRIPT_DIR, fname), 'rU') as csvfile:
		reader = csv.reader(csvfile)
		
		for row in reader:
			date_text, price_text = row
			actual_date = datetime.datetime.strptime(date_text, '%b %Y')
			date_ts = int(actual_date.strftime('%s'))

			dollars = int(price_text.replace('$','').replace(',',''))

			final_data[base].append({'date':date_ts, 'price':dollars})




print json.dumps(final_data)