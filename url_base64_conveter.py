import requests
# import re
import base64

# Step 1: Call the URL
url = "https://dalleprodsec.blob.core.windows.net/private/images/162ced9e-080e-4d98-92d0-bcc59157aea8/generated_00.png?se=2025-10-14T07%3A46%3A23Z&sig=lcXpoRlSKhW5NbUhWnWyDFiLoRrHJ3guqbb6JE7YmsI%3D&ske=2025-10-15T21%3A14%3A26Z&skoid=e52d5ed7-0657-4f62-bc12-7e5dbb260a96&sks=b&skt=2025-10-08T21%3A14%3A26Z&sktid=33e01921-4d64-4f8c-a055-5bdaffd5e33d&skv=2020-10-02&sp=r&spr=https&sr=b&sv=2020-10-02"  # Replace with your URL
# response = requests.get(url)

# if response.status_code == 200:
#     text = response.text
#     print(text)
    
#     # Step 2: Extract Base64 strings using regex
#     # This pattern matches typical Base64 strings
#     base64_pattern = r'(?:[A-Za-z0-9+/]{4}){2,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?'
#     base64_matches = re.findall(base64_pattern, text)
    
#     # Step 3: Decode Base64
#     for i, b64 in enumerate(base64_matches, 1):
#         try:
#             decoded_data = base64.b64decode(b64)
#             print(f"Match {i}: {decoded_data[:100]}...")  # print first 100 bytes
#         except Exception as e:
#             print(f"Match {i}: Failed to decode - {e}")
# else:
#     print(f"Failed to fetch URL. Status code: {response.status_code}")

# Step 2: Fetch the image
response = requests.get(url)

if response.status_code == 200:
    # Step 3: Encode image content to Base64
    image_base64 = base64.b64encode(response.content).decode('utf-8')
    
    # Step 4: Print Base64 string
    print(len(image_base64))
else:
    print(f"Failed to fetch image. Status code: {response.status_code}")