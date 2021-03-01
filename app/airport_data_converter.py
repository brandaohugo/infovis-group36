# Author: Hugo

import pandas as pd
import ast

asd = pd.read_csv("../app/data/airports_serviced_data.csv")

flights = []
for index, row in asd.iterrows():
    origin = row.level_0
    conn_dict = ast.literal_eval(row['0'])
    for dest in conn_dict.keys():
        fs = conn_dict[dest]
        flights.append((origin, dest, fs['FLIGHT_VOLUME'], fs['ARR_DELAY']))
pd.DataFrame(flights, columns=["origin", "destination", "flight_volume", "arr_delay"]).to_csv("flights.csv",
                                                                                              index=False)
