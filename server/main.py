from flask import Flask, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
from pptx_generator import generate_presentation
import uuid, os, shutil

@app.route('/presentation', methods=['POST'])
def create_presentation():
    session_id = str(uuid.uuid4())
    incident_no = request.form.get('incident_no')
    stop_message = request.form.get('stop_message')
    call_text = request.files.get('call_text')
    os.mkdir(session_id)
    call_text.save(f'{session_id}/{call_text.filename}')
    presentation = generate_presentation(incident_no, stop_message, session_id)
    presentation.save(f'{session_id}/presentation.pptx')
    # TODO: set filename to location of decam
    response = send_file(f'{session_id}/presentation.pptx', attachment_filename="presentation.pptx", as_attachment=True)
    shutil.rmtree(f'./{session_id}')
    return response