import React, { useState } from 'react';
import './AccountDropdown.scss';
import {Dispatch} from 'redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import Cookies from 'universal-cookie';
import {Redirect} from 'react-router-dom';
import ReportClient from '../Reports/ReportClient';
import {Space} from '../SpaceDashboard/Space';
import {GlobalStateProps} from '../Redux/Reducers';

interface AccountDropdownProps {
    currentSpace: Space;
    viewingDate: Date;

    setCurrentModal(modalState: CurrentModalState): void;
    hideSpaceButtons?: boolean;
}

function AccountDropdown({
    currentSpace,
    viewingDate,
    setCurrentModal,
    hideSpaceButtons,
}: AccountDropdownProps): JSX.Element {

    const [dropdownFlag, setDropdownFlag] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<JSX.Element>();

    function showsDropdown(): boolean {
        if (dropdownFlag) {
            hidesDropdown();
        } else {
            setDropdownFlag(!dropdownFlag);
            document.addEventListener('click', hidesDropdown, false);
        }
        return dropdownFlag;
    }

    function hidesDropdown(): boolean {
        setDropdownFlag(false);
        document.removeEventListener('click', hidesDropdown);
        return dropdownFlag;
    }

    function clearAccessTokenCookie() {
        const cookie = new Cookies();
        cookie.remove('accessToken', {path: '/'});

        setRedirect(<Redirect to="/"/>);
    }

    if ( redirect ) {
        return redirect;
    }


    // eslint-disable-next-line @typescript-eslint/camelcase
    return (
        <button data-testid="editContributorsModal" className={'editContributorsModal'} onClick={showsDropdown}>
            <i className="fas fa-user" data-testid={'userIcon'}/>
            <i className="fas fa-caret-down drawerCaret"/>

            {dropdownFlag && <div className={'dropdown-container'}>
                {window.runConfig.invite_users_to_space_enabled && !hideSpaceButtons &&
                    <div data-testid="invite-members" className="account-dropdown-options"
                        onClick={() => setCurrentModal({modal: AvailableModals.EDIT_CONTRIBUTORS})}>
                        Invite Members
                    </div>
                }
                {!hideSpaceButtons &&
                    <div data-testid="download-report" className="account-dropdown-options"
                        onClick={async () => { await ReportClient.getReportsWithNames(currentSpace.name, viewingDate); } }>
                        Download Report
                    </div>
                }
                <div data-testid="sign-out" className="account-dropdown-options" onClick={() => clearAccessTokenCookie()}>
                    Sign Out
                </div>
            </div>
            }
        </button>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountDropdown);
