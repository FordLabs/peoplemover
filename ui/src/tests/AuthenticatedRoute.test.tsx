/*
 * Copyright (c) 2019 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Router} from "react-router";
import * as React from "react";
import {render, RenderResult} from "@testing-library/react";
import {AuthenticatedRoute} from "../AuthenticatedRoute";
import {createMemoryHistory, LocationState, MemoryHistory} from "history";

describe("AuthenticatedRoute", function () {
    let originalWindow: Window;

    beforeEach(() => {
        originalWindow = window;
        delete window.location;
        (window as Window) = Object.create(window);
        window.sessionStorage.clear();
    });

    afterEach(() => {
        (window as any) = originalWindow;
    });

    it('should display content when authenticated', function () {
        const {component} = renderComponent({authenticated: true});
        let result = component.queryByText('Hello, Secured World!');
        expect(result).not.toBeNull();

    });

    it('should redirect to Auth provider when not Authenticated', function () {
        window.location = {href: '', origin: 'http://localhost'} as Location;
        renderComponent({authenticated: false});
        const route = 'http://totallyreal.endpoint/oauth/thing?client_id=urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa&resource=urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb&response_type=token&redirect_uri=http://localhost/oauth/redirect';
        expect(window.location.href).toEqual(route);
    });

    it('should redirect to Auth provider when token is null string', function () {
        window.location = {href: '', origin: 'http://localhost'} as Location;
        window.sessionStorage.setItem('accessToken', 'null');
        renderComponent({authenticated: false});
        const route = 'http://totallyreal.endpoint/oauth/thing?client_id=urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa&resource=urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb&response_type=token&redirect_uri=http://localhost/oauth/redirect';
        expect(window.location.href).toEqual(route);
    });


    function renderComponent({authenticated}: ComponentState): RenderedComponent {
        const history = createMemoryHistory({ initialEntries: ['/secure'] });
        process.env.REACT_APP_ADFS_URL_TEMPLATE = 'http://totallyreal.endpoint/oauth/thing?client_id=%s&resource=%s&response_type=token&redirect_uri=%s';
        process.env.REACT_APP_ADFS_CLIENT_ID = 'urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa';
        process.env.REACT_APP_ADFS_RESOURCE = 'urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb';
        if(authenticated) {
            window.sessionStorage.setItem('accessToken', 'TOTALLY_REAL_ACCESS_TOKEN');
        }

        const component = render(
            <Router history={history}>
                <AuthenticatedRoute exact path={'/secure'}>
                    <div>Hello, Secured World!</div>
                </AuthenticatedRoute>
            </Router>
        );

        return {history, component};
    }

    interface ComponentState {
        authenticated: boolean
    }

    interface RenderedComponent {
        history: MemoryHistory<LocationState>,
        component: RenderResult
    }
});
