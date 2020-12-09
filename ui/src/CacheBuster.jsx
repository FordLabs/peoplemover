import packageJson from '../package.json';
import React from 'react';

const appVersion = packageJson.version;

const semverGreaterThan = (versionA, versionB) => {
    return versionA != versionB;
};

export default class CacheBuster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isLatestVersion: false,
            refreshCacheAndReload: () => {
                console.log('Clearing cache and hard reloading...');
                if (caches) {
                    console.log('Deleting caches');
                    // Service worker cache should be cleared with caches.delete()
                    caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                    });
                }
                // delete browser cache and hard reload
                window.location.reload();
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
                    console.log(`We have a new version - ${latestVersion}. Should force refresh`);
                    this.setState({loading: false, isLatestVersion: false});
                } else {
                    console.log(`You already have the latest version - ${latestVersion}. No cache refresh needed.`);
                    this.setState({loading: false, isLatestVersion: true});
                }
            });
    }

    render() {
        const {loading, isLatestVersion, refreshCacheAndReload} = this.state;
        return this.props.children({loading, isLatestVersion, refreshCacheAndReload});
    }
}
