import AnnouncementHeader from './AnnouncementBanner';
import React from 'react';

import {render} from '@testing-library/react';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';

import {Provider} from 'react-redux';

describe('announcement header', () => {
    it('should hide itself when you click close', () => {
        const store = createStore(rootReducer, {flags:{
            announcementBannerMessage: 'hello i am a banner',
            announcementBannerEnabled: true,
        }});

        const header = render(
            <Provider store={store}>
                <AnnouncementHeader/>,
            </Provider>
        );

        expect(header.getByText('hello i am a banner')).toBeInTheDocument();
        header.getByText('close').click();
        expect(header.queryByText('hello i am a banner')).not.toBeInTheDocument();
    });

    it('should not display if announcement banner enabled flag is disabled',  () => {
        const store = createStore(rootReducer, {flags:{
            announcementBannerMessage: 'hello i am a banner',
            announcementBannerEnabled: false,
        }});

        const header = render(
            <Provider store={store}>
                <AnnouncementHeader/>,
            </Provider>
        );

        expect(header.queryByText('hello i am a banner')).not.toBeInTheDocument();
    });
});
