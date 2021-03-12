import {Option} from '../CommonTypes/Option';

export interface ValidateUserResult {
    options: Option[];
    notValid: string;
}

export const emptyValidateUserResult = Object.freeze({
    options: [],
    notValid: '',
});

export function makeOption(name: string): Option {
    return {value: name, label: name};
}

export const nameSplitPattern = new RegExp(/,|;|\s/);
export const userIdPattern = new RegExp(/^[a-zA-Z][a-zA-Z0-9]{1,8}$/);

export function validate(input: string): ValidateUserResult {

    if (input.length > 0 ) {
        const names = input.split(nameSplitPattern);
        const validUserIds = names.filter(name => name.length > 0)
            .filter(name => name.match(userIdPattern))
            .map(makeOption);
        const invalidStr = names.filter(name => name.length > 0)
            .filter(name => !name.match(userIdPattern))
            .join(' ');
        return {
            options: validUserIds,
            notValid: invalidStr,
        };
    }
    return emptyValidateUserResult;
}