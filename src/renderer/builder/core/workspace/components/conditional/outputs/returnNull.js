import React from 'react';
import '../Conditional.scss';


export default function NullOutput(props) {

    return (
        <div className="output-card null">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="spec-title" style={{margin: "auto"}}>Return Error</div>
                </div>
            </div>
            <div className="buttons-section">
                <button onClick={()=>props.reset()}>Reset</button>
            </div>
        </div>
    )
}
