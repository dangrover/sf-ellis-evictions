import os, sys

SCRIPT_DIR = os.path.abspath(os.path.dirname(sys.argv[0]))
PDF_OUTPUT_DIR = os.path.join(SCRIPT_DIR, "pdfs")
JSON_OUTPUT_DIR = os.path.join(SCRIPT_DIR, "json")
PLOT_OUTPUT_DIR = os.path.join(SCRIPT_DIR, "plots")

SF_NEIGHBORHOOD_NAMES = {
	94102:'Downtown',
	94103:'SOMA',
	94104:'Financial District/Market',
	94105:'SOMA/Embarcadero',
	94107:'Potrero',
	94108:'Chinatown',
	94109:'Tenderloin',
	94110:'Mission',
	94111:'Financial District/Embarcadero',
	94112:'Balboa Park',
	94114:'Eureka Valley',
	94115:'Western Addition',
	94116:'Parkside',
	94117:'Haight-Ashbury',
	94118:'Inner Richmond',
	94121:'Outer Richmond',
	94122:'Sunset',
	94123:'Marina',
	94124:'Bayview',
	94127:'West Portal',
	94131:'Diamond Heights',
	94132:'Lake Merced',
	94133:'North Beach',
	94134:'Portola'
}

SF_ZIPCODES = SF_NEIGHBORHOOD_NAMES.keys()