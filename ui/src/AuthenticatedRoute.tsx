import {Redirect, Route, RouteProps} from "react-router";
import * as React from "react";

export function AuthenticatedRoute<T extends RouteProps>(props: T): JSX.Element {
    const {children, ...rest} = props;

    const accessToken = window.sessionStorage.getItem('accessToken');
    const isAuthenticated = accessToken !== null && accessToken !== 'null';

    return (
        <Route {...rest}>{isAuthenticated ? children : <RedirectToADFS/>}</Route>
    )
}

function RedirectToADFS(){
    let oauthUri: string = process.env.REACT_APP_ADFS_URL_TEMPLATE!!;
    const clientId: string = process.env.REACT_APP_ADFS_CLIENT_ID!!;
    const resource: string = process.env.REACT_APP_ADFS_RESOURCE!!;
    const redirectUri: string = `${window.location.origin}/oauth/redirect`!!;

    oauthUri = oauthUri.replace('%s', clientId);
    oauthUri = oauthUri.replace('%s', resource);
    oauthUri = oauthUri.replace('%s', redirectUri);

    window.location.href = oauthUri;

    return null;
}
