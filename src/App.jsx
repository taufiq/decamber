import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState } from 'react';
import _ from 'lodash';
import '@fortawesome/fontawesome-free/css/all.css';
import 'react-image-crop/dist/ReactCrop.css';
import Incidents from './Incidents';
import CreateIncident from './CreateIncident';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [incident, setIncident] = useState(null);

  return (
    !incident
      ? (
        <Incidents
          incidents={incidents}
          onCreateIncident={() => setIncident({})}
          onSelectIncident={(selectedIncident) => setIncident(selectedIncident)}
          onDeleteIncident={(incidentToDelete) => {
            const newIncidents = _.filter(
              incidents,
              (incident) => incident.incident_no !== incidentToDelete.incident_no,
            );
            setIncidents(newIncidents);
          }}
        />
      )
      : (
        <CreateIncident
          incident={incident}
          onCancel={() => setIncident(null)}
          onSubmit={(incidentToAdd) => {
            const existingIncidentIndex = _.findIndex(
              incidents, (incident) => incidentToAdd.incident_no === incident.incident_no,
            );
            if (existingIncidentIndex === -1) {
              setIncidents([...incidents, incidentToAdd]);
            } else {
              const incidentsCopy = incidents.slice();
              incidentsCopy[existingIncidentIndex] = incidentToAdd;
              setIncidents(incidentsCopy);
            }
            setIncident(null);
          }}
        />
      )
  );
}

export default App;
