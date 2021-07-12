import React from 'react';
import { act, getByTestId, render, waitFor, screen, fireEvent, cleanup } from '@testing-library/react';
import Incidents from '../Incidents';
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as IDBManager from 'idb-keyval';

test('Renders Incident', async () => {
    render(<App />)

    const station = await screen.findByLabelText('Station');
    const rota = await screen.findByLabelText('Rota');
    const callSign = await screen.findByLabelText('Call Sign');
    const sectionCommander = await screen.findByLabelText('SC');
    const pumpOperator = await screen.findByLabelText('PO');

    const dutyDate = await screen.findByLabelText('Duty Date');
    expect(station).toBeInTheDocument();
    expect(rota).toBeInTheDocument();
    expect(callSign).toBeInTheDocument();
    expect(sectionCommander).toBeInTheDocument();
    expect(pumpOperator).toBeInTheDocument();
    expect(dutyDate).toBeInTheDocument();
})

test('Shakes on no incidents', async () => {
    render(<App />)
    const createIncidentCard = screen.getByText('Add Incident').closest(".card")
    userEvent.click(screen.getByText('Generate Powerpoint'))
    expect(createIncidentCard).toHaveClass('shake')
    await waitFor(() => { expect(createIncidentCard).not.toHaveClass('shake')})
})