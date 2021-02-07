import { Card, Container, Button } from 'react-bootstrap'
import * as PptxGenerator from './pptx/Generator'

function Incidents({ incidents, onCreateIncident, onSelectIncident, onDeleteIncident }) {
    async function generateSlides() {
      let generatedPptx = PptxGenerator.createPowerPoint()
      for (const incident of incidents) {
      await PptxGenerator.populateWithImages(generatedPptx, {
        detector: incident.detector,
        sub_alarm_panel: incident.sub_alarm_panel,
        main_alarm_panel: incident.main_alarm_panel,
        others: incident.others
        }, incident.incident_no) 
    }
      PptxGenerator.savePowerPoint(generatedPptx, 'DECAM.pptx')
    }
    return (
        <Container>
            {
                incidents.map((incident) => (
                    <Card onClick={() => onSelectIncident(incident)} className="mt-3">
                        <Card.Body className="d-flex justify-content-between">
                            {incident.incident_no}
                            <div>
                                <i class="far fa-edit text-secondary px-2"></i>
                                <i class="far fa-trash-alt text-danger px-2" onClick={(event) => {
                                    event.stopPropagation()
                                    onDeleteIncident(incident)
                                }}></i>
                            </div>
                        </Card.Body>
                    </Card>
                ))
           }
            <Card onClick={onCreateIncident} className="dotted mt-3">
                <Card.Body className="d-flex justify-content-between">
                    Create Incident
                    <i class="fas fa-plus"></i>
                </Card.Body>
            </Card>
            <Button onClick={generateSlides} className="mt-3">Generate Powerpoint</Button>
        </Container>
    )
}

export default Incidents