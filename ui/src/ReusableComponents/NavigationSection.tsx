import React, {ReactNode} from 'react';

interface NavigationSectionProps {
    label: string;
    icon: string;
    children?: ReactNode;
}

export default function NavigationSection(
    {label, icon, children}: NavigationSectionProps): JSX.Element {
    return (
        <div className="dropdownContainer">
            <i className="material-icons indicator-icon" aria-hidden>{icon}</i>
            <span className="dropdown-label">{label}:</span>
            {children}
        </div>
    );
}
