import {render} from '@testing-library/react';
import AnnouncementHeader from './AnnouncementHeader';
import React from 'react';

describe('announcement header', () => {
    it('should hide itself when you click close', () => {
        const header = render(<AnnouncementHeader/>);
        header.getByText('close').click();
        expect(header.queryByText('hello i am a banner')).toBeFalsy();
    });
});
