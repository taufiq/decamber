import { Form, Col, Container, Navbar, Row, Button } from 'react-bootstrap'
import Dropzone from './Dropzone'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { useState } from 'react';
import axios from 'axios'
import { saveAs } from 'file-saver'
import '@fortawesome/fontawesome-free/css/all.css'
import { Controller, useForm } from 'react-hook-form'

function App() {
  const { register, handleSubmit, control } = useForm()

  const onFormSubmit = (form) => {
    const formData = new FormData()
    formData.append("incident_no", form.incident_no)
    formData.append("stop_message", form.stop_message)
    for (const picture in form.picture) {
      formData.append("picture", picture)
    }
    const response = axios.post("http://127.0.0.1:5000/presentation", formData, { responseType: 'blob', headers: { "Content-Type": "multipart/form-data" } })
    response
      .then(result => {
        const generatedPresentation = result.data
        const blob = new Blob([generatedPresentation])
        saveAs(blob, 'download.pptx')
      })
  }

  return (
    <Container>
      <Navbar bg="light">
        <Navbar.Brand>Decamber</Navbar.Brand>
      </Navbar>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Form.Group>
          <Form.Label>Incident No.</Form.Label>
          <Form.Control ref={register} name="incident_no" placeholder="A123/21312D"/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Stop Message</Form.Label>
          <Form.Control ref={register} name="stop_message" as="textarea" rows={4} placeholder="Zone 3 had sprinkler schwoooooo"/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Pictures</Form.Label>
          <Controller
            control={control}
            name='picture'
            render={({ onChange, value }) =>
              <Dropzone register={register} setDroppedFiles={onChange} droppedFiles={value}/>
            }
            defaultValue={[]}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
}

export default App;
