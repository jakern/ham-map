import requests
import sys

link = "http://wireless.fcc.gov/uls/data/complete/l_amat.zip"
file_name = "data.zip"
with open(file_name, "wb") as f:
        print("Downloading %s" % file_name)
        response = requests.get(link, stream=True)
        total_length = response.headers.get('content-length')

        if total_length is None: # no content length header
            f.write(response.content)
        else:
            dl = 0
            total_length = int(total_length)
            for data in response.iter_content(chunk_size=4096):
                dl += len(data)
                f.write(data)
                done = int(50 * dl / total_length)
                sys.stdout.write("\r[%s%s]" % ('=' * done, ' ' * (50-done)) )
                sys.stdout.flush()

import zipfile
with zipfile.ZipFile("data.zip","r") as zip_ref:
    zip_ref.extract("EN.dat")

import csv
with open('EN.dat', 'r') as en:
    sp = csv.reader(en, delimiter='|')
    to_database = [row[1:] for row in sp]

import sqlite3
con = sqlite3.connect("entity.sqlite3")
cur = con.cursor()
cur.execute("DROP TABLE IF EXISTS entity")
cur.execute("CREATE TABLE entity (id\
             ,uls_file_number\
             ,ebf_number\
             ,call_sign\
             ,entity_type\
             ,licensee_id\
             ,entity_name\
             ,first_name\
             ,middle_initial\
             ,last_name\
             ,suffix\
             ,phone\
             ,fax\
             ,email\
             ,street_address\
             ,city\
             ,state\
             ,zip_code\
             ,po_box\
             ,attention_line\
             ,sgin\
             ,frn\
             ,app_type_code\
             ,app_type_code_other\
             ,status_code\
             ,status_date);")

cur.executemany("INSERT INTO entity (id\
             ,uls_file_number\
             ,ebf_number\
             ,call_sign\
             ,entity_type\
             ,licensee_id\
             ,entity_name\
             ,first_name\
             ,middle_initial\
             ,last_name\
             ,suffix\
             ,phone\
             ,fax\
             ,email\
             ,street_address\
             ,city\
             ,state\
             ,zip_code\
             ,po_box\
             ,attention_line\
             ,sgin\
             ,frn\
             ,app_type_code\
             ,app_type_code_other\
             ,status_code\
             ,status_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);", to_database)
con.commit()
con.close()
