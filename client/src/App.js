import { Form, Col, Container, Navbar, Row, Button, Modal } from 'react-bootstrap'
import Dropzone from './Dropzone'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import React, { useState, useRef } from 'react';
import axios from 'axios'
import { saveAs } from 'file-saver'
import '@fortawesome/fontawesome-free/css/all.css'
import { Controller, useForm } from 'react-hook-form'
import { snakeCase, capitalCase } from 'change-case'
import 'react-image-crop/dist/ReactCrop.css';
import Cropper from './Cropper';
import * as Generator from './Generator';

const photoCategories = ["Call Text", "Detector", "Sub Alarm Panel", "Main Alarm Panel"]


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
  const [imageToCrop, setimageToCrop] = useState({ name: "", file: "" })

  const onFormSubmit = async (form) => {
    const formData = new FormData()
    formData.append("incident_no", form.incident_no)
    formData.append("stop_message", form.stop_message)
    formData.append("call_text", form.call_text[0])
    formData.append("detector", form.detector[0])
    formData.append("sub_alarm_panel", form.sub_alarm_panel[0])
    formData.append("main_alarm_panel", form.main_alarm_panel[0])

    let generatedPptx = Generator.createPowerPoint()
    
    await Generator.populateWithImages(generatedPptx, {
      call_text: { image: await convertFileToBase64(form.call_text.blob[0]), size: form.call_text.size },
      detector: { image: await convertFileToBase64(form.detector.blob[0]), size: form.detector.size },
      sub_alarm_panel: { image: await convertFileToBase64(form.sub_alarm_panel.blob[0]), size: form.sub_alarm_panel.size },
      main_alarm_panel: { image: await convertFileToBase64(form.main_alarm_panel.blob[0]), size: form.main_alarm_panel.size },
    }, form.incident_no)
    Generator.savePowerPoint(generatedPptx, 'DECAM.pptx')
    // const response = axios.post("http://127.0.0.1:5000/presentation", formData, { responseType: 'blob', headers: { "Content-Type": "multipart/form-data" } })
    // response
    //   .then(result => {
    //     const generatedPresentation = result.data
    //     const blob = new Blob([generatedPresentation])
    //     saveAs(blob, 'download.pptx')
    //   })
  }

  const onImageDrop = (imageFiles, category) => {
    const imageFile = imageFiles[0]
    const src = URL.createObjectURL(imageFile)
    setimageToCrop({ category, file: imageFile, src })
  }

  const onImageCropConfirm = async (category, { croppedImage, size }) => {
    setFormValue(category, { blob: [croppedImage], size })
    setimageToCrop({ category: "", file: "" })
  }

  return (
    <Container>
      <Navbar bg="light">
        <Navbar.Brand>Decam PowerPoint Generator</Navbar.Brand>
      </Navbar>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Form.Group>
          <Form.Label>Incident No.</Form.Label>
          <Form.Control ref={register} name="incident_no" placeholder="" />
        </Form.Group>
        {/* <Form.Group>
          <Form.Label>Stop Message</Form.Label>
          <Form.Control ref={register} name="stop_message" as="textarea" rows={4} placeholder="" />
        </Form.Group> */}
        {photoCategories.map(photoCategory =>
          <Form.Group key={photoCategory}>
            <Form.Label>{photoCategory}</Form.Label>
            <Controller
              control={control}
              name={`${snakeCase(photoCategory)}`}
              render={({ onChange, value }) =>
                <Dropzone
                  register={register}
                  setDroppedFiles={onChange}
                  droppedFiles={value.blob}
                  onDrop={(files) => onImageDrop(files, `${snakeCase(photoCategory)}`)}
                />
              }
              defaultValue={{ blob: [], size: {} }}
            />
          </Form.Group>
        )
        }
        {
          imageToCrop.category &&
          <Cropper
            onConfirm={onImageCropConfirm}
            imageToCrop={imageToCrop}
            onClose={() => setimageToCrop({ name: "", file: "" })}
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
