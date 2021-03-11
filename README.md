# Meeting Notes #
## 11-2-2021: Weekly Check-in #1 ##



Discussion points:
- Current idea to display major airport hubs in the US is not a deep insight from the dataset
- How could we supplement the dataset to answer a more insightful question with our visualisation?
- Maps are a heavily overused component with aviation data
- Another option is to take an exploratory approach and focus on transitions between visual components
- The simple road is: focus on doing something fancy with a map
- Exploratory road: asking the question of what we can achieve with aviation data without a map
- General consensus is that the exploratory approach might be more interesting

Action items for next week:
- Come up with ideas for doing a visualisation with no map
- Come up with more interesting questions that an exploratory approach might answer
- By next week, decide what approach to take for the project

## 18-2-2021: Weekly Check-in #2 ##

Discussion points:
- Emphasised that we have a delay dataset
- The visualisation will not focus on predictions for the future
- The visualisation basics are two components, the main map view with origin and destination selection and the airline
view

Action items for next week:
- Wireframe design of the minimum visualisation with data, with the framework of choice and runnable in browser
- Upload to GitHub

## 25-2-2021: Weekly Check-in #3 ##


Discussion points:

- single screen view idea: map moves between halves of screen, explore this idea, destination and origin side by side when selected
- easy change of airports once selection is made: Dropdown or search to change airport once airports are selected
- Encoding information: lighter view, when all dots on screen encoding information not useful
- remove irrelevant airports compeltely once origin is selected


Action items for next week:

- integrate map and airline view into one page:
 try out single page view with origin airport view appearing on left side when origin selected
- add average delay to routes serviced (data)
- Finalize table of delays

- Improve the map view (larger, more visualy appealing)

## 4-3-2021 Weekly Check-in #4 ##

Discussion point: 
- Option B more informative
- Avoid scrolling as much as possible
- Perhaps adding a toggle button to switch between different views
- Report should honestly report what is in the demo, even if the demo is not of high quality

Action items for next week:
- Focus on functional aspects, make sure most of functional work is finished
- Leave visual appeal for week after

## 11-3-2021 Weekly Check-in #5 ##

First instinct about user story is usually correct: rely on intuition

3 min video for 1. April: contain/highlight every function of the airline 
Introduce components on screen
Pose a question: anwser it by clicking on tabs
Come to conclusion about components: explain why your components make sense

Slides: 
Screenshots of every component with explanation and arrows

Report: 
Scientific report, explain why choose visualizations, why color, why layout, why chart type


For next week:  
prepare main component for feedback, along with the video outline (structure, , references to theory as explaining design choices, introduce all components in order)

Make tool public to improve understanding, deploy on free hosting 



# InfoVis Assignment #

This repo contains the first assignment for the course Information Visualization. Students need to create one visualization using html/js/d3 and one visualization using the python package Bokeh.


---

## Running the app within Docker container ##

1) Install docker via: https://docs.docker.com/engine/install/
2) Run "docker-compose build"
3) Run "docker-compose up" to start the docker container you just build
4) Navigate to localhost:5000 to access the app

**Note**: you do not have to rebuild on every change you make. Just save changes to the
code and refresh the page. 

---

## Running the app outside Docker container ##


## Requirements ##

See the requirements.txt file
You can automatically install all the requirements by running: pip install -r requirements.txt

## How it works ##

You can get the app to run in your local browser by following the steps below.

### Linux & Mac ###

* The app can be started by running: bash start_app.sh
* The app can then be accessed by navigating to http://127.0.0.1:5000/

### Windows ###

* Type the following in your terminal when using windows CMD: set FLASK_ENV=development **OR** when using windows powershell: $env:FLASK_ENV=development **OR** conda env config vars set FLASK_ENV=development (when using anaconda powershell)
* Followed by: python run.py
* The app can then be accessed by navigating to http://127.0.0.1:5000/

