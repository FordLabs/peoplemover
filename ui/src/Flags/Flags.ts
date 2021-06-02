import {IFlags} from 'flagsmith';
import {AvailableActions} from '../Redux/Actions';

export const DEFAULT_BANNER_MESSAGE = 'redux_default';
export interface Flags {
    announcementBannerMessage: string;
    announcementBannerEnabled: boolean;
}

export const simplifyFlags = (flags: IFlags): Flags => {
    return {
        announcementBannerEnabled: flags['announcement_banner_enabled'].enabled,
        announcementBannerMessage: flags['announcement_banner_message'].value ? flags['announcement_banner_message'].value : '',
    };
};


export const flagsReducer = (
    state = {announcementBannerEnabled: false, announcementBannerMessage: DEFAULT_BANNER_MESSAGE},
    action: { type: AvailableActions; flags: Flags },
): Flags => {
    if (action.type === AvailableActions.GOT_FLAGS) {
        return action.flags;
    } else return state;
};
