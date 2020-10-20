import {getUserNameFromAccessToken} from "./TokenProvider";
import Cookies from "universal-cookie";

interface WindowWithPaq extends Window {
    _paq?: Array<any>;
};

describe('TokenProvider', function () {
    let originalWindow: Window;

    beforeEach(() => {
        originalWindow = window;
        (window as WindowWithPaq) = Object.create(window);
        (window as WindowWithPaq)._paq  = [];
    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });

    describe('getUserNameFromAccessToken', function () {
        it('should set the username for matomo', function () {
            expect(getUserNameFromAccessToken()).toBe('USER_ID');
        });

        it('should set the username for matomo on _paq', function () {
            getUserNameFromAccessToken();
            expect((window as WindowWithPaq)._paq).toContain(['setUserId', 'USER_ID']);
        });
    });

});
