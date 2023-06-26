import React from 'react';
import './Conditional.scss';
import RecursiveConditionNode from './node';

export default function ConditionalAttributeRoot(props) {
    const [thisStyleGuide, setStyleGuide] = React.useState(props.styleGuide);
    const [thisReport, setThisReport] = React.useState(props.styleGuide.report);
    const [thisPostType, setThisPostType] = React.useState(props.styleGuide.postType);
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

        // console.log("Logging the conditions display")
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

    const handlePostTypeChange = (event) => {
        let sg = thisStyleGuide;
        setThisPostType(event.target.checked);
        sg["postType"] = event.target.checked;
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
                        <div>
                            <div className="posttype-title">Post-Type:</div>
                            <input type="checkbox" checked={thisPostType} onChange={handlePostTypeChange} />
                        </div>
                        <div>
                            <div className="report-title">Mandatory:</div>
                            <input type="checkbox" checked={thisReport} onChange={handleReportChange} />
                        </div>
                    </div>
                </div>
            </div>
            {displayConditions}
        </div>
    )
}
