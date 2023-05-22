from fastapi import FastAPI, Request, Response    # The main FastAPI import and Request/Response objects
from fastapi.responses import RedirectResponse    # Used to redirect to another route
from pydantic import BaseModel                    # Used to define the model matching the DB Schema
from fastapi.responses import HTMLResponse        # Used for returning HTML responses (JSON is default)
from fastapi.templating import Jinja2Templates    # Used for generating HTML from templatized files
from fastapi.staticfiles import StaticFiles       # Used for making static resources available to server
import uvicorn                                    # Used for running the app directly through Python
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import dbutils as db
from dotenv import load_dotenv
import os 
import json

""" 
Environmental Initializations
"""
# Launch FastAPI
app = FastAPI()

# Use MySQL for storing session data
from sessiondb import Sessions
sessions = Sessions(db.db_config, secret_key=db.session_config['session_key'], expiry=1600)

# Environment variables
load_dotenv("credentials.env")
db_host = os.environ['MYSQL_HOST']
db_user = os.environ['MYSQL_USER']
db_pass = os.environ['MYSQL_PASSWORD']
db_name = os.environ['MYSQL_DATABASE']

# Mount the static directory
app.mount("/public", StaticFiles(directory="public"), name="public")

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
# Define a User class that matches the SQL schema we defined for our users
class User(BaseModel):
  first_name: str
  last_name: str
  username: str
  password: str

class Visitor(BaseModel):
  username: str
  password: str

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
# A function to authenticate users when trying to login or use protected routes
def authenticate_user(username:str, password:str) -> bool:
  return db.check_user_password(username, password)

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

"""
GET Requests
"""
#GET homepage
@app.get("/", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("html/homepage.html") as html:
        return HTMLResponse(content=html.read())
    
#GET register page
@app.get("/register", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("html/register.html") as html:
        return HTMLResponse(content=html.read())

#Get login page
@app.get("/login", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("html/index.html") as html:
        return HTMLResponse(content=html.read())

#Get about us page
@app.get("/about_us", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("html/about_us.html") as html:
        return HTMLResponse(content=html.read())

#Get contact us page
@app.get("/contact_us", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("html/contact_us.html") as html:
        return HTMLResponse(content=html.read())

"""
POST Requests
"""
# POST login
@app.post('/login')
def post_login(visitor:Visitor, request:Request, response:Response) -> dict:
  username = visitor.username
  password = visitor.password

  # Invalidate previous session if logged in
  session = sessions.get_session(request)
  if len(session) > 0:
    sessions.end_session(request, response)

  # Authenticate the user
  if authenticate_user(username, password):
    user_id = db.grab_user_userid(username)[0]
    session_data = {'username': username, 'user_id': user_id, 'logged_in': True}
    session_id = sessions.create_session(response, session_data)
    return {'message': 'Login successful', 'session_id': session_id}
  else:
    return {'message': 'Invalid username or password', 'session_id': 0}
  
# POST logout
@app.post('/logout')
def post_logout(request:Request, response:Response) -> dict:
  sessions.end_session(request, response)
  return {'message': 'Logout successful', 'session_id': 0}

# POST register
# Used to create a new user
@app.post("/create")
def post_user(user_data:dict) -> dict:
  db.create_user(user_data['email'], user_data['first_name'], user_data['last_name'], user_data['username'], user_data['password'])
  return {'success': True }

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

# Main function
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6543)