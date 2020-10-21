import {MatomoWindow} from '../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

export default {

    pushEvent: function(category: string, action: string, name: string, value?: number) {
        if (!window._paq) {
            window._paq = [];
        }
        const eventArray: Array<string | number> = ['trackEvent', category, action, name];
        if (value) {
            eventArray.push(value);
        }
        window._paq.push(eventArray);
    },
};
