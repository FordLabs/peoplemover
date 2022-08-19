/*
 * Copyright (c) 2021 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    emptyValidateUserResult,
    makeOption,
    validate,
} from './UserIdValidator';

describe('User Id Validation', () => {
    it('should return empty for an empty string', function () {
        expect(validate('')).toEqual(emptyValidateUserResult);
    });

    it('should return a valid cdsid when valid one passed', function () {
        expect(validate('cdsid1,')).toEqual({
            options: [makeOption('cdsid1')],
            notValid: '',
        });
    });

    it('should return a list of valid cdsid when valid multiple passed', function () {
        expect(validate('cdsid, cdsid1, cdsid2')).toEqual({
            options: [
                makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ],
            notValid: '',
        });
    });
    it('should return a list of valid cdsid when valid multiple passed, comma delimited', function () {
        expect(validate('cdsid,cdsid1,cdsid2')).toEqual({
            options: [
                makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ],
            notValid: '',
        });
    });
    it('should return a list of valid cdsid when valid multiple passed, space delimited', function () {
        expect(validate('cdsid cdsid1 cdsid2')).toEqual({
            options: [
                makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ],
            notValid: '',
        });
    });
    it('should return a list of valid cdsid when valid multiple passed, multiple space delimiters', function () {
        expect(validate('cdsid   cdsid1 cdsid2')).toEqual({
            options: [
                makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ],
            notValid: '',
        });
    });
    it('should return a list of valid cdsid when valid multiple passed, semicolon and space', function () {
        expect(validate('cdsid;cdsid1; cdsid2')).toEqual({
            options: [
                makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ],
            notValid: '',
        });
    });
    it('should return a list of valid cdsid when valid multiple passed, cr and semicolon delimited', function () {
        expect(validate('cdsid\n cdsid1\n; cdsid2')).toEqual({
            options: [
                makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ],
            notValid: '',
        });
    });

    it('should return a list of valid cdsid and invalid in a string when valid multiple passed', function () {
        expect(validate(' 2blah cdsid\n cdsid1\n; 1t; cdsid2 bo%')).toEqual({
            options: [
                makeOption('cdsid'),
                makeOption('cdsid1'),
                makeOption('cdsid2'),
            ],
            notValid: '2blah 1t bo%',
        });
    });
});
