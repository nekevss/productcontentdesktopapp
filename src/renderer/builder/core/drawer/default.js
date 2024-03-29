import React from 'react';
import './drawer.scss';

//Default Generator Card

export default function DefaultGeneratorCard(props) {
    const [thisCondition, setThisCondition] = React.useState(props.currentCondition)

    const OpenSG = () => {
        let _Condition = thisCondition;
        if (thisCondition.hasOwnProperty("tokens")) {
            props.OpenStyleGuide(thisCondition, 1, props.index);
        } else {
            _Condition["tokens"] = [];
            setThisCondition(_Condition);
            props.OpenStyleGuide(_Condition, 1, props.index)
        }   
    }

    const remove = () => {
        props.remove(props.index);
    }

    return (
        <div className="default-node">
            <div className="default-node-container">
                <div className="default-title"><p>Default Formula</p></div>
                <div className="default-controls">
                    <button title="Open style guide formula in workbench" className="f-x" onClick={()=>{OpenSG()}}>Open Formula</button>
                    {props.TopLevelType == "complex"
                    ? <button title="Remove default generator" onClick={()=>{remove()}}>Remove</button>
                    :null}
                </div>
            </div>
        </div>
    )
}