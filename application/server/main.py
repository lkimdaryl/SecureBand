from fastapi import FastAPI, Request, Response    # The main FastAPI import and Request/Response objects
from fastapi.responses import RedirectResponse    # Used to redirect to another route
from pydantic import BaseModel                    # Used to define the model matching the DB Schema
from fastapi.responses import HTMLResponse        # Used for returning HTML responses (JSON is default)
from fastapi.templating import Jinja2Templates    # Used for generating HTML from templatized files
from fastapi.staticfiles import StaticFiles       # Used for making static resources available to server
import uvicorn                                    # Used for running the app directly through Python
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
import os 
import json

# Launch FastAPI
app = FastAPI()

# Mount the static directory
app.mount("/public", StaticFiles(directory="public"), name="public")

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

# Main function
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6543)