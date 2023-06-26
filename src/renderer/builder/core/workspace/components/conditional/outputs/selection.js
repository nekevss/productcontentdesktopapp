import React from 'react';
import '../Conditional.scss';

export default function OutputSelection(props) {
    const [thisCondition, setThisCondition] = React.useState(props.condition);
    const [thisType, setThisType] = React.useState(props.condition.thenReturn.type);

    React.useEffect(()=>{
        setThisCondition(props.condition);
        setThisType(props.condition.thenReturn.type);
    }, [props.condition])

    const handleTypeChange = (event) => {
        let _condition = thisCondition;
        setThisType(event.target.value);
        _condition.thenReturn.type = event.target.value;
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    const confirmType = () => {
        props.updateType(thisType);
    }

    return (
        <div className="output-card type-select">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="type-title">Output Type:</div>
                    <select value={thisType} onChange={handleTypeChange}>
                        <option value=""></option>
                        <option value="returnSpec">Return Attribute</option>
                        <option value="returnString">Return String</option>
                        <option value="replaceAndReturn">Return Find/Replace</option>
                        <option value="returnNull">Return Error</option>
                    </select>
                </div>
            </div>
            <div className="buttons-section">
                <button onClick={()=>{confirmType()}}>Okay</button>
                <button onClick={()=>{props.remove()}}>Cancel</button>
            </div>
        </div>
    )
}