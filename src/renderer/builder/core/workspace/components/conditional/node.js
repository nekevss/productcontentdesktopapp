import React from 'react';
import "./Conditional.scss";
import OutputHandler from './outputs';
import { TypeSelection, AttributeInput, NestedTypeSelection, ValueInput } from './components'

export default function RecursiveConditionNode(props) {
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
                <OutputHandler 
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
                        <TypeSelection thisIndex={thisIndex} thisCondition={thisCondition} updateValidationState={(v)=>props.updateValidationState(v)} />
                        <AttributeInput thisCondition={thisCondition} updateValidationState={(v)=>props.updateValidationState(v)} />
                    </div>
                    <div className="inputs-row">
                        <NestedTypeSelection thisCondition={thisCondition} childCount={nestedAmount} updateValidationState={(v)=>props.updateValidationState(v)} />
                        <ValueInput thisCondition={thisCondition} updateValidationState={(v)=>props.updateValidationState(v)} />
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