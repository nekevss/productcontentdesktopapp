import React from 'react';
import AttributeOutput from "./returnAttribute";
import StringOutput from "./returnString";
import FindAndReplaceOutput from "./returnFindAndReplace";
import NullOutput from "./returnNull";
import OutputSelection from "./selection";
import '../Conditional.scss';

export default function OutputHandler(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition);
    const [thisType, setThisType] = React.useState("");

    React.useEffect(()=>{
        setThisCondition(props.thisCondition);
        setThisType(props.thisCondition.thenReturn.type);
    }, [props.thisCondition])

    const updateType = (incomingType) => {
        setThisType(incomingType);
        let _condition = thisCondition;
        if (incomingType == "returnString") {
            _condition.thenReturn = {
                type: incomingType,
                string: ""
            }
        } else if (incomingType == "returnSpec") {
            _condition.thenReturn = {
                type: incomingType,
                call: "",
                leadString:"",
                endString: ""
            }
        } else if (incomingType == "returnNull") {
            _condition.thenReturn = {
                type: incomingType,
            }
        } else if (incomingType == "replaceAndReturn") {
            _condition.thenReturn = {
                type: incomingType,
                call: "",
                find: "",
                replace: "",
                leadString:"",
                endString: ""
            }
        } else {
            _condition.thenReturn = {
                type: "",
            }
        }
        setThisCondition(_condition);
    }

    const resetType = () => {
        setThisType("")
        let _condition = thisCondition;
        _condition.thenReturn = {type:""}
        setThisCondition(_condition);
        props.updateValidationState("none");
    }
    
    return (
        <div className="output-section">
            {thisType == "" 
            ? <OutputSelection {...props}
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                updateType={(type)=>{updateType(type)}} 
                />
            : thisType == "returnString"
            ? <StringOutput 
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                reset={()=>{resetType()}}
                />
            : thisType == "returnSpec"
            ? <AttributeOutput 
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                reset={()=>{resetType()}}
                />
            : thisType == "replaceAndReturn"
            ? <FindAndReplaceOutput 
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                reset={()=>{resetType()}}
                />
            :thisType == "returnNull"
            ? <NullOutput
                reset={()=>{resetType()}}
                />
            : null}
        </div>
    )
}