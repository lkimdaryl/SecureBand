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

import connect 
import asyncio

# Launch FastAPI
app = FastAPI()

# Use MySQL for storing session data
from sessiondb import Sessions
sessions = Sessions(db.db_config, secret_key=db.session_config['session_key'], expiry=1800)

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
GET Requests (PAGES)
"""
#GET homepage
@app.get("/", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("html/homepage.html") as html:
        return HTMLResponse(content=html.read())
    
#GET register page
@app.get("/register", response_class=HTMLResponse)
def get_register(request:Request) -> HTMLResponse:
  session = sessions.get_session(request)
  if len(session) > 0 and session.get('logged_in'):
    return RedirectResponse(url="/dashboard", status_code=302)
  else:
    session_id = request.cookies.get("session_id")
    template_data = {'request':request, 'session':session, 'session_id':session_id}
    with open("html/register.html") as html:
        return HTMLResponse(content=html.read())

#GET login page
@app.get("/login", response_class=HTMLResponse)
def get_login(request:Request) -> HTMLResponse:
  session = sessions.get_session(request)
  if len(session) > 0 and session.get('logged_in'):
    return RedirectResponse(url="/dashboard", status_code=302)
  else:
    session_id = request.cookies.get("session_id")
    template_data = {'request':request, 'session':session, 'session_id':session_id}
    with open("html/login.html") as html:
        return HTMLResponse(content=html.read())
  
#GET maps page
@app.get("/dashboard", response_class=HTMLResponse)
def get_dashboard(request: Request) -> HTMLResponse:
    session = sessions.get_session(request)
    print(session)

    if len(session) > 0 and session.get('logged_in'):
        session_id = request.cookies.get("session_id")
        user_id = session.get("user_id")

        with open("html/dashboard.html") as html_file:
            content = html_file.read()

        response = HTMLResponse(content=content)
        response.set_cookie(key="user_id", value=str(user_id))
        return response
    else:
        return RedirectResponse(url="/login", status_code=302)
  
#GET maps page
@app.get("/settings", response_class=HTMLResponse)
def get_settings(request:Request) -> HTMLResponse:
  session = sessions.get_session(request)
  if len(session) > 0 and session.get('logged_in'):
    session_id = request.cookies.get("session_id")
    template_data = {'request':request, 'session':session, 'session_id':session_id}
    with open("html/settings.html") as html:
        return HTMLResponse(content=html.read())
  else:
    return RedirectResponse(url="/login", status_code=302)

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
GET REQUESTS (AUTHENTICATION)
"""
#GET info if email exists in database
@app.get("/nonexistent_email/{email}")
def nonexistent_email(email:str):
  return json.dumps(db.nonexistent_email(email))

#GET info if username exists in database
@app.get("/nonexistent_username/{username}")
def nonexistent_username(username:str):
    return json.dumps(db.nonexistent_username(username))

#GET info on whether a session exists or not (WARNING: THIS IS ONLY IMPLEMENTED FOR THE SCOPE OF THE MVP! A REAL MODEL NEEDS TO SPECIFICALLY GET THE SESSION ID ASSOCIATED WITH A SPECIFIC SESSION!)
@app.get("/session_status")
def get_session_status(request:Request):
  session = sessions.get_session(request)
  if len(session) > 0 and session.get('logged_in'):
    return {'success': True}
  else:
    return {'success': False}

"""
GET REQUESTS (LOCATION)
"""
#GET latitude and longitude data from SecureBand/GPS
@app.get("/location")
def get_location():
    connect.rescue_mode(1)
    connect.public_rescue(client)

    latitude = connect.latest_coordinates.get("latitude", 0.0)
    longitude = connect.latest_coordinates.get("longitude", 0.0)
    
    return {"latitude": latitude, "longitude": longitude}

#GET latitude and longitude data from SecureBand/Rescue
@app.get("/rescue")
def get_location():
    connect.rescue_mode(2)
    connect.public_rescue(client)

    latitude = connect.latest_coordinates.get("latitude", 0.0)
    longitude = connect.latest_coordinates.get("longitude", 0.0)
    
    # print("lat:", latitude)
    # print("lon:", longitude)
    return {"latitude": latitude, "longitude": longitude}

# GET user data based on current session data
@app.get("/session_data")
def get_session_data(request:Request):
  session = sessions.get_session(request)
  # Return only the session_data, which contains the user data
  return session
   
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
    #store user data into session data
    user_data = db.select_users(username)
    user_id = db.grab_user_userid(username)[0]
    session_data = {'user_id': user_id, 'username': username, 'email': user_data[1], 'first_name': user_data[2], 'last_name':user_data[3], 'logged_in': True}
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

@app.post("/create_child")
async def create_child(request: Request) -> dict:
    child_data = await request.json()
    child_id = db.create_child(child_data['first_name'], child_data['last_name'], child_data['parent_id'])
    return {'success': True, 'child_id': child_id}

@app.post("/edit_child")
async def edit_child(request: Request) -> dict:
    child_data = await request.json()
    db.update_child(child_data['first_name'], child_data['last_name'], child_data['child_id'])
    return {'success': True}

# POST location
# Used to post the location of a child
# @app.post("/location")
# async def post_location() -> dict:
#     latitude = connect.latest_coordinates.get("latitude", 0.0)
#     longitude = connect.latest_coordinates.get("longitude", 0.0)

#     db.add_coordinates(1,latitude, longitude)
    
#     return {'success' : True}

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

# POST password verification
@app.post("/confirm_password")
def confirm_password(user_data:dict) -> bool:
  return db.check_user_password(user_data["username"], user_data["password"])

"""
PUT Requests
"""
# Update session data
@app.put('/update_session_data')
def update_session_data(request:Request, session_data:dict):
  return sessions.update_session(request, session_data)

# Update username
@app.put('/update_username')
def update_username(user_data:dict) -> dict:
  return {'success': db.update_username(user_data['user_id'], user_data['username'])}

# Update email
@app.put('/update_email')
def update_email(user_data:dict) -> dict:
  return {'success': db.update_email(user_data['user_id'], user_data['email'])}

# Update password
@app.put('/update_password')
def update_password(user_data:dict) -> dict:
  return {'success': db.update_password(user_data['user_id'], user_data['password'])}

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

# Main function
if __name__ == "__main__":
    # asyncio.run(connect.start_connection())
    loop = asyncio.get_event_loop()
    client = loop.run_until_complete(connect.start_connection())
    loop.close()

    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(connect.start_connection())
    # loop.close()
    uvicorn.run(app, host="0.0.0.0", port=6543)