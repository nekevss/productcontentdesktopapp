import React from 'react';
import "../Conditional.scss"

export default function TypeSelection(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition);
    const [thisType, setThisType] = React.useState(props.thisCondition.type);

    React.useEffect(()=>{
        setThisCondition(props.thisCondition);
        setThisType(props.thisCondition.type);
    }, [props.thisCondition])

    const handleTypeChange = (event) => {
        let _condition = thisCondition;
        _condition.type = event.target.value;
        setThisType(event.target.value);
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return(
        <div className="input-row-node type">
            <div className="type-title">Type:</div>
            <select className="type-input" value={thisType} onChange={handleTypeChange}>
                <option value={"if"}>If</option>
                <option value={"else"}>Else</option>
                <option value={"ifNot"}>If Not</option>
                <option value={"ifNull"}>If Blank</option>
                <option value={"includes"}>Includes</option>
                <option value={"equals"}>Equals</option>
                <option value={"notEquals"}>Not Equal</option>
                <option value={"contains"}>Contains</option>
            </select>
        </div>
    )
}