import { Form, Container, Navbar, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css'
import { Controller, useForm } from 'react-hook-form'
import 'react-image-crop/dist/ReactCrop.css';
import Cropper from './Cropper';
import * as PptxGenerator from './pptx/Generator';
import PhotoUploadList from './PhotoUploadList';
import Incidents from './Incidents';
import CreateIncident from './CreateIncident';

const photoCategories = [
  {
    id: 'detector',
    formLabel: 'Detector'
  },
  {
    id: 'sub_alarm_panel',
    formLabel: 'Sub Alarm Panel'
  },
  {
    id: 'main_alarm_panel',
    formLabel: 'Main Alarm Panel'
  },
  {
    id: 'others',
    formLabel: 'Other Supporting Pictures (Site Area or Layout Plan)'
  },
]


function App() {
  const [incidents, setIncidents] = useState([])
  const [incident, setIncident] = useState(null)

  return (
    !incident ?
    <Incidents incidents={incidents} onCreateIncident={() => setIncident({})}/>
    : <CreateIncident onSubmit={(form) => {
      setIncidents([...incidents, form])
      setIncident(null)
    }}/>
  )
 }

export default App;
