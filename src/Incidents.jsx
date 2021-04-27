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
                  <div key={photo.data} className="rounded bg-dark mr-3 mt-2" style={{ width: "4rem", height: "4rem" }}>
                    <img src={photo.data} style={{ objectFit: "contain", width: '100%', height: '100%' }} />
                  </div>
                ))}
          </div>
        </div>
        <div className="d-flex flex-column">
          <button type="button" className="btn-primary rounded px-4 py-2">Edit</button>
          <button
            className="btn-danger rounded px-4 mt-2 py-2"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteIncident();
            }}>Delete</button>
        </div>
      </Card.Body>
    </Card>
  );
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
  incidents, onCreateIncident, onSelectIncident, onDeleteIncident, basicInformation, updateBasicInformation, onResetApplication, createIncidentCardRef
}) {
  const { register, handleSubmit, getValues, setValue, control, watch, reset, trigger } = useForm({
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
    if (_.isEmpty(incidents)) {
      createIncidentCardRef.current?.focus()
    }
  }, [incidents])

  useEffect(() => {
    const handler = setTimeout(async () => {
      const storedInformation = await IDBManager.get("GENERAL_INFORMATION")
      const hasFormChanged = !shallowCompare(storedInformation, serializeBasicInformation(watchAllInputs))
      if (hasFormChanged) {
        updateBasicInformation(watchAllInputs)
      }
    }, 500)

    return async () => {
      clearTimeout(handler)
    }

  }, [watchAllInputs])

  async function generateSlides(form) {
    const { station, rota, dutyDate, callSign, pumpOperator, sectionCommander } = form
    const generatedPptx = PptxGenerator.createPowerPoint();
    for (const incident of incidents) {
      PptxGenerator.addInformationSlideAsTable(generatedPptx, {
        ...incident,
        main_alarm_panel: incident.main_alarm_panel[0],
        incidentNo: incident.incident_no,
        callSign,
        sectionCommander,
        pumpOperator,
      })
      PptxGenerator.addImages(generatedPptx, {
        detector: incident.detector,
        sub_alarm_panel: incident.sub_alarm_panel,
        main_alarm_panel: incident.main_alarm_panel,
        others: incident.others,
      }, incident.incident_no, incident.otherRemarks)
    }
    PptxGenerator.savePowerPoint(generatedPptx, `S${station}_R${rota}_${dutyDate.format('DDMMYYYY')}`);
  }
  return (
    <>
      <div>
        <Navbar className="py-3 justify-content-between" bg="dark" variant="dark">
          <Navbar.Brand className="">DECAM Slidedeck Generator</Navbar.Brand>
        </Navbar>
      </div>
      <Container className="mt-3">
        <Form onSubmit={handleSubmit(generateSlides)}>
          <Card className="mt-3">
            <Card.Header>General Information</Card.Header>
            <Card.Body>
              <Form.Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Station</Form.Label>
                    <Form.Control as="select" ref={register} name="station">
                      <option>11</option>
                      <option>12</option>
                      <option>13</option>
                      <option>14</option>
                      <option>15</option>
                      <option>16</option>
                      <option>17</option>
                      <option>18</option>
                      <option>21</option>
                      <option>22</option>
                      <option>23</option>
                      <option>24</option>
                      <option>31</option>
                      <option>32</option>
                      <option>33</option>
                      <option>34</option>
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
                <Form.Control
                  onKeyDown={async (key) => {
                    if (key.code === "Enter") {
                      const areAllInputsValid = await trigger()
                      if (!areAllInputsValid) return
                      createIncidentCardRef.current.focus()
                    }
                  }}
                  ref={register}
                  required
                  name="pumpOperator"
                  placeholder="e.g SGT(3) Muhammed B"
                />
              </Form.Group>
            </Card.Body>
          </Card>
          {
            incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onSelectIncident={() => onSelectIncident(incident)}
                onDeleteIncident={() => onDeleteIncident(incident)}
              />
            ))
          }
          <Card onClick={onCreateIncident} className="dotted mt-3 shadow-sm border border-secondary" ref={createIncidentCardRef} tabIndex="-1" style={{ cursor: 'pointer' }}>
            <Card.Body className="d-flex justify-content-between">
              <p className="m-0">Add Incident</p>
              <i className="fas fa-plus align-self-center" />
            </Card.Body>
          </Card>
          <Button type="button" className="mt-4 mb-3 bg-secondary" onClick={onResetApplication}>Reset All</Button>
          <Button type="submit" className="mt-4 mb-3 float-right" disabled={_.isEmpty(incidents)}>Generate Powerpoint</Button>
        </Form>
        <div class="dropdown-divider"></div>
        <footer class="my-3 text-muted text-center text-small">
          <p class="mb-1">Facing problems? Report it <a href="https://go.gov.sg/decamerror">here</a></p>
        </footer>
      </Container>
    </>
  );
}

export default Incidents;
