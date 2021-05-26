import {Flags, simplifyFlags} from './Flags';

it( 'turns IFlags into Flags', () => {
    expect(simplifyFlags(
        {'announcement_banner_message': {value:'hello i am a banner', enabled: false},
            'announcement_banner_enabled':{enabled:true},
        })).toEqual({announcementBannerMessage:'hello i am a banner', announcementBannerEnabled: true} as Flags);
});
