import requests
import sqlite3

URL = "https://nominatim.openstreetmap.org/search/"
def locate(callsign):
    con = sqlite3.connect("entity.sqlite3")
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("select * from entity where call_sign=?", [callsign.upper()])
    try:
        data = cur.fetchall()[-1]
    except Exception as e:
        return (f"Call sign '{callsign}' not found.")
    print(data['first_name'] + " " +data['middle_initial'] + " " + data['last_name'],\
    "\n" + data['street_address'],data['city'],data['state'],data['zip_code'])
    location = {'street':data['street_address'],\
    #'city':data['city'],\
    'state':data['state'],\
    'postalcode':data['zip_code'][:5],\
    'format':'jsonv2'}
    r = requests.get(URL, params=location).json()
    try:
        r[0]
    except Exception as e:
        return Exception(f"Address '{data['street_address']} {data['city']} {data['state']} {data['zip_code']}' not found.")
    return {**{key:data[key] for key in data.keys()},**{'lat':r[0]['lat'], 'lon':r[0]['lon']}}
