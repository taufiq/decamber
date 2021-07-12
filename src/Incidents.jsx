import { Card, Container, Button, Navbar, Form, Col, Spinner, Modal } from 'react-bootstrap';
import _ from 'lodash';
import * as PptxGenerator from './pptx/Generator';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from 'react-hook-form'
import moment, { isMoment } from 'moment'
import { photoCategories } from './Constants'
import { useEffect, useRef, useState } from 'react';
import * as IDBManager from 'idb-keyval';
import Joi, { valid } from 'joi';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const formFields = [
  {
    id: 'incident_no',
    label: 'Incident No.',
  },
  {
    id: 'dispatchDate',
    label: 'Date Dispatched',
  },
  {
    id: 'dispatchTime',
    label: 'Time Dispatched',
  },
  {
    id: 'arrivalTime',
    label: 'Time Arrived',
  },
  {
    id: 'incidentLocation',
    label: 'Incident Location',
  },
  {
    id: 'premiseOwner',
    label: 'Premises Owner',
  },
  {
    id: 'uenNumber',
    label: 'Premises\' UEN',
  },
  {
    id: 'accompanyingPerson',
    label: 'Accompanying Person Information',
  },
  {
    id: 'classificationAndLocation',
    label: 'Classification and Location',
  },
  {
    id: 'personCaseWasTransferredTo',
    label: 'Case handed over to',
  },
  {
    id: 'otherRemarks',
    label: 'Other Remarks',
  },
]
function IncidentCard({ incident, onSelectIncident, onDeleteIncident, errors }) {
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
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="incident-card-header m-0">Incident No.</p>
            {_.isEmpty(incident.incident_no) ?
              <p className="mb-0" style={{ fontStyle: 'italic' }}>Incident no. not filled in</p>
              : incident.incident_no
            }
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
        </div>
        {!_.isEmpty(errors) &&
          <div className="alert alert-warning mt-3 mb-0" role="alert">
            {!_.isEmpty(errors?.inputFields) && <p className="mb-1" style={{ fontSize: 14 }}>The following fields are not filled:</p>}
            <ul className="pl-4 mb-0">
              {errors?.inputFields?.map(error => {
                if (error !== 'noPhotos') {
                  return <li style={{ fontSize: 14 }}><b>{formFields.filter(field => field.id === error)[0]?.label}</b></li>
                }
              })}
            </ul>
            {!_.isEmpty(errors?.inputFields) && errors?.noPhotos && <hr className="px-0" />}
            {errors.noPhotos && <p className="mb-0">Please upload a photo as well.</p>}
          </div>
        }
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

const schema = Joi.object({
  id: Joi.string(),
  incident_no: Joi.string().not().empty().messages({
    'string.empty': "Incident no is empty"
  }),
  dispatchDate: Joi.any(),
  dispatchTime: Joi.any(),
  arrivalTime: Joi.any(),
  incidentLocation: Joi.string(),
  premiseOwner: Joi.string(),
  uenNumber: Joi.string(),
  accompanyingPerson: Joi.string(),
  classificationAndLocation: Joi.string(),
  personCaseWasTransferredTo: Joi.string(),
  otherRemarks: Joi.string().optional(),
  overview: Joi.array().default([]),
  sub_alarm_panel: Joi.array().default([]),
  main_alarm_panel: Joi.array().default([]),
  overview_fault: Joi.array().default([]),
  close_up_fault: Joi.array().default([])
}).unknown(true)

function ConfirmationModal({ title, body, onClose, onSuccess, show }) {
  return (
    <Modal show={show} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{body}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSuccess}>Generate</Button>
      </Modal.Footer>
    </Modal>
  )
}
function Incidents({
  incidents, onCreateIncident, onSelectIncident, onDeleteIncident, basicInformation, updateBasicInformation, isLoadingBasicInformation, onResetApplication, createIncidentCardRef
}) {
  const { register, handleSubmit, getValues, setValue, control, watch, reset, trigger } = useForm({
    defaultValues: basicInformation
  })


  const watchAllInputs = watch()
  const [errors, setErrors] = useState({})
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false)
  const [shouldShake, setShouldShake] = useState(false)

  const formRef = useRef();

  useEffect(() => {
    let handler
    if (shouldShake) {
      handler = setTimeout(() => setShouldShake(false), 600)
    }

    return () => {
      if (handler) {
        clearTimeout(handler)
      }
    }
  }, [shouldShake])
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
      createIncidentCardRef?.current?.focus()
    }
  }, [incidents])

  useEffect(() => {
    const handler = setTimeout(async () => {
      const storedInformation = await IDBManager.get("GENERAL_INFORMATION")
      const hasFormChanged = !shallowCompare(storedInformation, serializeBasicInformation(watchAllInputs))
      if (hasFormChanged) {
        if (updateBasicInformation) updateBasicInformation(watchAllInputs)
      }
    }, 500)

    return async () => {
      clearTimeout(handler)
    }

  }, [watchAllInputs])


  function validateIncidentForm(incident) {
    const validationResult = schema.validate(incident, { abortEarly: false })
    let noPhotos = false;
    if (_.isEmpty(incident.main_alarm_panel) && _.isEmpty(incident.overview) && _.isEmpty(incident.sub_alarm_panel) && _.isEmpty(incident.overview_fault) && _.isEmpty(incident.close_up_fault)) {
      noPhotos = true
    }

    if (!validationResult.error && !noPhotos) {
      return null
    }

    let inputFields = []

    if (validationResult.error) {
      const { error: { details } } = validationResult
      console.log(details)
      inputFields = details.map(detail => detail.context.key)
    }

    return { errors: { inputFields, noPhotos } }
  }

  function onSubmit(form) {
    let warnings = {}
    for (const incident of incidents) {
      const validationResult = validateIncidentForm(incident)

      if (!validationResult) continue

      const { inputFields, noPhotos } = validationResult.errors
      console.log(inputFields)

      const errorToAdd = { [incident.id]: { inputFields, noPhotos } }
      warnings[incident.id] = errorToAdd[incident.id]
      setErrors(prevState => ({ ...prevState, ...errorToAdd }))
    }

    if (_.isEmpty(warnings)) {
      generateSlides(form)
      return
    }
    setIsConfirmationModalVisible(true)
  }

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
      let pickedImages = {}
      for (let photoCategory of photoCategories) {
        pickedImages[photoCategory.id] = incident[photoCategory.id] || []
      }
      PptxGenerator.addImages(generatedPptx, pickedImages, incident.incident_no, incident.otherRemarks)
    }
    PptxGenerator.savePowerPoint(generatedPptx, `S${station}_R${rota}_${dutyDate.format('DDMMYYYY')}`)

    // confirmAlert({
    //   title: 'Confirm Generation?',
    //   // childrenElement: () => {
    //   //   if (_.isEmpty(summaryOfWarnings)) return <div></div>;
    //   //   return (
    //   //     <div class="alert alert-warning mt-3 mb-0" role="alert">
    //   //       <ul className="pl-4 mb-0">
    //   //         {summaryOfWarnings?.map(error => {
    //   //           if (error !== 'noPhotos') {
    //   //             return <li style={{ fontSize: 14 }}><b>{formFields.filter(field => field.id === error)[0]?.label}</b></li>
    //   //           }
    //   //         })}
    //   //       </ul>
    //   //       {!!summaryOfWarnings.filter(warning => warning === 'noPhotos')[0] && <hr className="px-0" />}
    //   //       {!!summaryOfWarnings.filter(warning => warning === 'noPhotos')[0] && <p className="mb-0">Photos weren't uploaded for some as well</p>}
    //   //     </div>
    //   //   )
    //   // },
    //   message: 'Some fields in some of the incidents have not been filled out. You can go back to fill it up or proceed with generation',
    //   buttons: [
    //     {
    //       label: 'Generate',
    //       onClick: () => PptxGenerator.savePowerPoint(generatedPptx, `S${station}_R${rota}_${dutyDate.format('DDMMYYYY')}`)
    //     },
    //     {
    //       label: 'Go back',
    //     }
    //   ]
    // })
  }
  return (
    <>
      <div>
        <Navbar className="py-3 justify-content-between" bg="dark" variant="dark">
          <Navbar.Brand className="">DECAM Slidedeck Generator</Navbar.Brand>
        </Navbar>
      </div>
      <Container className="mt-3">
        <Form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <Card className="mt-3">
            <Card.Header>General Information</Card.Header>
            <Card.Body>
              {isLoadingBasicInformation && <Spinner animation="border" data-testid="loadingSpinner"/>}
              {!isLoadingBasicInformation &&
                <>
                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label htmlFor="station">Station</Form.Label>
                        <Form.Control as="select" ref={register} name="station" id="station">
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
                          <option>81</option>
                          <option>82</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label htmlFor="rota">Rota</Form.Label>
                        <Form.Control as="select" ref={register} name="rota" id="rota">
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
                        <Form.Label htmlFor="dutyDate">Duty Date</Form.Label>
                        <Controller
                          control={control}
                          name="dutyDate"
                          defaultValue={moment()}
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
                        <Form.Label htmlFor="callSign">Call Sign</Form.Label>
                        <Form.Control ref={register} required name="callSign" id="callSign" placeholder="e.g PL411E" />
                      </Form.Group>
                    </Col>
                  </Form.Row>
                  <Form.Group>
                    <Form.Label htmlFor="sectionCommander">SC</Form.Label>
                    <Form.Control ref={register} required name="sectionCommander" id="sectionCommander" placeholder="e.g SGT(2) Tan A" />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label htmlFor="pumpOperator">PO</Form.Label>
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
                      id="pumpOperator"
                      placeholder="e.g SGT(3) Muhammed B"
                    />
                  </Form.Group>
                </>
              }
            </Card.Body>
          </Card>
          {
            incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onSelectIncident={() => onSelectIncident(incident)}
                onDeleteIncident={() => onDeleteIncident(incident)}
                errors={errors[incident.id]}
              />
            ))
          }
          <Card onClick={() => {
            onCreateIncident()
          }} className={`dotted mt-3 shadow-sm border border-secondary ${shouldShake && 'shake'}`} ref={createIncidentCardRef} tabIndex="-1" style={{ cursor: 'pointer' }}>
            <Card.Body className="d-flex justify-content-between">
              <p className="m-0">Add Incident</p>
              <i className="fas fa-plus align-self-center" />
            </Card.Body>
          </Card>
          <Button type="button" className="mt-4 mb-3 bg-secondary" onClick={onResetApplication}>Reset All</Button>
          <Button type="button" className="mt-4 mb-3 float-right" onClick={() => {
            if (_.isEmpty(incidents)) {
              setShouldShake(true)
              return
            }
              formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
          }}
          >Generate Powerpoint</Button>
        </Form>
        <div className="dropdown-divider"></div>
        <footer className="my-3 text-muted text-center text-small">
          <p className="mb-1">Facing problems? Report it <a href="https://go.gov.sg/decamerror">here</a></p>
        </footer>
        <ConfirmationModal 
          title="Are you sure?"
          body="Some fields in some of the incidents have not been filled out. You can go back to fill it up or proceed with generation"
          onClose={() => setIsConfirmationModalVisible(false)}
          onSuccess={() => {
            setIsConfirmationModalVisible(false)
            generateSlides(getValues())
          }}
          show={isConfirmationModalVisible}
        />
      </Container>
    </>
  );
}

export default Incidents;
