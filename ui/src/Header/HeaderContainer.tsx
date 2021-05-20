import React, {PropsWithChildren, ReactElement} from 'react';
import './HeaderContainer.scss';


export default (props: PropsWithChildren<{}>): ReactElement => <div className="headerContainer">{props.children}</div>;
