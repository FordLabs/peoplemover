// Code sourced from: https://dev.to/flexdinesh/cache-busting-a-react-app-22lk

import React from 'react';
import packageJson from '../package.json';

const appVersion = packageJson.version;

const semverGreaterThan = (versionA, versionB) => {
    return versionA !== versionB;
};

export default class CacheBuster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isLatestVersion: false,
            refreshCacheAndReload: () => {
                if (caches) {
                    caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                    });
                }
                // window.location.reload();
            },
        };
    }

    componentDidMount() {
        fetch('/meta.json')
            .then((response) => response.json())
            .then((meta) => {
                const latestVersion = meta.version;
                const currentVersion = appVersion;

                const shouldForceRefresh = semverGreaterThan(latestVersion, currentVersion);
                if (shouldForceRefresh) {
                    this.setState({loading: false, isLatestVersion: false});
                } else {
                    this.setState({loading: false, isLatestVersion: true});
                }
            });
    }

    render() {
        const {loading, isLatestVersion, refreshCacheAndReload} = this.state;
        return this.props.children({loading, isLatestVersion, refreshCacheAndReload});
    }
}
