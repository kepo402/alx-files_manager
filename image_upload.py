import base64
import requests
import sys

# Ensure that the script is called with the required arguments
if len(sys.argv) < 4:
    print("Usage: python image_upload.py <file_path> <X-Token> <parent_id>")
    sys.exit(1)

# Extract command line arguments
file_path = sys.argv[1]
x_token = sys.argv[2]
parent_id = sys.argv[3]

# Extract the file name from the provided file path
file_name = file_path.split('/')[-1]

# Function to encode image file to base64
def encode_image(file_path):
    """Encodes the image file to base64 format."""
    with open(file_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Encode the image file
encoded_image = encode_image(file_path)

# Prepare the JSON payload for the API request
payload = {
    'name': file_name,
    'type': 'image',
    'isPublic': True,
    'data': encoded_image,
    'parentId': parent_id
}

# Set the headers, including the X-Token for authentication
headers = {'X-Token': x_token}

# Make the POST request to the API endpoint
try:
    response = requests.post("http://0.0.0.0:5000/files", json=payload, headers=headers)
    # Check for successful request
    if response.status_code == 200:
        print("Image uploaded successfully.")
        print("Response:", response.json())
    else:
        print(f"Failed to upload image. Status code: {response.status_code}")
        print("Error:", response.json())
except requests.exceptions.RequestException as e:
    print(f"An error occurred while making the request: {e}")

