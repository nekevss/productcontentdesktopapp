import React from 'react';
import '../Conditional.scss';

export default function NestedTypeSelection(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition);
    const [nestedType, setNestedType] = React.useState(props.thisCondition.nestedType);

    React.useEffect(() => {
        setThisCondition(props.thisCondition);
        setNestedType(props.thisCondition.nestedType);
    }, [props.thisCondition])

    const handleNestedTypeChange = (event) => {
        let _condition = thisCondition;
        _condition.nestedType = event.target.value;
        setNestedType(event.target.value);
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return (
        <div className="input-row-node type">
            <div className="nested-title">Nested:</div>
            <select className="type-input" value={nestedType} onChange={handleNestedTypeChange}>
                {props.childCount == 0
                ? <option value={""}>NULL</option>
                : null
                }
                {props.childCount > 0 
                ? <option value={"AND"}>AND</option>
                : null
                }
                {props.childCount > 0 
                ? <option value={"OR"}>OR</option>
                : null
                }
            </select>  
        </div>
    )
}