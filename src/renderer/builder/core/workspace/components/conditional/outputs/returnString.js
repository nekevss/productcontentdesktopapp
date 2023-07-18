import React from 'react';
import '../Conditional.scss';


export default function StringOutput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.condition);
    const [stringValue, setStringValue] = React.useState(props.condition.conditionOutput.string);

    React.useEffect(()=>{
        setThisCondition(props.condition);
        setStringValue(props.condition.conditionOutput.string);
    }, [props.condition])

    const handleStringValue = (event) => {
        let _condition = thisCondition;
        setStringValue(event.target.value);
        _condition.conditionOutput.string = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return (
        <div className="output-card string">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="string-title">String:</div>
                    <input type="text" value={stringValue} onChange={handleStringValue} placeholder="Enter string to display" />
                </div>
            </div>
            <div className="buttons-section">
                <button onClick={()=>props.reset()}>Reset</button>
            </div>
        </div>
    )
}

