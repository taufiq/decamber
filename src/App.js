import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css'
import 'react-image-crop/dist/ReactCrop.css';
import Incidents from './Incidents';
import CreateIncident from './CreateIncident';
import _ from 'lodash'

function App() {
  const [incidents, setIncidents] = useState([])
  const [incident, setIncident] = useState(null)

  return (
    !incident ?
    <Incidents
      incidents={incidents}
      onCreateIncident={() => setIncident({})}
      onSelectIncident={(incident) => setIncident(incident)}
    />
    : <CreateIncident incident={incident} onSubmit={(form) => {
      const existingIncidentIndex = _.findIndex(incidents, (incident) => form.incident_no === incident.incident_no)
      if (existingIncidentIndex === -1) {
        setIncidents([...incidents, form])
      } else {
        const newIncidents = incidents
        newIncidents[existingIncidentIndex] = form
        setIncidents(newIncidents)
      }
      setIncident(null)
    }}/>
  )
 }

export default App;
