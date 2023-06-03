''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
# Necessary Imports
import mysql.connector as mysql                   # Used for interacting with the MySQL database
import os                                         # Used for interacting with the system environment
from dotenv import load_dotenv                    # Used to read the credentials
import bcrypt

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
# Configuration
load_dotenv('credentials.env')                 # Read in the environment variables for MySQL
db_config = {
  "host": os.environ['MYSQL_HOST'],
  "user": os.environ['MYSQL_USER'],
  "password": os.environ['MYSQL_PASSWORD'],
  "database": os.environ['MYSQL_DATABASE']
}

session_config = {
  'session_key': os.environ['SESSION_KEY']
}

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
"""
Helper functions for CRUD operations
"""
# CREATE SQL query
def create_user(email:str, first_name:str, last_name:str, username:str, password:str) -> int:
  #encrypt the password
  password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = 'insert into users (email, first_name, last_name, username, password) values (%s, %s, %s, %s, %s);'
  values = (email, first_name, last_name, username, password)
  cursor.execute(query, values)
  db.commit()
  db.close()
  return cursor.lastrowid

def create_child(first_name: str, last_name: str, parent_id: int) -> int:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = 'INSERT INTO children (first_name, last_name, parent_id) VALUES (%s, %s, %s);'
  values = (first_name, last_name, parent_id)
  cursor.execute(query, values)
  db.commit()
  child_id = cursor.lastrowid
  db.close()
  return child_id

def add_coordinates(child_id: int, latitude: str, longitude: str) -> bool:
  db = mysql.connect(**db_config)
  print("CHILD ID, LAT, LON: ",child_id + latitude + longitude)
  cursor = db.cursor()
  query = 'INSERT INTO locations (child_id, latitude, longitude) values (%s, %s, %s);'
  values = (child_id, latitude, longitude)
  cursor.execute(query, values)
  db.commit()
  db.close()
  return cursor.lastrowid

# SELECT SQL query
def select_users(username:str=None) -> list:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  if username == None:
    query = f"select user_id, email, first_name, last_name, username, password from users;"
    cursor.execute(query)
    result = cursor.fetchall()
  else:
    query = f'select user_id, email, first_name, last_name, username, password from users where username="{username}";'
    cursor.execute(query)
    result = cursor.fetchone()
  db.close()
  return result

def select_children(parent_id:int) -> list: 
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = f'SELECT child_id, first_name, last_name FROM children WHERE parent_id="{parent_id}";'
  cursor.execute(query)
  result = cursor.fetchall()
  db.close()
  return result 

def select_coordinates(child_id:int) -> list:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = f'SELECT location_id, latitude, longitude FROM locations WHERE child_id = "{child_id}" ORDER BY location_id DESC LIMIT 1;'
  cursor.execute(query)
  result = cursor.fetchone()
  db.close()

  if result is not None:
    location_id, latitude, longitude = result
    return {'location_id': location_id, 'latitude': float(latitude), 'longitude': float(longitude)}
  else:
    return {} # empty if no result

# UPDATE SQL query
def update_user(user_id:int, username:str, email:str, password:str) -> bool:
  password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = "update users set username=%s, email=%s, password=%s where user_id=%s;"
  values = (username, email, password, user_id)
  cursor.execute(query, values)
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

# UPDATE user email ONLY based on user_id
def update_username(user_id:int, username:str) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = "update users set username=%s where user_id=%s;"
  values = (username,user_id)
  cursor.execute(query,values)
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

# UPDATE user email ONLY based on user_id
def update_email(user_id:int, email:str) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = "update users set email=%s where user_id=%s;"
  values = (email,user_id)
  cursor.execute(query,values)
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

# UPDATE user password ONLY based on user_id
def update_password(user_id:int, password:str) -> bool:
  encrypted_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# UPDATE user email ONLY based on user_id
def update_username(user_id:int, username:str) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = "update users set username=%s where user_id=%s;"
  values = (username,user_id)
  cursor.execute(query,values)
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

# UPDATE user email ONLY based on user_id
def update_email(user_id:int, email:str) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = "update users set email=%s where user_id=%s;"
  values = (email,user_id)
  cursor.execute(query,values)
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

# UPDATE user password ONLY based on user_id
def update_password(user_id:int, password:str) -> bool:
  encrypted_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = "update users set password=%s where user_id=%s;"
  values = (encrypted_password,user_id)
  query = "update users set password=%s where user_id=%s;"
  values = (encrypted_password,user_id)
  cursor.execute(query,values)
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

def update_child(first_name: str, last_name: str, child_id: int) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()

  query = "UPDATE children SET first_name=%s, last_name=%s WHERE child_id=%s;"
  values = (first_name, last_name, child_id)

  cursor.execute(query, values)
  db.commit()
  db.close()

  return True if cursor.rowcount == 1 else False

# DELETE SQL query
def delete_user(user_id:int) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  cursor.execute(f"delete from users where id={user_id};")
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

# SELECT query to verify hashed password of users
def check_user_password(username:str, password:str) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = 'select password from users where username=%s'
  cursor.execute(query, (username,))
  result = cursor.fetchone()
  cursor.close()
  db.close()

  if result is not None:
    return bcrypt.checkpw(password.encode('utf-8'), result[0].encode('utf-8'))
  return False

# SELECT query to grab user id based on username
def grab_user_userid(username: str):
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = 'select user_id from users where username=%s'
  cursor.execute(query, (username,))
  result = cursor.fetchone()
  cursor.close()
  db.close()
  return result

# Check if username already exists in the database
def nonexistent_username(username: str)->bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = 'select count(*) from users where username=%s'
  cursor.execute(query, (username,))
  result = cursor.fetchone()
  if (result[0] > 0): return False
  cursor.close()
  db.close()
  return True

# Check if email already exists in the database
def nonexistent_email(email: str)->bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = 'select count(*) from users where email=%s'
  cursor.execute(query, (email,))
  result = cursor.fetchone()
  if (result[0] > 0): return False
  cursor.close()
  db.close()
  return True
