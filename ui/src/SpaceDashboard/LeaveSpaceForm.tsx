import * as React from 'react';
import {Space} from '../Space/Space';

interface LeaveSpaceFormProps {
    space: Space;
}

function LeaveSpaceForm({space}: LeaveSpaceFormProps): JSX.Element {

    return (
        <div>
            <div> As the owner of this space, leaving will permanently delete the space for yourself and all others that have access. </div>
            <div>Do you want to assign a new owner before leaving?</div>

        </div>);

}

export default LeaveSpaceForm;
