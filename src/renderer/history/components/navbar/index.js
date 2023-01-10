require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import './nav.scss';


export default function HistoryNavbar(props) {

    const clearHistory = ()=> {
        props.clearHistory()
    }

    return (
        <div className="nav-bar">
            <div className="left-side-nav">
                <button className="reset-button" onClick={() => clearHistory()}>Clear History</button>
            </div>
        </div>
    );
}