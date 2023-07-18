import React from 'react';
import '../Conditional.scss';

export default function AttributeOutput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.condition);
    const [thisCall, setThisCall] = React.useState(props.condition.conditionOutput.attributeName);
    const [thisLeadString, setThisLeadString] = React.useState(props.condition.conditionOutput.leadString);
    const [thisEndString, setThisEndString] = React.useState(props.condition.conditionOutput.endString);

    React.useEffect(()=>{
        setThisCondition(props.condition);
        setThisCall(props.condition.conditionOutput.attributeName);
        setThisLeadString(props.condition.conditionOutput.leadString);
        setThisEndString(props.condition.conditionOutput.endString);
    }, [props.condition])

    const handleCallChange = (event) => {
        let _condition = thisCondition;
        setThisCall(event.target.value);
        _condition.conditionOutput.attributeName = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    const handleStringChange = (event) => {
        let _condition = thisCondition;
        setThisEndString(event.target.value);
        _condition.conditionOutput.endString = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    const handleLeadChange = (event) => {
        let _condition = thisCondition;
        setThisLeadString(event.target.value);
        _condition.conditionOutput.leadString = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return (
        <div className="output-card attribute">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="spec-title">Attribute:</div>
                    <input type="text" value={thisCall} onChange={handleCallChange} placeholder="Enter attribute to call" />
                </div>
                <div className="input-row">
                    <div className="leadString-title">Lead String:</div>
                    <input type="text" value={thisLeadString} onChange={handleLeadChange} placeholder="(Optional) Leading String" />
                </div>
                <div className="input-row">
                    <div className="endString-title">Sub String:</div>
                    <input type="text" value={thisEndString} onChange={handleStringChange} placeholder="(Optional) Subsequent String" />
                </div>
            </div>
            <div className="buttons-section">
                <button onClick={()=>props.reset()}>Reset</button>
            </div>
        </div>
    )
}
