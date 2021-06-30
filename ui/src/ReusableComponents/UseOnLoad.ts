import {useEffect} from 'react';

/* eslint-disable */
export const useOnLoad = (callback: Function) => {
    useEffect(() => {
        callback();
    }, []);
};
/* eslint-enable */
