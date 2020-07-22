import React, {useState} from 'react';
import {Redirect} from "react-router";

interface OAuthRedirectProps {
    redirectUrl: string;
}

function OAuthRedirect({redirectUrl}: OAuthRedirectProps): JSX.Element {
    const searchParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = searchParams.get('access_token');
    window.sessionStorage.setItem('accessToken', accessToken!!);

    return (<Redirect to={redirectUrl}/>);
}

export default OAuthRedirect;
