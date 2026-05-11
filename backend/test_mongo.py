from pymongo import MongoClient

url = "mongodb+srv://tunnelandvision_db_user:Alphanewx%40888@intermaven-c.vjbwldo.mongodb.net/?appName=intermaven-c"
client = MongoClient(url)
print(client.admin.command('ping'))
print("Connected successfully!")