import React from 'react';
import '../Conditional.scss';

export default function AttributeInput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition);
    const [thisAttribute, setThisAttribute] = React.useState(props.thisCondition.attributeName);

    React.useEffect(() => {
        setThisCondition(props.thisCondition);
        setThisAttribute(props.thisCondition.attributeName);
    }, [props.thisCondition])

    const handleSpecChange = (event) => {
        let _condition = thisCondition;
        _condition.attributeName = event.target.value;
        setThisAttribute(event.target.value);
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return (
        <div className="input-row-node input">
            <div className="row-title">Attribute:</div>
            <input value={thisAttribute} onChange={handleSpecChange} placeholder="Enter Attribute Here" />            
        </div>
    )
}