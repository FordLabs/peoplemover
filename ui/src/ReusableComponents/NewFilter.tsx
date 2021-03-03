import React from 'react';
import {AllGroupedTagFilterOptions} from './ProductFilter';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {connect} from 'react-redux';

interface NewFilterProps {
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
}

function NewFilter({
    allGroupedTagFilterOptions,
}: NewFilterProps): JSX.Element {
    const index = 0;
    return (
        <div>
            <button>
                {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0 && allGroupedTagFilterOptions[index].label}
            </button>
            <div>
                {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0 && allGroupedTagFilterOptions[index].options.map((option) => {return (<div><input type="checkbox" id={option.value} value={option.label}></input><label htmlFor={option.value}>{option.label}</label></div>);})}
            </div>
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
