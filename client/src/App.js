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
import ReactCrop from 'react-image-crop';

const photoCategories = ["Call Text", "Detector", "Sub Alarm Panel", "Main Alarm Panel"]
const pixelRatio = window.devicePixelRatio || 1;


function App() {
  const { register, handleSubmit, control, setValue } = useForm()
  const [crop, setCrop] = useState({ width: 30, height: 30 })
  const [imageToCrop, setimageToCrop] = useState({ name: "", file: "" })
  const imageRef = useRef({})

  /**
 * @param {HTMLImageElement} image - Image File Object
 * @param {Object} crop - crop Object
 * @param {String} fileName - Name of the returned file in Promise
 */
  function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    // As Base64 string
    // const base64Image = canvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  }

  const onFormSubmit = (form) => {
    console.log(form)
    const formData = new FormData()
    formData.append("incident_no", form.incident_no)
    formData.append("stop_message", form.stop_message)
    formData.append("call_text", form.call_text[0])
    formData.append("detector", form.detector[0])
    formData.append("sub_alarm_panel", form.sub_alarm_panel[0])
    formData.append("main_alarm_panel", form.main_alarm_panel[0])
    debugger

    const response = axios.post("http://127.0.0.1:5000/presentation", formData, { responseType: 'blob', headers: { "Content-Type": "multipart/form-data" } })
    response
      .then(result => {
        const generatedPresentation = result.data
        const blob = new Blob([generatedPresentation])
        saveAs(blob, 'download.pptx')
      })
  }

  const onImageDrop = (imageFiles, name) => {
    const imageFile = imageFiles[0]
    const src = URL.createObjectURL(imageFile)
    setimageToCrop({ name, file: imageFile, src })
  }

  const onImageCropConfirm = async () => {
    const croppedImage = await getCroppedImg(imageRef.current, crop, imageToCrop.name)
    setValue(imageToCrop.name, [croppedImage])
    setimageToCrop({ name: "", file: "" })
  }

  return (
    <Container>
      <Navbar bg="light">
        <Navbar.Brand>Decamber</Navbar.Brand>
      </Navbar>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Form.Group>
          <Form.Label>Incident No.</Form.Label>
          <Form.Control ref={register} name="incident_no" placeholder="A123/21312D" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Stop Message</Form.Label>
          <Form.Control ref={register} name="stop_message" as="textarea" rows={4} placeholder="Zone 3 had sprinkler schwoooooo" />
        </Form.Group>
        {photoCategories.map(photoCategory =>
          <Form.Group key={photoCategory}>
            <Form.Label>{photoCategory}</Form.Label>
            <Controller
              control={control}
              name={`${snakeCase(photoCategory)}`}
              render={({ onChange, value }) =>
                <Dropzone register={register} setDroppedFiles={onChange} droppedFiles={value} onDrop={(files) => onImageDrop(files, `${snakeCase(photoCategory)}`)} />
              }
              defaultValue={[]}
            />
          </Form.Group>
        )
        }
        {imageToCrop.name &&
        <>
          <Modal show={true}>
              <Modal.Header closeButton>
                <Modal.Title>{capitalCase(imageToCrop.name)}</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <ReactCrop
                  onImageLoaded={(img) => { imageRef.current = img }}
                  src={imageToCrop.src}
                  crop={crop}
                  onChange={newCrop => setCrop(newCrop)}
                />
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary">Close</Button>
                <Button variant="primary" onClick={onImageCropConfirm}>Save changes</Button>
              </Modal.Footer>
          </Modal>
        </>
        }
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container >
  );
}

export default App;
