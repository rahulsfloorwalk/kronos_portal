
# FloorWalk Portal

## Prerequisites
1. Python 3.6
2. A postgres running with a fresh database and a user with privileges.

## Setup

1. Clone the repository.
2. Create a virtual environment with `python -m venv venv`. This should create the venv inside a directory called `venv`.
3. Activate venv with `source ./venv/bin/activate`. Your prompt should change to show the activated venv.
4. `cd` into the repo and run `pip install -r requirements.txt`. This should install all the required python dependencies.
   *  If this fails due to some missing dependencies on your machine, you may have to install the corresponding packages for your OS. This generally fails due to the postgresql development headers not being present.
5. Copy the `properties.sample.ini` and rename it to `properties.ini`. Change the database and other config properties inside it to reflect your local development environment.
6. `cd` into the `frontend` directory  run `npm i`. This should install all the required javascript dependencies.
7. Load the minimum needed fixtures for the app to run properly: `./manage.py loaddata city groups`

## Testing

1. Activate the virtual environment, and then run `./manage.py test` to run the python tests.
2. `cd` into the `frontend` directory and run `npm run jest` to run the javascript tests for the frontend.

## Running the server

1. Activate the virtual environment, and then run `./manage.py runserver` to start the django server.
2. `cd` into the `frontend` directory and run `npm run dev-server-hot` to start the webpack development server.
3. Visit <http://localhost:8080/> to view/use the app.
4. Visit <http://localhost:8000/> to view/use the django REST interface.

## Seed Data

To load sample testing data into the app, run `./manage.py loaddata test_data/client_report_data.json`
