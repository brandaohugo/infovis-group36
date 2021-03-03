import pandas as pd
import json
airport_list = pd.read_csv('../app/data/airports_2018.csv').filter(items=['iata', 'name']).values.tolist()
final_airport_names = [f"{airport[1]} ({airport[0]})"for airport in airport_list]




jsonString = json.dumps(final_airport_names)
# print(jsonString)

f = open("airport_names.txt", "w")
# for airport in final_airport_names:
f.write(jsonString + ",\n")
