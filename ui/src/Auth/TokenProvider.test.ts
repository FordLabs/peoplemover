import {getUserNameFromAccessToken} from './TokenProvider';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

describe('TokenProvider', function() {
    let originalWindow: Window;

    beforeEach(() => {
        originalWindow = window;
    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });

    describe('getUserNameFromAccessToken', function() {
        it('should set the username for matomo', function() {
            expect(getUserNameFromAccessToken()).toBe('USER_ID');
        });

        it('should set the username for matomo on _paq', function() {
            getUserNameFromAccessToken();
            expect(window._paq).toContainEqual(['setUserId', 'USER_ID']);
        });
        it('should set track page views on _paq', function() {
            getUserNameFromAccessToken();
            expect(window._paq).toContainEqual(['trackPageView']);
        });
    });

});
