import { Form, Container, Navbar, Button } from 'react-bootstrap'
import Dropzone from './Dropzone'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css'
import { Controller, useForm } from 'react-hook-form'
import 'react-image-crop/dist/ReactCrop.css';
import Cropper from './Cropper';
import * as PptxGenerator from './pptx/Generator';

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


async function convertFileToBase64(file) {
  if (!file) {
    return null
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => resolve(null)
  })
}

function App() {
  const { register, handleSubmit, control, setValue: setFormValue } = useForm()
  const [imageToCrop, setimageToCrop] = useState({ photoCategory: { id: "", formLabel: "" }, file: "" })

  const onFormSubmit = async (form) => {
    let generatedPptx = PptxGenerator.createPowerPoint()
    
    await PptxGenerator.populateWithImages(generatedPptx, {
      detector: { image: await convertFileToBase64(form.detector.blob[0]), size: form.detector.size },
      sub_alarm_panel: { image: await convertFileToBase64(form.sub_alarm_panel.blob[0]), size: form.sub_alarm_panel.size },
      main_alarm_panel: { image: await convertFileToBase64(form.main_alarm_panel.blob[0]), size: form.main_alarm_panel.size },
      others: { image: await convertFileToBase64(form.others.blob[0]), size: form.others.size },
    }, form.incident_no)
    PptxGenerator.savePowerPoint(generatedPptx, 'DECAM.pptx')
  }

  const onImageDrop = (imageFiles, photoCategory) => {
    const imageFile = imageFiles[0]
    const src = URL.createObjectURL(imageFile)
    setimageToCrop({ photoCategory, file: imageFile, src })
  }

  const onImageCropConfirm = async (category, { croppedImage, size }) => {
    setFormValue(category, { blob: [croppedImage], size })
    setimageToCrop({ photoCategory: { id: "", formLabel: "" }, file: "" })
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
                <Dropzone
                  register={register}
                  setDroppedFiles={onChange}
                  droppedFiles={value.blob}
                  onDrop={(files) => onImageDrop(files, photoCategory)}
                />
              }
              defaultValue={{ blob: [] }}
            />
          </Form.Group>
        )
        }
        {
          imageToCrop.photoCategory.id &&
          <Cropper
            title={imageToCrop.photoCategory.formLabel}
            onConfirm={({ croppedImage, size }) => onImageCropConfirm(imageToCrop.photoCategory.id, { croppedImage, size })}
            imageToCrop={imageToCrop}
            onClose={() => setimageToCrop({ photoCategory: { id: "", formLabel: "" }, file: "" })}
          />
        }
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container >
  );
}

export default App;
