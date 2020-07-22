import {render} from "@testing-library/react";
import OAuthRedirect from "../ReusableComponents/OAuthRedirect";
import * as React from "react";
import {MemoryRouter, Router} from "react-router";
import {createMemoryHistory} from "history";

describe("OAuthRedirect", function () {
    let originalWindow: any;

    beforeEach(() => {
        originalWindow = window;
        delete window.location;
        (window as any) = Object.create(window);
        window.sessionStorage.clear();
    });

    afterEach(() => {
        (window as any) = originalWindow;
    });

    it('should save access token', function () {
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`
        } as Location;

        render(
            <MemoryRouter>
                <OAuthRedirect redirectUrl={'/user/dashboard'}/>
            </MemoryRouter>
        );
        const token = window.sessionStorage.getItem('accessToken');
        expect(token).toEqual(expectedToken);
    });

    it('should redirect to specified page', function () {
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`
        } as Location;

        const history = createMemoryHistory({ initialEntries: ['/login'] });

        render(
            <Router history={history}>
                <OAuthRedirect redirectUrl={'/user/dashboard'}/>
            </Router>
        );
        expect(history.location.pathname).toEqual(`/user/dashboard`);
    });
});
