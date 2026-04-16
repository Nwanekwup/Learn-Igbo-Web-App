import requests
import csv

# --- SETUP ---

API_KEY = "84e916fa-d958-4d65-9adc-7b068ccbfdf5" 

# The Igbo API endpoint for fetching words
URL = "https://igboapi.com/api/v1/words"

def fetch_and_clean_data():
    print("Connecting to the Igbo API...")
    
    headers = {
        "X-API-Key": API_KEY
    }
    
    params = {
        "keyword": "a",
        "limit": 500 
    }

    try:
        # Make the GET request to the API
        response = requests.get(URL, headers=headers, params=params)
        
        # If the key is wrong or server is down, this throws an error
        response.raise_for_status() 
        
        # Convert the response into a Python list of dictionaries
        raw_data = response.json()
        print(f"Successfully downloaded {len(raw_data)} words. Cleaning data...")

        cleaned_words = []

        # Loop through the massive JSON payload and extract only what we need
        for item in raw_data:
            igbo_word = item.get("word", "")
            
            # The API stores definitions inside a nested list. We grab the first one.
            english_translation = ""
            definitions = item.get("definitions", [])
            if definitions and len(definitions) > 0:
                # Some API versions nest definitions inside a 'definitions' key within the object
                if isinstance(definitions[0], dict) and "definitions" in definitions[0]:
                    english_translation = definitions[0]["definitions"][0]
                elif isinstance(definitions[0], str):
                    english_translation = definitions[0]

            # The API sometimes provides phonetic spelling or audio; we'll grab pronunciation if it exists
            pronunciation_guide = item.get("pronunciation", "") 
            
            # Only add to our list if it has both the Igbo word and English translation
            if igbo_word and english_translation:
                cleaned_words.append({
                    "igbo_word": igbo_word,
                    "english_translation": english_translation,
                    "pronunciation_guide": pronunciation_guide
                })

        # --- SAVE TO CSV ---
        csv_filename = "igbo_vocabulary.csv"
        print(f"Saving to {csv_filename}...")
        
        with open(csv_filename, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=["igbo_word", "english_translation", "pronunciation_guide"])
            writer.writeheader()
            writer.writerows(cleaned_words)
            
        print(f"Done! {csv_filename} is ready for your database.")

    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch data from the API: {e}")

if __name__ == "__main__":
    fetch_and_clean_data()