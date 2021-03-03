import json
import pandas as pd

us_states_map = json.load(open('app/data/us-states.json'))
us_airport_locations = pd.read_csv('app/data/airports_2018.csv').to_dict('records') # NOTE: airports filtered to show only locations used in 2018 data.
airport_names = json.load(open('app/data/airport_names.json'))
