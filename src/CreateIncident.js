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
  


function CreateIncident({ incident, onSubmit }) {
    const { register, handleSubmit, control, setValue: setFormValue, getValues } = useForm()
    const [imageToCrop, setImageToCrop] = useState({ photoCategory: { id: "", formLabel: "" }, src: "" })
  
    const onFormSubmit = async (form) => {
        onSubmit(form)
    //   let generatedPptx = PptxGenerator.createPowerPoint()
    //   await PptxGenerator.populateWithImages(generatedPptx, {
    //     detector: form.detector,
    //     sub_alarm_panel: form.sub_alarm_panel,
    //     main_alarm_panel: form.main_alarm_panel,
    //     others: form.others
    //   }, form.incident_no)
    //   PptxGenerator.savePowerPoint(generatedPptx, 'DECAM.pptx')
    }
  
    const onImageCropConfirm = async (category, { data, size }) => {
      setFormValue(category, [...getValues(category), { data, size }])
      setImageToCrop({ photoCategory: { id: "", formLabel: "" }, src: "" })
    }

    return (
        <Container>
            <Navbar bg="light">
                <Navbar.Brand>DECAM Slide Deck Generator</Navbar.Brand>
            </Navbar>
            <Form onSubmit={handleSubmit(onFormSubmit)}>
                <Form.Group>
                <Form.Label>Incident No.</Form.Label>
                <Form.Control required ref={register} name="incident_no" placeholder="" />
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
                    title={imageToCrop.photoCategory.formLabel}
                    onConfirm={({ data, size }) => onImageCropConfirm(imageToCrop.photoCategory.id, { data, size })}
                    imageToCrop={imageToCrop}
                    onClose={() => setImageToCrop({ photoCategory: { id: "", formLabel: "" }, file: "" })}
                />
                }
                <Button variant="primary" type="submit">
                Submit
                </Button>
            </Form>
    </Container >
    )
}

export default CreateIncident