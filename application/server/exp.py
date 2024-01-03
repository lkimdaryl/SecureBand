import os
from dotenv import load_dotenv
import mysql.connector as mysql

load_dotenv("credentials.env")
db_config = {
  "host": os.environ['MYSQL_HOST'],
  "user": os.environ['MYSQL_USER'],
  "password": os.environ['MYSQL_PASSWORD'],
  "database": os.environ['MYSQL_DATABASE']
}

# print(db_config)
# print(db_config["host"], db_config["user"], db_config["password"], db_config["database"])
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

# value = nonexistent_email("asd@gmail.com")
# print(value)

def delete_child(child_id: int) -> bool:
  db = mysql.connect(**db_config)
  cursor = db.cursor()
  query = (f"DELETE FROM children WHERE child_id = %s;")
  cursor.execute(query, (child_id,))
  db.commit()
  db.close()
  return True if cursor.rowcount == 1 else False

delete_child(12)