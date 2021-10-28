import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import * as React from 'react';
import {RenderResult} from '@testing-library/react';
import LeaveSpaceForm from './LeaveSpaceForm';



describe('Space Form', () => {
    let form: RenderResult;
    beforeEach(() => {
        form = renderWithRedux(<LeaveSpaceForm space={TestUtils.space}/>);
    });

    describe('things to display', () => {
        it('Should show prompt "do you want to assign a new owner before leaving?"', () => {
            expect(form.getByText('Do you want to assign a new owner before leaving?')).toBeInTheDocument();

        });

        xit('should have an option to leave & delete', () => {
            expect(form.getByText('Leave & delete')).toBeInTheDocument();


        });
    });
});