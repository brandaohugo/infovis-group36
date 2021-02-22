import json
import pandas as pd

us_states_map = json.load(open('app/data/us-states.json'))
us_airport_locations = pd.read_csv('app/data/airports.csv').to_dict('records')
