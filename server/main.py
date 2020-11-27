from flask import Flask, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
from pptx_generator import generate_presentation

@app.route('/presentation', methods=['POST'])
def hello():
    incident_no = request.form.get('incident_no')
    stop_message = request.form.get('stop_message')
    pictures = request.files.getlist('picture')
    for picture in pictures:
        picture.save(f'buffer_evidences/{picture.filename}')
    presentation = generate_presentation(incident_no, stop_message)
    presentation.save('draft.pptx')
    return send_file('draft.pptx', attachment_filename="download.pptx", as_attachment=True)