import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import '@fortawesome/fontawesome-free/css/all.css';
import 'react-image-crop/dist/ReactCrop.css';
import Incidents from './Incidents';
import CreateIncident from './CreateIncident';
import * as IDBManager from 'idb-keyval'
import moment from 'moment'

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
  const { query: set, isLoading, error } = useIdbValue(IDBManager.set)
  const { query: del, isLoading: isDeleting, error: deleteError } = useIdbValue(IDBManager.del)
  const { query: fetchIncidents, isLoading: isGetting, error: getError, data: incidents } = useIdbValue(async () => {
    const fetchedIncidents = _.chain(await IDBManager.entries())
                              .filter((entry) => entry[0] !== "GENERAL_INFORMATION")
                              .map((entry) => entry[1])
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

  useEffect(() => {
    // console.log(basicInformation, 'fetched Data')
  }, [basicInformation])

  function serializeBasicInformation(deserializedInfo) {
    const keyToSerialize = _.findKey(deserializedInfo, (v) => moment.isMoment(v))
    let serializedBasicInformation = Object.assign({}, deserializedInfo)
    serializedBasicInformation[keyToSerialize] = serializedBasicInformation[keyToSerialize].valueOf()

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
            del(incidentToDelete.incident_no)
              .then(() => {
                values()
              })
          }}
          basicInformation={basicInformation}
          updateBasicInformation={(newBasicInformation) => {
            const serializedInfo = serializeBasicInformation(newBasicInformation)
            set("GENERAL_INFORMATION", serializedInfo)
          }}
          onResetApplication={async () => {
            await IDBManager.clear()
            location.reload()
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
