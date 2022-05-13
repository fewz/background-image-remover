from rembg import remove
import base64
from flask import Flask, request
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route('/api', methods=['POST'])
def index():
    input_path = request.files.get('file')
    if input_path:
        input_path.save(secure_filename('input.png'))
    input_path = 'input.png'
    output_path = 'output.png'

    with open(input_path, 'rb') as i:
        with open(output_path, 'wb') as o:
            input = i.read()
            output = remove(input)
            o.write(output)
       
    with open("output.png", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
        return encoded_string

if __name__ == '__main__':
    app.run(host='127.0.0.1', debug=True)