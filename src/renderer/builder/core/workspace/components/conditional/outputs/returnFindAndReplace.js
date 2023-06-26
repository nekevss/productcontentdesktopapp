import React from 'react';
import '../Conditional.scss';


export default function FindAndReplaceOutput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.condition);
    const [thisCall, setThisCall] = React.useState(props.condition.thenReturn.call);
    const [thisFind, setThisFind] = React.useState(props.condition.thenReturn.find);
    const [thisReplace, setThisReplace] = React.useState(props.condition.thenReturn.replace);
    const [thisLeadString, setThisLeadString] = React.useState(props.condition.thenReturn.leadString);
    const [thisEndString, setThisEndString] = React.useState(props.condition.thenReturn.endString);

    React.useEffect(()=>{
        setThisCondition(props.condition);
        setThisCall(props.condition.thenReturn.call);
        setThisFind(props.condition.thenReturn.find);
        setThisReplace(props.condition.thenReturn.replace);
        setThisLeadString(props.condition.thenReturn.leadString);
        setThisEndString(props.condition.thenReturn.endString);
    }, [props.condition])

    const handleCallChange = (event) => {
        let _condition = thisCondition;
        setThisCall(event.target.value);
        _condition.thenReturn.call = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    const handleFindChange = (event) => {
        let _condition = thisCondition;
        setThisFind(event.target.value);
        _condition.thenReturn.find = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    const handleReplaceChange = (event) => {
        let _condition = thisCondition;
        setThisReplace(event.target.value);
        _condition.thenReturn.replace = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    const handleStringChange = (event) => {
        let _condition = thisCondition;
        setThisEndString(event.target.value);
        _condition.thenReturn.endString = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    const handleLeadChange = (event) => {
        let _condition = thisCondition;
        setThisLeadString(event.target.value);
        _condition.thenReturn.leadString = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return (
        <div className="output-card replace">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="spec-title">Attribute:</div>
                    <input type="text" value={thisCall} onChange={handleCallChange} placeholder="Enter attribute to call" />
                </div>
                <div className="input-row">
                    <div className="spec-title">Find:</div>
                    <input type="text" value={thisFind} onChange={handleFindChange} placeholder="Enter value to find" />
                </div>
                <div className="input-row">
                    <div className="spec-title">Replace:</div>
                    <input type="text" value={thisReplace} onChange={handleReplaceChange} placeholder="Enter value to replace" />
                </div>
                <div className="input-row">
                    <div className="leadString-title">Lead String:</div>
                    <input type="text" value={thisLeadString} onChange={handleLeadChange} placeholder="(Optional) Leading String" />
                </div>
                <div className="input-row">
                    <div className="spec-title">End String:</div>
                    <input type="text" value={thisEndString} onChange={handleStringChange} placeholder="(Optional) Subsequent String" />
                </div>
            </div>
            <div className="buttons-section">
                <button onClick={()=>props.reset()}>Reset</button>
            </div>
        </div>
    )
}