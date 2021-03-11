# Author: Hugo

import pandas as pd
import numpy as np
import ast

asd = pd.read_csv("../app/data/airports_serviced_data.csv")
print(asd)
asd = asd.replace(np.nan, 0, regex=True)
flights = []
for index, row in asd.iterrows():
    origin = row.level_0
    try:
        conn_dict = ast.literal_eval(row['0'])
    except ValueError:
        print(row['0'])
        print()
    for dest in conn_dict.keys():
        fs = conn_dict[dest]
        flights.append((origin, dest, fs['FLIGHT_VOLUME'], fs['ARR_DELAY'], fs['CANCELLED'], fs['CARRIER_DELAY']))
pd.DataFrame(flights,
             columns=["origin", "destination",
                      "flight_volume", "arr_delay",
                      "cancelled", "carrier_delay"]).to_csv(
    "flights.csv",
    index=False)
