import {emptyValidateUserResult, makeOption, validate} from './userIdValidator';

describe('User Id Validation', () => {

    it('should return empty for an empty string', function() {
        expect(validate('')).toEqual(emptyValidateUserResult);
    });

    it('should return a valid cdsid when valid one passed', function() {
        expect(validate('cdsid1,')).toEqual({options: [makeOption('cdsid1')], notValid: ''});
    });
    it('should return a list of valid cdsid when valid multiple passed', function() {
        expect(validate('cdsid, cdsid1, cdsid2')).toEqual({
            options: [makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ], notValid: ''});
    });
    it('2should return a list of valid cdsid when valid multiple passed', function() {
        expect(validate('cdsid,cdsid1,cdsid2')).toEqual({
            options: [makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ], notValid: ''});
    });
    it('3should return a list of valid cdsid when valid multiple passed', function() {
        expect(validate('cdsid cdsid1 cdsid2')).toEqual({
            options: [makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ], notValid: ''});
    });
    it('4should return a list of valid cdsid when valid multiple passed', function() {
        expect(validate('cdsid   cdsid1 cdsid2')).toEqual({
            options: [makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ], notValid: ''});
    });
    it('5should return a list of valid cdsid when valid multiple passed', function() {
        expect(validate('cdsid;cdsid1; cdsid2')).toEqual({
            options: [makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ], notValid: ''});
    });
    it('6should return a list of valid cdsid when valid multiple passed', function() {
        expect(validate('cdsid\n cdsid1\n; cdsid2')).toEqual({
            options: [makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ], notValid: ''});
    });

    it('should return a list of valid cdsid and invalid in a string when valid multiple passed', function() {
        expect(validate(' 2blah cdsid\n cdsid1\n; 1t; cdsid2 bo%')).toEqual({
            options: [makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ], notValid: '2blah 1t bo%'});
    });
});