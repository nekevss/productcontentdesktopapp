import React from 'react';
import GeneratedName from './generated-name-box.js';
import './style/style-guide-card.scss';

export default function StyleGuideCard(props) {
    return (
        <div className="sg-container">
            <GeneratedName {...props} />
            <StyleGuideInfo {...props} />
        </div>
    )
}

function StyleGuideInfo(props) {
    let thisClass = localStorage.getItem("class");
    
    return (
        <div className="sg-info-container">
            <div className="sg-class"><b dangerouslySetInnerHTML={{__html: "Class: " + thisClass}}></b></div>
            <div className="sg-formula" dangerouslySetInnerHTML={{__html: props.styleGuide}}></div>
        </div>
    )
}