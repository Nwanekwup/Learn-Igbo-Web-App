import requests
import csv
import time

# --- SETUP ---
API_KEY = "84e916fa-d958-4d65-9adc-7b068ccbfdf5" 
URL = "https://igboapi.com/api/v1/words"

def fetch_all_igbo_data():
    print("Connecting to the Igbo API for full database extraction...")
    
    headers = {
        "X-API-Key": API_KEY
    }
    
    # We will use a dictionary to automatically prevent duplicate words!
    cleaned_words_dict = {}
    
    # Loop through the alphabet to satisfy the API's keyword requirement
    alphabet = "abcdefghijklmnopqrstuvwxyz"
    
    for letter in alphabet:
        page = 0
        has_more_data = True
        
        print(f"\n--- Extracting words containing the letter '{letter.upper()}' ---")
        
        while has_more_data:
            params = {
                "keyword": letter,
                "limit": 500,
                "page": page
            }

            try:
                response = requests.get(URL, headers=headers, params=params)
                response.raise_for_status() 
                
                raw_data = response.json()
                
                # If we get an empty list, there are no more pages for this letter
                if not raw_data:
                    break

                # The custom parsing logic
                for item in raw_data:
                    igbo_word = item.get("word", "")
                    
                    english_translation = ""
                    definitions = item.get("definitions", [])
                    if definitions and len(definitions) > 0:
                        if isinstance(definitions[0], dict) and "definitions" in definitions[0]:
                            english_translation = definitions[0]["definitions"][0]
                        elif isinstance(definitions[0], str):
                            english_translation = definitions[0]

                    pronunciation_guide = item.get("pronunciation", "") 
                    
                    if igbo_word and english_translation:
                        # Using the word as the dictionary key prevents duplicates
                        if igbo_word not in cleaned_words_dict:
                            cleaned_words_dict[igbo_word] = {
                                "igbo_word": igbo_word,
                                "english_translation": english_translation,
                                "pronunciation_guide": pronunciation_guide
                            }

                print(f"Page {page} complete. Unique words collected so far: {len(cleaned_words_dict)}")
                page += 1
                
                # Pause for half a second to avoid overloading the API
                time.sleep(0.5)

            except requests.exceptions.RequestException as e:
                print(f"Failed to fetch data for letter {letter} on page {page}: {e}")
                break

    # --- SAVE TO CSV ---
    csv_filename = "igbo_vocabulary_full.csv"
    print(f"\nSuccessfully cleaned {len(cleaned_words_dict)} total unique words.")
    print(f"Saving to {csv_filename}...")
    
    with open(csv_filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["igbo_word", "english_translation", "pronunciation_guide"])
        writer.writeheader()
        writer.writerows(cleaned_words_dict.values())
        
    print(f"Done! {csv_filename} is completely packed and ready for your database.")

if __name__ == "__main__":
    fetch_all_igbo_data()