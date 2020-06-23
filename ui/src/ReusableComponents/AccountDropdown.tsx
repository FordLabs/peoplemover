import React, { useState } from "react";
import './AccountDropdown.scss';
import {Dispatch} from "redux";
import {CurrentModalState} from "../Redux/Reducers/currentModalReducer";
import {AvailableModals, setCurrentModalAction} from "../Redux/Actions";
import {connect} from "react-redux";

interface AccountDropdownProps {
    setCurrentModal(modalState: CurrentModalState): void;
}

function AccountDropdown({setCurrentModal}: AccountDropdownProps): JSX.Element {

    const [dropdownFlag, setDropdownFlag] = useState<boolean>(false);

    function showsDropdown(): boolean {
        setDropdownFlag(!dropdownFlag);
        return dropdownFlag;
    }

    return (
        <button data-testid="editContributorsModal" className={'editContributorsModal'} onClick={showsDropdown}>
            <i className="fas fa-user" data-testid={'userIcon'}></i>
            <i className="fas fa-caret-down drawerCaret"/>

            {dropdownFlag && <div className={'dropdown-container'}>
                <span onClick={() => setCurrentModal({modal: AvailableModals.EDIT_CONTRIBUTORS})}>
                    Invite Contributors</span>
            </div>
            }
        </button>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(AccountDropdown);