# BookMyShow

## Problem Statement

TO create a full stack applications for users to book tickets for movies and events.
Both users and admins should be able to login to the system.
Users should be able to view the list of movies and events and book tickets for them.
Admins should be able to add, update and delete movies and events.

## Technologies Used
Flask

VueJS => 2

Sqlite

Celery

Redis

## Installation
Make sure you have python3 and pip3 installed on your system.

1. Create a virtual environment using `python3 -m venv venv`
2. Activate the virtual environment using `source venv/bin/activate`
3. Install the dependencies using `pip3 install -r requirements.txt`
4. Run celery by `celery -A main.celery worker -l info`
5. Run redis by `redis-server`
6. Run Flask application by `python3 main.py`
7. Run celery beat bt `celery -A main.celery beat --max-interval 2 -l info`

Go to localhost:5000 to view the application.
