import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import '@fortawesome/fontawesome-free/css/all.css';
import 'react-image-crop/dist/ReactCrop.css';
import Incidents from './Incidents';
import CreateIncident from './CreateIncident';
import * as IDBManager from 'idb-keyval'

function useIdbValue(queryFn) {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])
  return {
    query: async (...args) => {
      setError(null)
      setIsLoading(false)
      try {
        setIsLoading(true)
        setData(await queryFn(...args))
      } catch (settingError) {
        setError(settingError)
        throw settingError
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
    error,
    data
  }
}
function App() {
  const [incident, setIncident] = useState(null);
  const { query: set, isLoading, error} = useIdbValue(IDBManager.set)
  const { query: del, isLoading: isDeleting, error: deleteError} = useIdbValue(IDBManager.del)
  const { query: values, isLoading: isGetting, error: getError, data: incidents} = useIdbValue(IDBManager.values)

  useEffect(async () => {
    await values()
  }, [])

  return (  
    !incident
      ? (
        <Incidents
          incidents={incidents}
          onCreateIncident={() => setIncident({})}
          onSelectIncident={(selectedIncident) => setIncident(selectedIncident)}
          onDeleteIncident={(incidentToDelete) => {
            del(incidentToDelete.incident_no)
            .then(() => {
              values()
            })
          }}
        />
      )
      : (
        <CreateIncident
          incident={incident}
          onCancel={() => setIncident(null)}
          onSubmit={async (incidentToAdd) => {
              set(incidentToAdd.incident_no, incidentToAdd)
              .then(() => values())
              .then(() => setIncident(null))
          }}
          error={error}
          isSaving={isLoading}
        />
      )
  );
}

export default App;
