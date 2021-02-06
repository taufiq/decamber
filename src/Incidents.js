import { Card, Container, Button } from 'react-bootstrap'
import * as PptxGenerator from './pptx/Generator'

function Incidents({ incidents, onCreateIncident }) {
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
                    <Card>
                        <Card.Body>
                            {incident.incident_no}
                            <i class="fas fa-chevron-right"></i>
                        </Card.Body>
                    </Card>
                ))
           }
            <Card onClick={onCreateIncident}>
                <Card.Body>
                    Create Incident
                    <i class="fas fa-chevron-right"></i>
                </Card.Body>
            </Card>
            <Button onClick={generateSlides}>Generate Powerpoint</Button>
        </Container>
    )
}

export default Incidents