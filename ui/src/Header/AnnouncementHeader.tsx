import React, {ReactElement, useState} from 'react';


export default (): ReactElement => {

    const [isShowing, setIsShowing] = useState(true);
    return isShowing ? <div
        style={{
            width: '100%',
            zIndex: 2,
            backgroundColor: 'blue',
        }}>hello i am a
        banner
        <button
            onClick={(): void => setIsShowing(false)}
            className="material-icons closeButton"
            aria-label="Close Announcement Banner"
        >close</button>
    </div> : <></>;
};
