import React from 'react';
import { act, getByTestId, render, waitFor, screen, fireEvent, cleanup } from '@testing-library/react';
import Incidents from '../Incidents';
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as IDBManager from 'idb-keyval';

test('Renders Incidents screen', async () => {
    render(<App />)

    const station = await screen.findByLabelText('Station');
    const rota = await screen.findByLabelText('Rota');
    const callSign = await screen.findByLabelText('Call Sign');
    const sectionCommander = await screen.findByLabelText('SC');
    const pumpOperator = await screen.findByLabelText('PO');
    const dutyDate = await screen.findByLabelText('Duty Date');

    const generatePowerpointButton = await screen.findByRole('button', {name: /generate powerpoint/i})
    const resetButton = await screen.findByRole('button', {name: /reset/i})

    const createIncidentCard = (await screen.findByText('Add Incident')).closest('.card')

    expect(station).toBeInTheDocument();
    expect(rota).toBeInTheDocument();
    expect(callSign).toBeInTheDocument();
    expect(sectionCommander).toBeInTheDocument();
    expect(pumpOperator).toBeInTheDocument();
    expect(dutyDate).toBeInTheDocument();

    expect(generatePowerpointButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
    expect(createIncidentCard).toBeInTheDocument();
})

test('Redirects to create incident form', async () => {
    render(<App />);
    const createIncidentCard = screen.getByText('Add Incident').closest(".card");
    userEvent.click(createIncidentCard);

    const cancelButton = await screen.findByRole('button', {name: /cancel/i})
    const submitButton = await screen.findByRole('button', {name: /submit/i})
    const header = await screen.findByText('Add Incident')

    expect(cancelButton).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
    expect(header).toBeInTheDocument()
})

test('Shakes on no incidents', async () => {
    render(<App />)
    const createIncidentCard = screen.getByText('Add Incident').closest(".card")
    userEvent.click(screen.getByText('Generate Powerpoint'))
    expect(createIncidentCard).toHaveClass('shake')
    await waitFor(() => { expect(createIncidentCard).not.toHaveClass('shake')})
})