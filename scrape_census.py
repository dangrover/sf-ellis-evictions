import census
import requests
from util import *


CENSUS_API_KEY = "4b415bf262765d14f4c2f534ce3b5f0a4237d980"
SF_COUNTY_FIPS = '075'

c = census.Census(CENSUS_API_KEY, year=2011)

result = c.acs.get(('NAME', 'B25034_010E'), {'for': 'county:%s' % SF_COUNTY_FIPS, 'in':'state:06' })

#census_api.acs.state_county(('NAME', 'B25004_151E'), states.CA.fips, SF_COUNTY_FIPS)
print result