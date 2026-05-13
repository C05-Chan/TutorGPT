#######################################################
#                                                     #
#       This file is to connect to the database       #
#                                                     #
#######################################################

import sqlite3
import os

MAIN_DIRECTORY = os.path.dirname(__file__)
DATABASE_PATH = os.path.join(MAIN_DIRECTORY, "tutgpt.db")
SQL_PATH = os.path.join(MAIN_DIRECTORY, "tutgpt.sql")

def get_connection():
####################################################
#                                                  #
#       Opens and connects to the database         #
#                                                  #
####################################################
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.execute("PRAGMA foreign_keys = ON") #this enables foreign key constraints per connection as they are off by default.
    return connection

def init_db():
###############################################################
#                                                             #
#       Executes the sql scrip and creates the database       #
#                                                             #
###############################################################
    connection = get_connection()
    
    with open(SQL_PATH, "r") as file:
        connection.executescript(file.read()) #this reads the file and executes the SQL statements and creates the schema inside the file

    connection.close()
    