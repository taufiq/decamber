import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import '@fortawesome/fontawesome-free/css/all.css';
import 'react-image-crop/dist/ReactCrop.css';
import Incidents from './Incidents';
import CreateIncident from './CreateIncident';
import * as IDBManager from 'idb-keyval'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

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
  const createIncidentCardRef = useRef()
  const [incident, setIncident] = useState(null);
  const { query: set, isLoading, error } = useIdbValue(IDBManager.set)
  const { query: del, isLoading: isDeleting, error: deleteError } = useIdbValue(IDBManager.del)
  const { query: fetchIncidents, isLoading: isGetting, error: getError, data: incidents } = useIdbValue(async () => {
    const fetchedIncidents = _.chain(await IDBManager.entries())
                              .filter((entry) => entry[0] !== "GENERAL_INFORMATION")
                              .map((entry) => ({id: entry[0], ...entry[1]}))
                              .value()
    return fetchedIncidents
  })

  const { query: fetchBasicInformation, isLoading: isGettingBasicInformation, data: basicInformation} = useIdbValue(async () => {
    const fetchedData = await IDBManager.get('GENERAL_INFORMATION')
    if (fetchedData === undefined) {
      return {
        station: "42",
        rota: "1",
        callSign: "",
        sectionCommander: "",
        pumpOperator: "",
        dutyDate: moment()
      }
    }
    return deserializeBasicInformation(fetchedData)
  })

  useEffect(async () => {
    await fetchIncidents()
    await fetchBasicInformation()
  }, [])

  function serializeBasicInformation(deserializedInfo) {
    const keyToSerialize = _.findKey(deserializedInfo, (v) => moment.isMoment(v))
    let serializedBasicInformation = Object.assign({}, deserializedInfo)
    serializedBasicInformation[keyToSerialize] = serializedBasicInformation[keyToSerialize].valueOf()

    return serializedBasicInformation
  }
  function serializeIncident(deserializedInfo) {
    const keysStoringMomentObject = []
    for (const key in deserializedInfo) {
      if (moment.isMoment(deserializedInfo[key])) {
        keysStoringMomentObject.push(key)
      }
    }
    let serializedBasicInformation = Object.assign({}, deserializedInfo)
    for (const key of keysStoringMomentObject) {
      serializedBasicInformation[key] = serializedBasicInformation[key].valueOf()
    }

    return serializedBasicInformation
  }
  function deserializeBasicInformation(deserializedInfo) {
    let serializedBasicInformation = Object.assign({}, deserializedInfo)
    serializedBasicInformation["arrivalTime"] = moment(serializedBasicInformation["arrivalTime"])
    serializedBasicInformation["dispatchTime"] = moment(serializedBasicInformation["dispatchTime"])

    return serializedBasicInformation
  }

  function deserializeBasicInformation(deserializedInfo) {
    let serializedBasicInformation = Object.assign({}, deserializedInfo)
    serializedBasicInformation["dutyDate"] = moment(serializedBasicInformation["dutyDate"])

    return serializedBasicInformation
  }
  
  return (
    !incident
      ? (
        <Incidents
          incidents={incidents}
          onCreateIncident={() => setIncident({})}
          onSelectIncident={(selectedIncident) => setIncident(selectedIncident)}
          onDeleteIncident={(incidentToDelete) => {
            del(incidentToDelete.id)
              .then(() => {
                fetchIncidents()
              })
          }}
          createIncidentCardRef={createIncidentCardRef}
          basicInformation={basicInformation}
          updateBasicInformation={(newBasicInformation) => {
            const serializedInfo = serializeBasicInformation(newBasicInformation)
            set("GENERAL_INFORMATION", serializedInfo)
          }}
          onResetApplication={async () => {
            await IDBManager.clear()
            window.location.reload()
          }}
        />
      )
      : (
        <CreateIncident
          incident={incident}
          onCancel={() => setIncident(null)}
          onSubmit={async (incidentToAdd) => {
            const serializedIncident = serializeIncident(incidentToAdd)
            const idOfIncident = serializedIncident.id || uuidv4()
            set(idOfIncident, serializedIncident)
              .then(() => fetchIncidents())
              .then(() => setIncident(null))
          }}
          error={error}
          isSaving={isLoading}
        />
      )
  );
}

export default App;
