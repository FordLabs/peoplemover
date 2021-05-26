import React, {ReactElement, useState} from 'react';
import {useSelector} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';


export default (): ReactElement => {

    const [closedByUser, setClosedByUser] = useState(false);
    const flags = useSelector((state: GlobalStateProps) => state.flags);
    return !closedByUser && flags.announcementBannerEnabled ? <div
        style={{
            width: '100%',
            zIndex: 2,
            backgroundColor: 'blue',
        }}>{flags ? flags.announcementBannerMessage : ''}
        <button
            onClick={(): void => setClosedByUser(true)}
            className="material-icons closeButton"
            aria-label="Close Announcement Banner"
        >close</button>
    </div> : <></>;
};
