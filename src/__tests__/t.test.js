import React from 'react';
import { act, getByTestId, render, waitFor, screen, fireEvent, cleanup } from '@testing-library/react';
import Incidents from '../Incidents';
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as IDBManager from 'idb-keyval';

afterEach(async () => {
    await IDBManager.clear()
})

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

test('Goes back to Incidents page on cancellling incident creation', async () => {
    render(<App />);
    const createIncidentCard = screen.getByText('Add Incident').closest(".card");
    userEvent.click(createIncidentCard);

    const cancelButton = await screen.findByRole('button', {name: /cancel/i})

    userEvent.click(cancelButton)

    await waitFor(async () => expect((await screen.findByText('Add Incident')).closest(".card")).toBeInTheDocument())
})

test('Saves incident on creation', async () => {
    render(<App />);
    const createIncidentCard = screen.getByText('Add Incident').closest(".card");
    userEvent.click(createIncidentCard);

    const incidentNoInput = await screen.findByLabelText('Incident No.');
    userEvent.type(incidentNoInput, 'Test Incident');

    const submitButton = await screen.findByRole('button', {name: /submit/i})
    userEvent.click(submitButton)

    await waitFor(async () => expect((await screen.findByText('Add Incident')).closest(".card")).toBeInTheDocument())
    expect(await screen.findByText('Incident No.')).toBeInTheDocument()
    expect(await screen.findByText('Test Incident')).toBeInTheDocument()
    expect(await screen.findByRole('button', {name: /edit/i})).toBeInTheDocument()
    expect(await screen.findByRole('button', {name: /delete/i})).toBeInTheDocument()

    // Check if values saved on default are the following
    const values = await IDBManager.values()
    expect(values.length).toBe(1)

    const fetchedIncident = values[0]
    expect(typeof fetchedIncident.arrivalTime).toBe("number")
    expect(typeof fetchedIncident.dispatchTime).toBe("number")
    expect(typeof fetchedIncident.dispatchDate).toBe("number")
    expect(fetchedIncident.incidentLocation).toBe('')
    expect(fetchedIncident.premiseOwner).toBe('')
    expect(fetchedIncident.uenNumber).toBe('')
    expect(fetchedIncident.accompanyingPerson).toBe('')
    expect(fetchedIncident.classificationAndLocation).toBe('')
    expect(fetchedIncident.personCaseWasTransferredTo).toBe('')
    expect(fetchedIncident.otherRemarks).toBe('')
    expect(fetchedIncident.overview).toEqual([])
    expect(fetchedIncident.main_alarm_panel).toEqual([])
    expect(fetchedIncident.sub_alarm_panel).toEqual([])
    expect(fetchedIncident.overview_fault).toEqual([])
    expect(fetchedIncident.close_up_fault).toEqual([])

})

test('Deletes saved incident', async () => {
    render(<App />);
    const createIncidentCard = screen.getByText('Add Incident').closest(".card");
    userEvent.click(createIncidentCard);

    const incidentNoInput = await screen.findByLabelText('Incident No.');
    userEvent.type(incidentNoInput, 'Test Incident');

    const submitButton = await screen.findByRole('button', {name: /submit/i})
    userEvent.click(submitButton)

    await waitFor(async () => expect((await screen.findByText('Add Incident')).closest(".card")).toBeInTheDocument())
    const editButton = await screen.findByRole('button', {name: /edit/i})
    const deleteButton = await screen.findByRole('button', {name: /delete/i})

    userEvent.click(deleteButton)

    await waitFor(async () => expect(screen.queryByText('Test Incident')).toBeNull())

    expect((await IDBManager.entries()).length).toBe(0)
})

test('Saves on general information edit', async () => {
    render(<App />)

    const station = await screen.findByDisplayValue('11');
    const rota = await screen.findByDisplayValue('1');
    const callSign = await screen.findByLabelText('Call Sign');
    const sectionCommander = await screen.findByLabelText('SC');
    const pumpOperator = await screen.findByLabelText('PO');
    const dutyDate = await screen.findByLabelText('Duty Date');

    userEvent.type(pumpOperator, 'SGT Shami')
    userEvent.type(sectionCommander, 'SGT Fai')
    userEvent.type(callSign, 'PL421')

    await waitFor(async () => {
        expect((await IDBManager.get('GENERAL_INFORMATION'))).toBeTruthy()
    }, { timeout: 600 })

    const createIncidentCard = screen.getByText('Add Incident').closest(".card");
    userEvent.click(createIncidentCard)

    const cancelButton = await screen.findByRole('button', {name: /cancel/i})
    userEvent.click(cancelButton)

    expect(pumpOperator.value).toBe('SGT Shami')
    expect(sectionCommander.value).toBe('SGT Fai')
    expect(callSign.value).toBe('PL421')
    expect(station.value).toBe('11')
    expect(rota.value).toBe('1')

    const storedGeneralInformation = await IDBManager.get('GENERAL_INFORMATION')
    expect(storedGeneralInformation.pumpOperator).toBe('SGT Shami')
    expect(storedGeneralInformation.sectionCommander).toBe('SGT Fai')
    expect(storedGeneralInformation.callSign).toBe('PL421')
    expect(storedGeneralInformation.station).toBe('11')
    expect(storedGeneralInformation.rota).toBe('1')

})

// test('Saves on general information edit and immediate redirect to create incident', async () => {
//     render(<App />)

//     const station = await screen.findByDisplayValue('11');
//     const rota = await screen.findByDisplayValue('1');
//     const callSign = await screen.findByLabelText('Call Sign');
//     const sectionCommander = await screen.findByLabelText('SC');
//     const pumpOperator = await screen.findByLabelText('PO');
//     const dutyDate = await screen.findByLabelText('Duty Date');

//     userEvent.type(pumpOperator, 'SGT Shami')
//     userEvent.type(sectionCommander, 'SGT Fai')
//     userEvent.type(callSign, 'PL421')

//     const createIncidentCard = screen.getByText('Add Incident').closest(".card");
//     userEvent.click(createIncidentCard)

//     const cancelButton = await screen.findByRole('button', {name: /cancel/i})
//     userEvent.click(cancelButton)

//     const storedGeneralInformation = await IDBManager.get('GENERAL_INFORMATION')
//     expect(storedGeneralInformation.pumpOperator).toBe('SGT Shami')
//     expect(storedGeneralInformation.sectionCommander).toBe('SGT Fai')
//     expect(storedGeneralInformation.callSign).toBe('PL421')
//     expect(storedGeneralInformation.station).toBe('11')
//     expect(storedGeneralInformation.rota).toBe('1')

// })


test('Shakes on no incidents', async () => {
    render(<App />)
    const createIncidentCard = screen.getByText('Add Incident').closest(".card")
    userEvent.click(screen.getByText('Generate Powerpoint'))
    expect(createIncidentCard).toHaveClass('shake')
    await waitFor(() => { expect(createIncidentCard).not.toHaveClass('shake')})
})