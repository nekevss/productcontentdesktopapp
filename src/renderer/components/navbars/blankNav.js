import React from 'react';
import '../../style/nav.scss'


export default function BlankNavbar(props) {
    return (
        <div className="mainNav">
        </div>
    );
}

function RightSideNav(props) {
    return (
        <div className="right-side-nav">
            <button className="help-button">Help</button>
        </div>
    )
}