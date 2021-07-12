import { Form, Container, Navbar, Button, Col } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import React, { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css'
import { Controller, useForm } from 'react-hook-form'
import 'react-image-crop/dist/ReactCrop.css';
import Cropper from './Cropper';
import PhotoUploadList from './PhotoUploadList';
import Datetime from 'react-datetime';
import { photoCategories } from './Constants'
import moment from 'moment';
import _ from 'lodash';


function CreateIncident({ incident, onSubmit, onCancel, error, isSaving }) {
    const { register, handleSubmit, control, setValue: setFormValue, getValues, setError } = useForm({
        defaultValues: incident,

    })
    const [imageToCrop, setImageToCrop] = useState({ photoCategory: { id: "", formLabel: "" }, src: "" })
    const [shouldShowNoPhotoUploadError, setShouldShowNoPhotoUploadError] = useState(false)

    const onFormSubmit = async (form) => {
        const photoCategoryIds = photoCategories.map(category => category.id);
        // if (_.every(getValues(photoCategoryIds), (photoCategoryValue) => _.isEmpty(photoCategoryValue))) {
        //     setShouldShowNoPhotoUploadError(true)
        //     return
        // };
        const formToSubmit = Object.assign({}, form)
        if (incident.id) formToSubmit.id = incident.id
        onSubmit(formToSubmit)
    }
    useEffect(() => {
        let timer
        if (shouldShowNoPhotoUploadError) {
            timer = setTimeout(() => {
                setShouldShowNoPhotoUploadError(false)
            }, 1000)
        }
        return () => {
            if (shouldShowNoPhotoUploadError) {
                clearTimeout(timer)
            }
        }

    }, [shouldShowNoPhotoUploadError])

    const onImageCropConfirm = async (category, { data, size }) => {
        setFormValue(category, [...getValues(category), { data, size }])
        setImageToCrop({ photoCategory: { id: "", formLabel: "" }, src: "" })
    }

    return (
        <>
            { error &&
                <div className="d-flex justify-content-center">
                    <div className="alert alert-danger position-fixed" style={{ zIndex: 99999, bottom: 0 }} role="alert">
                        Error saving. Please try again!
                    </div>
                </div>
            }
            {
                shouldShowNoPhotoUploadError &&
                <div className="d-flex justify-content-center">
                    <div className="alert alert-danger position-fixed" style={{ zIndex: 99999, bottom: 0 }} role="alert">
                        Please upload a photo
                </div>
                </div>
            }
            <Form onSubmit={handleSubmit(onFormSubmit)}>
                <Navbar className="py-3" bg="dark" variant="dark" sticky="top">
                    <Button variant="secondary" className="mr-auto" onClick={onCancel}>Cancel</Button>
                    <Navbar.Brand color="light" className="mx-auto">Add Incident</Navbar.Brand>
                    <Button variant="primary" type="submit" className="ml-auto">
                        {isSaving ?
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            : "Submit"
                        }
                    </Button>
                </Navbar>
                <Container className="pt-2 pb-1">
                    <Form.Group>
                        <Form.Label>Incident No.</Form.Label>
                        <Form.Control ref={register} name="incident_no" placeholder="" />
                    </Form.Group>
                    <Form.Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>Date Dispatched</Form.Label>
                                <Controller
                                    control={control}
                                    name="dispatchDate"
                                    defaultValue={moment()}
                                    render={({ onChange, value }) => (
                                        <Datetime
                                            value={value}
                                            dateFormat="DD/MM/YYYY"
                                            timeFormat={false}
                                            onChange={(newDate) => onChange(newDate)}
                                        />
                                    )
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Time Dispatched</Form.Label>
                                <Controller
                                    control={control}
                                    name="dispatchTime"
                                    defaultValue={moment()}
                                    render={({ onChange, value }) => (
                                        <Datetime
                                            value={value}
                                            dateFormat={false}
                                            timeFormat="HH:mm:ss"
                                            onChange={(newDate) => onChange(newDate)}
                                        />
                                    )
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Form.Group>
                        <Form.Label>Time Arrived</Form.Label>
                        <Controller
                            control={control}
                            name="arrivalTime"
                            defaultValue={moment()}
                            render={({ onChange, value }) => (
                                <Datetime
                                    value={value}
                                    dateFormat={false}
                                    timeFormat="HH:mm:ss"
                                    onChange={(newDate) => onChange(newDate)}
                                />
                            )
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Incident Location</Form.Label>
                        <Form.Control ref={register} name="incidentLocation" placeholder="e.g 123 Teck Street" />
                    </Form.Group>
                    <Form.Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>Premises owner</Form.Label>
                                <Form.Control ref={register} name="premiseOwner" placeholder="e.g Unity Pte. Ltd." />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Premises' UEN</Form.Label>
                                <Form.Control ref={register} name="uenNumber" placeholder="e.g T09LL0001B" />
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Form.Group>
                        <Form.Label>Accompanying Person Information</Form.Label>
                        <Form.Control ref={register} name="accompanyingPerson" placeholder="e.g Mr Devan, Technician, 92345678" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Classification & Location</Form.Label>
                        <Form.Control as="textarea" ref={register} name="classificationAndLocation" placeholder="e.g False alarm malfunction of detector at lift lobby" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Case handed over to</Form.Label>
                        <Form.Control ref={register} name="personCaseWasTransferredTo" placeholder="e.g SGT T123456 (Boon Lay NPC)" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Other remarks</Form.Label>
                        <Form.Control as="textarea" ref={register} name="otherRemarks" placeholder="Enter other remarks here" />
                    </Form.Group>
                    {/* <Form.Group>
                <Form.Label>Stop Message</Form.Label>
                <Form.Control ref={register} name="stop_message" as="textarea" rows={4} placeholder="" />
                </Form.Group> */}
                    {photoCategories.map(photoCategory =>
                        <Form.Group key={photoCategory.id}>
                            <Form.Label>{photoCategory.formLabel}</Form.Label>
                            <Controller
                                control={control}
                                name={photoCategory.id}
                                // rules={{ required: true, validate: (value) => value.length > 0 }}
                                render={({ onChange, value }) =>
                                    <PhotoUploadList
                                        photoCategoryId={photoCategory.id}
                                        photos={value}
                                        onPhotoUpload={(photo) => setImageToCrop({
                                            photoCategory,
                                            src: photo
                                        })}
                                        onPhotoRemove={(dataOfPhotoToBeRemoved) => {
                                            // This won't work if two of the same photos are uploaded
                                            // If one of the two photos were removed, the other one would as well
                                            const remainingPhotos = value.filter((photo) => photo.data !== dataOfPhotoToBeRemoved)
                                            setFormValue(photoCategory.id, remainingPhotos)
                                        }}
                                    />
                                }
                                defaultValue={[]}
                            />
                        </Form.Group>
                    )
                    }
                    {
                        imageToCrop.photoCategory.id &&
                        <Cropper
                            title={`Crop ${imageToCrop.photoCategory.formLabel}`}
                            onConfirm={({ data, size }) => onImageCropConfirm(imageToCrop.photoCategory.id, { data, size })}
                            imageToCrop={imageToCrop}
                            onClose={() => setImageToCrop({ photoCategory: { id: "", formLabel: "" }, file: "" })}
                        />
                    }
                </Container>
                <div className="dropdown-divider mx-4"></div>
                <footer className="my-3 text-muted text-center text-small">
                    <p className="mb-1">Facing problems? Report it <a href="https://go.gov.sg/decamerror">here</a></p>
                </footer>
            </Form>
        </>
    )
}

export default CreateIncident