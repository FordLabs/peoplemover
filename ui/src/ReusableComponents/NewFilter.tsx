import React, {useState} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import AccessibleDropdownContainer from './AccessibleDropdownContainer';
import {FilterOption} from '../CommonTypes/Option';

export type LabelType = 'Location Tags:' | 'Product Tags:' | 'Role Tags:';

export enum FilterTypeEnum {
    Location = 'Location Tags:',
    Product = 'Product Tags:',
    Role = 'Role Tags:'
}

export interface AllGroupedTagFilterOptions {
    label: LabelType;
    options: Array<FilterOption>;
}

function convertToIndex(labelType: FilterTypeEnum): number {
    switch (labelType) {
        case FilterTypeEnum.Location:
            return 0;
        case FilterTypeEnum.Product:
            return 1;
        case FilterTypeEnum.Role:
            return 2;
        default:
            return -1;
    }
}

function convertToLabel(labelType: FilterTypeEnum): string {
    switch (labelType) {
        case FilterTypeEnum.Location:
            return 'Product Location:';
        case FilterTypeEnum.Product:
            return 'Product Tags:';
        case FilterTypeEnum.Role:
            return 'Role:';
        default:
            return '';
    }
}

function toggleOption(option: FilterOption): FilterOption {
    return {...option, selected: !option.selected};
}

interface NewFilterProps {
    filterType: FilterTypeEnum;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function NewFilter({
    filterType,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: NewFilterProps): JSX.Element {
    const index = convertToIndex(filterType);

    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);

    const updateRedux = (option: FilterOption, ourIndex: number): void => {
        setAllGroupedTagFilterOptions(
            allGroupedTagFilterOptions.map((aGroupOfTagFilterOptions, index) => {
                if (index === ourIndex) {
                    return  {...aGroupOfTagFilterOptions, options: aGroupOfTagFilterOptions.options.map(anOption => {
                        if (anOption.value === option.value) {
                            return option;
                        } else {
                            return anOption;
                        }
                    })};
                } else {
                    return {...aGroupOfTagFilterOptions};
                }
            })
        );
    };

    const toggleDropdownMenu = (): void => {
        setDropdownToggle(!dropdownToggle);
    };

    return (
        <div>
            <button
                id="NewFilter-button"
                onClick={(): void => { toggleDropdownMenu();}}
            >
                {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0
                && convertToLabel(filterType)}
            </button>
            {dropdownToggle &&
            <AccessibleDropdownContainer
                handleClose={(): void => {
                    setDropdownToggle(false);
                }}
                dontCloseForTheseIds={['NewFilter-button']}
            >
                {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0
                && allGroupedTagFilterOptions[index].options.map(
                    (option) => {
                        return (
                            <div key={option.value}>
                                <input
                                    type="checkbox"
                                    id={option.value}
                                    value={option.value}
                                    onChange={(event): void => {
                                        console.log('checkbox.onChange: ' + JSON.stringify(toggleOption(option)));
                                        updateRedux(toggleOption(option), index);
                                    }}
                                />
                                <label htmlFor={option.value}>{option.label}</label>
                            </div>);
                    })}
            </AccessibleDropdownContainer>}
        </div>);
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewFilter);
/* eslint-enable */
