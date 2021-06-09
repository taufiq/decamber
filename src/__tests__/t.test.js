import React from 'react';
import { act, getByTestId, render, waitFor } from '@testing-library/react';
import Incidents from '../Incidents';

test('Shows general information form', async () => {
    render(<Incidents incidents={[]}/>)

});
