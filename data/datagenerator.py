import json
import csv
from collections import defaultdict

## Convert CSV file into JSON file 
csv_file = 'data\Video_Games_Sales.csv'
json_file = 'data\overview.json'

## Read csv file

def read_csv(csv_file, json_file):
    rows = defaultdict(list)
    unique_gerne = []
    with open(csv_file) as files:
        reader = csv.DictReader(files)
        #field = reader.fieldnames
        for row in reader:
            year = row['Year_of_Release']
            game_info = {
                'game': row['Name'],
                'company': row['Publisher'],
                'genre': row['Genre'],
                'na_sales': float(row['NA_Sales']),
                'eu_sales': float(row['EU_Sales']),
                'jp_sales': float(row['JP_Sales']),
                'other_sales': float(row['Other_Sales']),
                'global_sales': float(row['Global_Sales'])
            }
            if (row['Genre'] not in unique_gerne and row['Genre'] != ''):
                unique_gerne.append(row['Genre'])
                
            if (row['User_Count'] == ''):
                game_info['user_count'] = None
            else:
                game_info['user_count'] = int(row['User_Count'])
            #rows.append(year)
            rows[year].append(game_info)
        data = []
        for year, game in rows.items():
            data.append({'games_info': game, 'year': year})
        data = sorted(data, key = lambda item:item['year'])
        convert_write_json(data, json_file)
        print("Gerne: ", unique_gerne)
        
    files.close()
    
## Convert CSV data into JSON data
def convert_write_json(data, json_file):
    with open (json_file, 'w') as f:
        f.write(json.dumps(data, sort_keys=False, indent=4, separators=(', ', ': ')))
    f.close()
    
read_csv(csv_file, json_file)
'''
## Prepare Data for scenes used 
data = json.load(open(json_file))

# Scene 1 data: 
scene1_json_file = 'data\Overview.json'
unique_gerne = []
def generate_overview_data():
    scene1_data = []
    
generate_overview_data()

# Scene 2 data: [Company:Year:Revenue]
scene2_json_file = 'data\Sales_Details.json'
unique_company = []
def generate_sales_overview_data():
    scene2_data = []
    fields = ['Company', 'Game', 'Year', 'Revenue']
    for d in data:
        if (d['Company'] not in unique_company and d['Company'] != 'N/A'):
            unique_company.append(d['Company'])
        revenue = float(d['NA_Sales']) + float(d['EU_Sales']) + float(d['JP_Sales']) + float(d['Other_Sales']) + float(d['Global_Sales'])
        #print('Company: ', d['Publisher'], '\nYear: ', d['Year_of_Release'], '\nRevenue: ', revenue)
        scene2_data.append({fields[0] : d['Company'], fields[1] : d['Name'], fields[2] : d['Year_of_Release'], fields[3] : revenue})
    #convert_write_json(scene2_data, scene2_json_file)
    ##print('Company: ', unique_company)
generate_sales_overview_data()

# Scene 3 data: [Games:Company:Revenue]
'''
'''
    for y in range(1980, 2017):
        for d in data:
            if (d['Genre'] not in unique_gerne and d['Genre'] != ''):
                unique_gerne.append(d['Genre'])
            scene1_data.append({'Genere' : d['Genre'], 'Game' : d['Name'], 'Company' : d['Publisher'], 'Global Sales' : d['Global_Sales'], 'User' : d['User_Count'], 'Platform' : d['Platform']})
    scene1_data.append({'Year': y})
    convert_write_json(scene1_data, scene1_json_file)
    print('Gerne: ', unique_gerne)
'''

'''
current = {
                element[secondary_field]:
                    {
                        'Company': element['Publisher'], 
                        'Genre' : element['Genre'], 
                        'NA_Sales' : element['NA_Sales'],
                        'EU_Sales' : element['EU_Sales'],
                        'JP_Sales' : element['JP_Sales'],
                        'Other_Sales' : element['Other_Sales'],
                        'Global_Sales' : element['Global_Sales'],
                        'User_Count' : element['User_Count'],
                        'Platform' : element['Platform'],
                }
                for element in group
            }
'''