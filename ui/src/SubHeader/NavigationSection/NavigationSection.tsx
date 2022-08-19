import React, { ReactNode } from 'react';

interface Props {
    label: string;
    icon: string;
    children?: ReactNode;
}

function NavigationSection({ label, icon, children }: Props): JSX.Element {
    return (
        <div className="dropdownContainer">
            <i className="material-icons indicator-icon" aria-hidden>
                {icon}
            </i>
            <span className="dropdown-label">{label}:</span>
            {children}
        </div>
    );
}

export default NavigationSection;
