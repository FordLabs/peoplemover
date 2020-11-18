import {MatomoWindow} from '../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

export const addUserToMatomo = (userName: string): void => {

    if (!window._paq) {
        window._paq = [];
    }
    window._paq.push(['setUserId', userName]);
    window._paq.push(['trackPageView']);
};
