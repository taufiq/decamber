import { Card, Container, Button, Navbar, Form, Col } from 'react-bootstrap';
import _ from 'lodash';
import * as PptxGenerator from './pptx/Generator';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from 'react-hook-form'
import moment, { isMoment } from 'moment'
import { photoCategories } from './Constants'
import { useEffect, useState } from 'react';
import * as IDBManager from 'idb-keyval';


function IncidentCard({ incident, onSelectIncident, onDeleteIncident }) {
  const photos = _.chain(incident)
    .pick(_.map(photoCategories, (category) => category.id))
    .toArray()
    .flatten()
    .value()
  return (
    <Card
      onClick={onSelectIncident}
      className="mt-3 shadow-sm"
    >
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <p className="incident-card-header m-0">Incident No.</p>
          {incident.incident_no}
          <p className="incident-card-header m-0 mt-1">Photos Uploaded</p>
          <div className="d-flex flex-wrap">
            {
              _.isEmpty(photos) ?
                <p className="mb-0" style={{ fontStyle: 'italic' }}>No photos uploaded</p>
                : photos.map((photo) => (
                  <div className="rounded bg-dark mr-3 mt-2" style={{ width: "4rem", height: "4rem" }}>
                    <img src={photo.data} style={{ objectFit: "contain", width: '100%', height: '100%' }} />
                  </div>
                ))}
          </div>
        </div>
        <div className="d-flex flex-column">
          <button className="btn-primary rounded px-4 py-2">Edit</button>
          <button
            className="btn-danger rounded px-4 mt-2 py-2"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteIncident();
            }}>Delete</button>
        </div>
      </Card.Body>
    </Card>
  );
}

function useDebounce(value) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 1500)

    return () => {
      clearTimeout(timer)
    }
  }, [value])

  return debouncedValue
}

function shallowCompare(objectA, objectB) {
  if (!_.isEqual(_.keys(objectA), _.keys(objectB))) {
    return false
  }

  for (const key in objectA) {
    if (isMoment(objectA[key])) {
      if (!objectA[key].isSame(objectB[key])) {
        return false
      }
    }
    if (objectA[key] !== objectB[key]) {
      return false
    }
  }

  return true
}
function Incidents({
  incidents, onCreateIncident, onSelectIncident, onDeleteIncident, basicInformation, updateBasicInformation, onResetApplication
}) {
  const { register, handleSubmit, getValues, setValue, control, watch, reset } = useForm({
    defaultValues: basicInformation
  })


  const watchAllInputs = watch()

  useEffect(() => {
    reset(basicInformation)
  }, [basicInformation])
  function serializeBasicInformation(deserializedInfo) {
    const keyToSerialize = _.findKey(deserializedInfo, (v) => moment.isMoment(v))
    let serializedBasicInformation = Object.assign({}, deserializedInfo)
    serializedBasicInformation[keyToSerialize] = serializedBasicInformation[keyToSerialize].valueOf()

    return serializedBasicInformation
  }


  useEffect(() => {
    const handler = setTimeout(async () => {
      // console.log('executing')
      const storedInformation = await IDBManager.get("GENERAL_INFORMATION")
      console.log(watchAllInputs, 'yuh')
      const hasFormChanged = !shallowCompare(storedInformation, serializeBasicInformation(watchAllInputs))
      console.log(hasFormChanged, 'form changed', storedInformation, watchAllInputs)
      if (hasFormChanged) {
        updateBasicInformation(watchAllInputs)
      }
    }, 4000)

    return async () => {
      console.log('clearing timeout')
      clearTimeout(handler)
    }

  }, [watchAllInputs])

  async function generateSlides(form) {
    const { station, rota, dutyDate, callSign, pumpOperator, sectionCommander } = form
    const generatedPptx = PptxGenerator.createPowerPoint();
    for (const incident of incidents) {
      PptxGenerator.addInformationSlide(
        generatedPptx,
        {
          ...incident,
          main_alarm_panel: incident.main_alarm_panel[0],
          incidentNo: incident.incident_no,
          callSign,
          sectionCommander,
          pumpOperator
        }
      )
      PptxGenerator.addImages(generatedPptx, {
        detector: incident.detector,
        sub_alarm_panel: incident.sub_alarm_panel,
        main_alarm_panel: incident.main_alarm_panel,
        others: incident.others,
      }, incident.incident_no)
    }
    PptxGenerator.savePowerPoint(generatedPptx, `S${station}_R${rota}_${dutyDate.format('DDMMYYYY')}`);
  }
  return (
    <>
      <div>
        <Navbar className="py-3" bg="dark" variant="dark" sticky="top">
          <Navbar.Brand color="light" className="mx-auto">DECAM Slidedeck Generator</Navbar.Brand>
        </Navbar>
      </div>
      <Container className="mt-3">
        <Form onSubmit={handleSubmit(generateSlides)}>
          <Card className="mt-3">
            <Card.Body>
              <Form.Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Station</Form.Label>
                    <Form.Control as="select" ref={register} name="station">
                      <option>41</option>
                      <option>42</option>
                      <option>43</option>
                      <option>44</option>
                      <option>45</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Rota</Form.Label>
                    <Form.Control as="select" ref={register} name="rota">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Duty Date</Form.Label>
                    <Controller
                      control={control}
                      name="dutyDate"
                      render={({ onChange, value }) => (
                        <Datetime
                          value={value}
                          timeFormat=""
                          onChange={(newDate) => onChange(newDate)}
                        />
                      )
                      }
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Call Sign</Form.Label>
                    <Form.Control ref={register} required name="callSign" placeholder="e.g PL411E" />
                  </Form.Group>
                </Col>
              </Form.Row>
              <Form.Group>
                <Form.Label>SC</Form.Label>
                <Form.Control ref={register} required name="sectionCommander" placeholder="e.g SGT(2) Tan A" />
              </Form.Group>
              <Form.Group>
                <Form.Label>PO</Form.Label>
                <Form.Control ref={register} required name="pumpOperator" placeholder="e.g SGT(3) Muhammed B" />
              </Form.Group>
            </Card.Body>
          </Card>
          {
            incidents.map((incident) => (
              <IncidentCard
                key={incident.incident_no}
                incident={incident}
                onSelectIncident={() => onSelectIncident(incident)}
                onDeleteIncident={() => onDeleteIncident(incident)}
              />
            ))
          }
          <Card onClick={onCreateIncident} className="dotted mt-3 shadow-sm">
            <Card.Body className="d-flex justify-content-between">
              Create Incident
          <i className="fas fa-plus" />
            </Card.Body>
          </Card>
          <Button type="button" className="mt-3 mb-5 bg-danger" onClick={onResetApplication}>Reset All</Button>
          <Button type="submit" className="mt-3 mb-5 float-right">Generate Powerpoint</Button>
        </Form>
      </Container>
    </>
  );
}

export default Incidents;
