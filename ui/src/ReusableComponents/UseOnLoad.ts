import {useEffect} from 'react';

/* eslint-disable */
export const useOnLoad = (callback: Function) => {
    useEffect(() => {
        callback();
    }, []);
};

export const useOnLoadTest = (callback: Function, dependency: any) => {
    useEffect(() => {
        callback();
    }, [dependency]);
};
/* eslint-enable */