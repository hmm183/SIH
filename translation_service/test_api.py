import urllib.request
import json

def test_api():
    url = "http://localhost:5005/translate"
    payload = {
        "q": ["Hello", "Patient Profile", "Prescriptions", ""],
        "target": "ml"  # Malayalam
    }
    
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode('utf-8'), 
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            print("API Response status: 200 OK")
            print("Translations (bytes format to prevent terminal crashes):")
            for idx, text in enumerate(res_json["translations"]):
                print(f"  {idx}: {text.encode('ascii', errors='backslashreplace')}")
            
            # Basic validation
            assert len(res_json["translations"]) == 4
            assert res_json["translations"][3] == ""  # Empty string mapping
            print("Test PASSED successfully!")
    except Exception as e:
        print("API Test FAILED:", e)

if __name__ == '__main__':
    test_api()
