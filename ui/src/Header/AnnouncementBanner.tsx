import React, {ReactElement, useState} from 'react';
import {useSelector} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';


export default (): ReactElement => {

    const [isShowing, setIsShowing] = useState(true);
    const flags = useSelector((state: GlobalStateProps) => state.flags);
    return isShowing ? <div
        style={{
            width: '100%',
            zIndex: 2,
            backgroundColor: 'blue',
        }}>{flags ? flags.announcementBannerMessage : ''}
        <button
            onClick={(): void => setIsShowing(false)}
            className="material-icons closeButton"
            aria-label="Close Announcement Banner"
        >close</button>
    </div> : <></>;
};
