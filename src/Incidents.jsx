import { Card, Container, Button, Navbar } from 'react-bootstrap';
import _ from 'lodash';
import * as PptxGenerator from './pptx/Generator';

function IncidentCard({ incident, onSelectIncident, onDeleteIncident }) {
  const photos = _.chain(incident)
    .omit('incident_no')
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
function Incidents({
  incidents, onCreateIncident, onSelectIncident, onDeleteIncident,
}) {
  async function generateSlides() {
    const generatedPptx = PptxGenerator.createPowerPoint();
    for (const incident of incidents) {
      await PptxGenerator.populateWithImages(generatedPptx, {
        detector: incident.detector,
        sub_alarm_panel: incident.sub_alarm_panel,
        main_alarm_panel: incident.main_alarm_panel,
        others: incident.others,
      }, incident.incident_no);
    }
    PptxGenerator.savePowerPoint(generatedPptx, 'DECAM.pptx');
  }
  return (
    <>
      <div>
        <Navbar className="py-3" bg="dark" variant="dark" sticky="top">
          <Navbar.Brand color="light" className="mx-auto">DECAM Slidedeck Generator</Navbar.Brand>
        </Navbar>
      </div>
      <Container>
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
        <Button onClick={generateSlides} className="mt-3">Generate Powerpoint</Button>
      </Container>
    </>
  );
}

export default Incidents;
