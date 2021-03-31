from flask import render_template, request, jsonify, send_from_directory
import pandas as pd
from app import delay_checker_data
from . import main



@main.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    return response


@main.route('/', methods=['GET'])
def map():
    plot_data = delay_checker_data.avg_flight_delay_month
    plot_data = plot_data.to_json(orient='records')

    table_data = delay_checker_data.avg_flight_delay_month
    table_data = pd.pivot_table(table_data, index='MONTH', columns='AIRLINE', values='ARR_DELAY').mean().round(
        2).to_frame().rename(columns={0: "AVG_ARR_DELAY"}).reset_index().sort_values(by=['AVG_ARR_DELAY'])
    table_data = table_data.to_json(orient='records')

    flights_data = delay_checker_data.flights_data.to_json(orient='records')

    lollipop_data = delay_checker_data.lollipop_data.to_json(orient='records')

    lollipop_od = delay_checker_data.lollipop_od.to_json(orient='records')

    return render_template("mainview.html", map_data=delay_checker_data.us_states_map,
                           airport_locations=delay_checker_data.us_airport_locations,
                           plot_data=plot_data, table_data=table_data, airport_names=delay_checker_data.airport_names,
                           flights_data=flights_data, lollipop_data=lollipop_data, lollipop_od=lollipop_od)

