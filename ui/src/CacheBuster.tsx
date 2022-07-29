// Code sourced from: https://dev.to/flexdinesh/cache-busting-a-react-app-22lk

import React from 'react';
import packageJson from '../package.json';

export interface CacheBusterProps {
    loading: boolean;
    isLatestVersion: boolean;
    refreshCacheAndReload: Function;
}

const currentAppVersion = packageJson.version;

const semverGreaterThan = (versionA: string, versionB: string) => {
    return versionA !== versionB;
};

export default class CacheBuster extends React.Component {
    constructor(props: CacheBusterProps) {
        super(props);
        this.state = {
            loading: true,
            isLatestVersion: false,
            refreshCacheAndReload: () => {
                if (caches) {
                    caches.keys().then(function(names) {
                        for (const name of names) caches.delete(name);
                    });
                }
            },
        };
    }

    componentDidMount() {
        fetch('/meta.json')
            .then((response) => response.json())
            .then((meta) => {
                const latestVersion = meta.version;
                const shouldForceRefresh = semverGreaterThan(latestVersion, currentAppVersion);

                let newState = {loading: false, isLatestVersion: true};
                if (shouldForceRefresh) newState = {loading: false, isLatestVersion: false}
                this.setState(newState)
            });
    }

    render() {
        const {loading, isLatestVersion, refreshCacheAndReload} = this.state as CacheBusterProps;
        return typeof this.props.children === 'function'
            && this.props.children({loading, isLatestVersion, refreshCacheAndReload});
    }
}
