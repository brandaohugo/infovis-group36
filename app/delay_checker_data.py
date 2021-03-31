import json
import pandas as pd

us_states_map = json.load(open('app/data/us-states.json'))
us_airport_locations = pd.read_csv('app/data/airports_2018_v1.csv').to_dict('records') # NOTE: airports filtered to show only locations used in 2018 data.
airport_names = json.load(open('app/data/airport_names.json'))
avg_flight_delay_month = pd.read_csv('app/data/avg_flight_delay_month.csv')
flights_data = pd.read_csv('app/data/flights.csv')
lollipop_data = pd.read_csv('app/data/DELAY_FROM_ORIGIN_BY_CARRIER.csv')
lollipop_od = pd.read_csv('app/data/DELAY_FROM_ORIGIN_TO_DEST_BY_CARRIER.csv')
