import React from 'react';
import './style/ConditionalCard.scss';

export default function ConditionalAttribute(props) {
    const [thisStyleGuide, setStyleGuide] = React.useState(props.styleGuide);
    const [thisReport, setThisReport] = React.useState(props.styleGuide.report);
    const [thisAttribute, setThisAttribute] = React.useState(props.styleGuide.forAttribute);
    const [conditionAmount, setConditionAmount] = React.useState(props.styleGuide.conditions.length)
    const [displayConditions, setDisplayConditions] = React.useState([]);

    React.useEffect(()=> {
        
        createDisplay(props.styleGuide.conditions);
        setStyleGuide(props.styleGuide);
        setThisReport(props.styleGuide.report);
        setThisAttribute(props.styleGuide.forAttribute);
        setConditionAmount(props.styleGuide.conditions.length);
    }, [props.styleGuide])

    React.useEffect(()=>{
        createDisplay(thisStyleGuide.conditions)
    }, [conditionAmount])

    const createDisplay = (_conditions) => {
        console.log("Beginning to create display")
        let display = [];

        if (_conditions.length > 0) {
            display = _conditions.map((value, index)=>{
                return (
                    <RecursiveConditionNode
                        key={'conditionNode'+index}
                        remove={(i)=>removeItem(i)}
                        updateValidationState={(v)=>props.updateValidationState(v)}
                        parentLevel={0}
                        index={index}
                        condition={value} />
                )
            })
        }

        console.log("Logging the conditions display")
        console.log(display);

        setDisplayConditions(display);
    }

    //change handlers (these could be broken down into more components if need be)

    const handleReportChange = (event) => {
        let sg = thisStyleGuide;
        setThisReport(event.target.checked);
        sg["report"] = event.target.checked;
        setStyleGuide(sg);
    }

    const handleAttributeChange = (event) => {
        let styleGuide = thisStyleGuide;
        setThisAttribute(event.target.value);
        styleGuide["forAttribute"] = event.target.value;
        setStyleGuide(styleGuide);
        props.updateValidationState("none")
    }

    //actions/button functions

    const addChild = () => {
        let _thisStyleGuide = thisStyleGuide;
        const newCondition = {
            type: "if",
            call: "",
            expectedValue : [""],
            nestedType: "",
            nestedConditions: []
        }
        _thisStyleGuide.conditions.push(newCondition);
        setStyleGuide(_thisStyleGuide);
        setConditionAmount(_thisStyleGuide.conditions.length);
        props.updateValidationState("none")
    }

    //below is the anchor for the removal between the parent and the child
    const removeItem = (index_to_remove) => {
        let _StyleGuide = thisStyleGuide;
        let newConditions = _StyleGuide.conditions.filter((value, index)=>{return index!==index_to_remove});
        _StyleGuide.conditions = newConditions;
        setStyleGuide(_StyleGuide);
        setConditionAmount(_StyleGuide.conditions.length);
        props.updateValidationState("none")
    }

    //below is the local button invocation of removeItem from the parent. 
    const remove = () => {
        props.remove(props.index)
    }

    return (
        <div className="condition-container">
            <div className="root-node">
                <div className="input-section">
                    <div className="condition-row text">
                        <div className="spec-title">Parent Attribute:</div>
                        <input type="text" value={thisAttribute} onChange={handleAttributeChange} placeholder="Enter string here" />
                    </div>
                </div>
                <div className="button-section">
                    <button onClick={()=>{addChild()}}>Add Condition</button>
                    <button onClick={()=>{remove()}}>Remove</button>
                    <div className="condition-row checkbox">
                        <div className="report-title">Mandatory:</div>
                        <input type="checkbox" checked={thisReport} onChange={handleReportChange} />
                    </div>
                </div>
            </div>
            {displayConditions}
        </div>
    )
}

function RecursiveConditionNode(props) {
    const [thisCondition, setThisCondition] = React.useState(props.condition);
    const [thisLevel, setThisLevel] = React.useState(props.parentLevel + 1);
    const [thisIndex, setThisIndex] = React.useState(props.index);
    const [nestedAmount, setNestedAmount] = React.useState(props.condition.nestedConditions.length);
    const [hasReturn, setHasReturn] = React.useState(false);
    const [thisDisplay, setThisDisplay] = React.useState([]);
    const computeMargin = (level) => {
        const thisMargin = 7.5 + 20 + (parseInt(level) * 0.75) + 'em';
        const style = {
            marginLeft: thisMargin
        }
        return style
    }
    const [thisStyle, setThisStyle] = React.useState(()=>{
        const initialState = computeMargin(props.parentLevel+1);
        return initialState
    });

    React.useEffect(()=>{
        CreateDisplay(props.condition);
        
        setThisCondition(props.condition)
        setThisLevel(props.parentLevel+1);
        setThisIndex(props.index);
        setNestedAmount(props.condition.nestedConditions.length)
    }, [props.condition])

    React.useEffect(()=>{
        CreateDisplay(thisCondition)
    }, [nestedAmount, hasReturn])
    

    const CreateDisplay = (_condition) => {
        let display = [];
        let _nestedConditions = _condition.nestedConditions;

        if (_nestedConditions.length > 0) {
            console.log("Detected children");
            display = _nestedConditions.map((value, index)=> {
                return (
                    <RecursiveConditionNode 
                        key={"conditionNode-"+ (thisLevel*100) + index}
                        condition={value}
                        parentLevel={thisLevel}
                        updateValidationState={(v)=>props.updateValidationState(v)}
                        remove={(i)=>{RemoveItem(i)}}
                        index={index}
                    />
                )
            })
        }
        if (_condition.thenReturn) {
            setHasReturn(true);
            //adding the below to account if leadString is not existing. Can be removed Dec 2021
            if (_condition.thenReturn.type == "returnSpec" || _condition.thenReturn.type == "replaceAndReturn") {
                if (!_condition.thenReturn.leadString) {_condition.thenReturn["leadString"] = "";}
            }
            display.push(
                <ConditionOutputHandler 
                    key={"returnObject"+(thisLevel*100)+thisIndex}
                    thisCondition={_condition}
                    updateValidationState={(v)=>props.updateValidationState(v)}
                    remove={()=>{RemoveReturn()}}
                />
            )
            
        } else {
            setHasReturn(false)
        }
        setThisDisplay(display)
    }

    const addChild = () => {
        let _condition = thisCondition;
        const newNestedCondition = {
            type: "if",
            call: "",
            expectedValue : [],
            nestedType: "",
            nestedConditions: []
        }
        _condition.nestedType = "AND";
        _condition.nestedConditions.push(newNestedCondition);
        setThisCondition(_condition);
        setNestedAmount(_condition.nestedConditions.length);
        props.updateValidationState("none");
    }

    const addReturn = () => {
        let _condition = thisCondition;
        _condition["thenReturn"] = {type:""};
        setThisCondition(_condition);
        setHasReturn(true);
        props.updateValidationState("none");
    }

    const RemoveItem = (index_to_remove) => {
        let _condition = thisCondition;
        let newNested = _condition.nestedConditions.filter((value, index)=>{return index!==index_to_remove});
        _condition.nestedConditions = newNested;
        _condition.nestedType = _condition.nestedConditions.length > 0 ? _condition.nestedType : ""; 
        setThisCondition(_condition);
        setNestedAmount(_condition.nestedConditions.length);
        props.updateValidationState("none");
    }

    const RemoveReturn = () => {
        let _condition = thisCondition;
        delete thisCondition["thenReturn"]
        setThisCondition(_condition);
        setHasReturn(false);
        props.updateValidationState("none");
    }

    const remove = () => {
        props.remove(thisIndex)
    }

    return (
        <div className="condition-node" style={thisStyle}>
            <div className="condition-form">
                <div className="inputs-section">
                    <div className="inputs-row">
                        <ConditionTypeSelection thisIndex={thisIndex} thisCondition={thisCondition} updateValidationState={(v)=>props.updateValidationState(v)} />
                        <ConditionAttributeInput thisCondition={thisCondition} updateValidationState={(v)=>props.updateValidationState(v)} />
                    </div>
                    <div className="inputs-row">
                        <ConditionNestedTypeSelection thisCondition={thisCondition} childCount={nestedAmount} updateValidationState={(v)=>props.updateValidationState(v)} />
                        <ConditionValuesInput thisCondition={thisCondition} updateValidationState={(v)=>props.updateValidationState(v)} />
                    </div>
                </div>
                <div className="buttons-section">
                    {!hasReturn
                    ?<button onClick={()=>{addChild()}}>Nest Condition</button>
                    :null}
                    {nestedAmount == 0 && !hasReturn
                    ? <button onClick={()=>{addReturn()}}>Create Return</button>
                    : null}
                    <button onClick={()=>{remove()}}>Remove</button>
                </div>
            </div>
            {thisDisplay}
        </div>
    )
}

//The below is reimplementing the same input types written out in top level tree, but with different class names

function ConditionTypeSelection(props) {
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
                {props.thisIndex > 0
                ? <option value={"else"}>Else</option>
                :null}
                <option value={"ifNot"}>If Not</option>
                <option value={"ifNull"}>If Null</option>
                <option value={"includes"}>Includes</option>
                <option value={"equals"}>Equals</option>
                <option value={"notEquals"}>Not Equal</option>
                <option value={"contains"}>Contains</option>
            </select>
        </div>
    )
}

function ConditionAttributeInput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition);
    const [thisAttribute, setThisAttribute] = React.useState(props.thisCondition.call);

    React.useEffect(() => {
        setThisCondition(props.thisCondition);
        setThisAttribute(props.thisCondition.call);
    }, [props.thisCondition])

    const handleSpecChange = (event) => {
        let _condition = thisCondition;
        _condition.call = event.target.value;
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

function ConditionNestedTypeSelection(props) {
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


function ConditionValuesInput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition);
    const [expectedValuesString, setExpectedValuesString] = React.useState("");

    React.useEffect(()=>{
        setThisCondition(props.thisCondition);
        //const
        const expected = props.thisCondition.expectedValue
        let expectedJoined = expected.join("&&");
        setExpectedValuesString(expectedJoined);
    }, [props.thisCondition])

    const handleExpectedValuesChange = (event) => {
        let _condition = thisCondition;
        const regex = /\s\&\&\s/g;
        const regex2 = /\&\&/g;
        let val = event.target.value;
        let expectedSplit = regex.test(val) ? val.split(regex) : regex2.test(val) ? val.split(regex2) : [event.target.value];
        _condition.expectedValue = expectedSplit
        setExpectedValuesString(event.target.value);
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return (
        <div className="input-row-node input">
            <div className="values-title">Expected:</div>
            <input value={expectedValuesString} onChange={handleExpectedValuesChange} placeholder="Enter Expected Values Here" />
        </div>
    )
}

//Below is the code for the Output Handlers on a Conditional block

function ConditionOutputHandler(props) {
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
            ? <OutputSelectType {...props}
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                updateType={(type)=>{updateType(type)}} 
                />
            : thisType == "returnString"
            ? <OutputReturnStringCard 
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                reset={()=>{resetType()}}
                />
            : thisType == "returnSpec"
            ? <OutputReturnAttributeCard 
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                reset={()=>{resetType()}}
                />
            : thisType == "replaceAndReturn"
            ? <OutputReplaceAndReturnCard 
                condition={thisCondition}
                updateValidationState={(v)=>props.updateValidationState(v)}
                reset={()=>{resetType()}}
                />
            :thisType == "returnNull"
            ? <OutputReturnNullCard
                reset={()=>{resetType()}}
                />
            : null}
        </div>
    )
}

function OutputSelectType(props) {
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
                        <option value="returnNull">Return Null</option>
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

function OutputReturnStringCard(props) {
    const [thisCondition, setThisCondition] = React.useState(props.condition);
    const [stringValue, setStringValue] = React.useState(props.condition.thenReturn.string);

    React.useEffect(()=>{
        setThisCondition(props.condition);
        setStringValue(props.condition.thenReturn.string);
    }, [props.condition])

    const handleStringValue = (event) => {
        let _condition = thisCondition;
        setStringValue(event.target.value);
        _condition.thenReturn.string = event.target.value;
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

function OutputReturnAttributeCard(props) {
    const [thisCondition, setThisCondition] = React.useState(props.condition);
    const [thisCall, setThisCall] = React.useState(props.condition.thenReturn.call);
    const [thisLeadString, setThisLeadString] = React.useState(props.condition.thenReturn.leadString);
    const [thisEndString, setThisEndString] = React.useState(props.condition.thenReturn.endString);

    React.useEffect(()=>{
        setThisCondition(props.condition);
        setThisCall(props.condition.thenReturn.call);
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

function OutputReturnNullCard(props) {

    return (
        <div className="output-card null">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="spec-title">Return null</div>
                </div>
            </div>
            <div className="buttons-section">
                <button onClick={()=>props.reset()}>Reset</button>
            </div>
        </div>
    )
}

function OutputReplaceAndReturnCard(props) {
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