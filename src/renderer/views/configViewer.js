require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import BlankNavbar from './components/navbars/blankNav.js';
import './style/config.scss';
import ConfigInterface from './components/util/ConfigurationInterface.js';

export default function ConfigurationViewer(props) {
    const [config, setConfig] = React.useState({});
    //build out for handling config.json

    return (
        <div className="config-viewer">
            <BlankNavbar />
            <div className="config-container">
                <ConfigInterface
                     requestedSections={["all"]}
                    />
            </div>
        </div>
    )
}

