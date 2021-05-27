import React, {ReactElement, useState} from 'react';
import {useSelector} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import './AnnouncementBanner.scss';



export default (): ReactElement => {

    const PREVIOUS_BANNER_MESSAGE_KEY = 'previousBannerMessage';
    const BANNER_CLOSED_BY_USER_KEY = 'bannerHasBeenClosedByUser';

    const [closedByUser, setClosedByUser] = useState<string|null>(localStorage.getItem(BANNER_CLOSED_BY_USER_KEY));
    const flags = useSelector((state: GlobalStateProps) => state.flags);

    const bannerIsNew = localStorage.getItem(PREVIOUS_BANNER_MESSAGE_KEY) == null ||
        flags.announcementBannerMessage !== localStorage.getItem(PREVIOUS_BANNER_MESSAGE_KEY);

    if (bannerIsNew) {
        setClosedByUser('');
        localStorage.removeItem(BANNER_CLOSED_BY_USER_KEY);
        localStorage.setItem(PREVIOUS_BANNER_MESSAGE_KEY, flags.announcementBannerMessage);
    }

    return !closedByUser  && flags.announcementBannerEnabled ? <div className="announcementBanner"><div className="bannerSpacing">{flags ? flags.announcementBannerMessage : ''}</div>
        <button
            onClick={(): void => {
                setClosedByUser('true');
                localStorage.setItem(BANNER_CLOSED_BY_USER_KEY, 'true');
            }}
            className="material-icons closeButton bannerSpacing"
            aria-label="Close Announcement Banner"
        >close</button>
    </div> : <></>;
};
