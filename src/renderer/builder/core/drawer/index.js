import React from 'react';
import './drawer.scss';
import RecursiveInputNode from "./condition.js";
import DefaultGeneratorCard from './default.js';

// The TreeDrawer is a probably poorly named componenet that deals with the left hand side drawer of in an active workspace

export default function WorkspaceDrawer(props) {
    const [styleGuideType, setStyleGuideType] = React.useState(props.StyleGuide.type);
    const [styleGuide, setStyleGuide] = React.useState(props.StyleGuide);
    const [conditionAmount, setConditionAmount] = React.useState(props.StyleGuide.skuNameAst.length);
    const [styleRef, setStyleRef] = React.useState({});
    const [ComponentArray, setComponentArray] = React.useState([]);
    const [elseFlag, setElseFlag] = React.useState(()=>{
        let builder = props.StyleGuide.skuNameAst;
        return builder[builder.length - 1].type === "else" ? true : false
    });

    // We have a number of events that we want some sort of effect/action to occur.
    // 1. If the style gudie changes, we want to update our relevant values.
    // 2. If the amount of conditions changes, we want to rerender our display
    // 3. If the style guide type changes, we want to rerender our display
    // 4. If the elseFlag is altered, we want to rerender our display with the new value.

    React.useEffect(()=>{
        console.log("A new style guide has been sent to the drawer")

        setStyleGuide(props.StyleGuide);
        setStyleGuideType(props.StyleGuide.type);
        setConditionAmount(props.StyleGuide.skuNameAst.length);
    }, [props.StyleGuide]);

    React.useEffect(()=>{
        createDisplay(styleGuide.skuNameAst)
    }, [conditionAmount])

    React.useEffect(()=>{
        createDisplay(styleGuide.skuNameAst)
    }, [styleGuideType])

    React.useEffect(()=>{
        console.log("Logging Style Guide after an else flag tripped");
        console.log(styleGuide)
        createDisplay(styleGuide.skuNameAst)
    }, [elseFlag])

    const createDisplay = (conditions)=>{
        let parent = document.getElementsByClassName("drawer-body")[0];
        let width = parent.offsetWidth;
        let widthcheck = parent.scrollHeight > parent.clientHeight;

        let style = {
            drawerWidth: width,
            scrollbar: widthcheck
        }

        setStyleRef(style);

        let _ComponentArray = [];
        if (styleGuide.type == 'simple') {
            _ComponentArray.push(
                <InitNode key={"init"} 
                    thisClass={styleGuide.class}
                    save={()=>{saveToState()}} />
            );
            _ComponentArray.push(
                <DefaultGeneratorCard key={"default"}
                    currentCondition={conditions[0]}
                    OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                    remove={(i)=>{RemoveItem(i)}}
                    TopLevelType={styleGuideType}
                    index={0}
                />
            );
        } else {
            console.log("Logging the conditions submitted for display")
            console.log(conditions);
            console.log("Logging the current skuNameAst at time of display creation");
            console.log(props.StyleGuide.skuNameAst);
            conditions.forEach((thisObject, index, arr)=>{
                console.log(`Here's the object being mapped at index ${index}`)
                console.log(thisObject);
                
                if (thisObject.type === "else") {
                    // the below block handles legacy else statements. Most likely able to remove after an
                    // adjustment period. But could be important to keep in for edge cases.
                    
                    /*-----------------Legacy else configuration block------------------------------------*/

                    let keyCheck = Object.keys(thisObject).length;
                    if (keyCheck < 4) {
                        let oldObject = thisObject
                        thisObject = {
                            type: oldObject.type,
                            attributeName: "",
                            conditionTargets: [""],
                            nestedType: "",
                            nestedConditions:[],
                            tokens: oldObject.tokens
                        }
                    }

                    /*-------------------END BLOCK--------------------------------------------------------*/

                    console.log("Else object to recursive node")
                    console.log(thisObject);
                    _ComponentArray.push(
                        <RecursiveInputNode 
                            key={"input-"+index}
                            currentCondition={thisObject}
                            index={index}
                            lastItem = {arr.length -1 === index ? true : false}
                            updateValidationState={(v)=>props.updateValidationState(v)}
                            OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                            passToParent={(val, index)=>{updateReturnGenerators(val, index)}}
                            updateElseFlag={(v)=>{updateElseFlag(v)}}
                            remove={(i)=>{RemoveItem(i)}}
                            parentLevel={0}
                            parentStyle={styleRef} />
                    )
                } else {
                    console.log(`Found type ${thisObject.type}`);
                    _ComponentArray.push(
                        <RecursiveInputNode 
                            key={"input-"+index}
                            currentCondition={thisObject}
                            index={index}
                            lastItem = {arr.length -1 === index ? true : false}
                            updateValidationState={(v)=>props.updateValidationState(v)}
                            OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                            passToParent={(val, index)=>{updateReturnGenerators(val, index)}}
                            updateElseFlag={(v)=>{updateElseFlag(v)}}
                            remove={(i)=>{RemoveItem(i)}}
                            parentLevel={0}
                            parentStyle={styleRef} />
                    )
                    _ComponentArray.push(
                        <AddTopLevelNode
                            key={"add-top-level-"+index+1} 
                            pushInputToStack={(i, j)=>pushInputToStack(i, j)} 
                            defaultPresent={arr[arr.length - 1].type == "else" ? true : false}
                            suggestDefault={arr.length - 1 === index} 
                            index={index+1}
                            />
                    )
                } 
            });

            //adding our initial nodes to stack
            // lol
            _ComponentArray.unshift(
                <AddTopLevelNode
                    key={"add-top-level-0"}
                    pushInputToStack={(i, j)=>pushInputToStack(i, j)}
                    defaultPresent = {
                        conditions[conditions.length - 1]
                        ? conditions[conditions.length - 1].type == "else" 
                            ? true 
                            : false
                        : false}
                    suggestDefault={false} 
                    index={0}
                    />
            )
            _ComponentArray.unshift(
                <InitNode key={"init"}
                    thisClass={styleGuide.class}
                    save={()=>{saveToState()}} />
            );
        }


        setComponentArray(_ComponentArray);
    }

    const RemoveItem = (indexToRemove) => {
        let _styleGuide = styleGuide;
        _styleGuide.skuNameAst = _styleGuide.skuNameAst.filter((value, index)=>{return index !== indexToRemove});
        console.log("Logging new Style Guide after condition removal");
        setStyleGuide(_styleGuide);
        setConditionAmount(_styleGuide.skuNameAst.length);
        props.updateValidationState("none");
    }

    const updateReturnGenerators = (incomingUpdate, incomingIndex)=> {
        console.log("I've recieved a request to update the return generators");
        console.log(incomingValues);
        let _styleGuide = styleGuide;
        _styleGuide.skuNameAsts[incomingIndex] = incomingUpdate;
        setStyleGuide(_styleGuide);
        setConditionAmount(_styleGuide.skuNameAst.length)
        props.updateValidationState("none");
    }

    const pushInputToStack = (typeValue, addIndex) => {
        console.log(`Recieved a request to add an input at index ${addIndex}`)
        let newAst = [];
        let _styleGuide = styleGuide;

        const newCondition = typeValue == 'conditional' 
            ? {
                type : "if",
                attributeName: "",
                conditionTargets: [""],
                nestedType: "",
                nestedConditions: []
            }
            : {
                type : "else",
                spec: "",
                conditionTargets: [""],
                nestedType: "",
                nestedConditions: []
            }
        
        if (addIndex == _styleGuide.skuNameAst.length) {
            newAst = newAst.concat(_styleGuide.skuNameAst);
            newAst.push(newCondition);
        } else {
            for (let i in _styleGuide.skuNameAst) {
                if (i == addIndex) {
                    newAst.push(newCondition);
                }
                newAst.push(_styleGuide.skuNameAst[i]);                        
            }   
        };

        _styleGuide.skuNameAst = newAst;

        setStyleGuide(_styleGuide);
        setConditionAmount(_styleGuide.skuNameAst.length);
        console.log(`Finished pushing ${typeValue} to stack`)
    }

    const updateElseFlag = (bool) => {
        console.log(`Updating else flag: ${bool} from ${elseFlag}`)
        if (elseFlag !== bool) {
            setElseFlag(!elseFlag);
        }
    }

    return (
        <div className="drawer-body">
            {ComponentArray}
        </div>
    )
}

//Here lies the root element

function InitNode(props) {

    return (
        <div className="start-node">
            <div className="start-node-class">
                <div>{"Class: " + props.thisClass}</div>
            </div>
        </div>
    )
}

function AddTopLevelNode(props) {
    const [addType, setAddType] = React.useState("conditional");
    const [cardDisplay, setCardDisplay] = React.useState("svg");
    
    //double check all methods below this point as they were yank/pasted
    const handleSVGClick = () => {
        //setCardDisplay('card')
        console.log(`Received a request to add ${addType} to the Top Level`);
        props.pushInputToStack(addType, props.index);
        closeCard();
    }
    const handleSelectChange = (event) => {
        setAddType(event.target.value)
    }

    const closeCard = () => {
        setCardDisplay('svg');
    }

    const pushAddType = () => {
        console.log(`Received a request to add ${addType} to the Top Level`);
        props.pushInputToStack(addType, props.index);
        closeCard();
    }     
    
    return (
        <div className="add-top-container">
            {cardDisplay == "svg"
            ?<div className="add-svg-card">
                <div className="add-level-button">
                    <svg width="1.7em" height="1.7em" onClick={()=>handleSVGClick()}>
                        <circle cx="0.85em" cy="0.85em" r="0.75em"  />
                        <line x1="0.85em" y1="0.15em" x2="0.85em" y2="1.55em" />
                        <line x1="0.15em" y1="0.85em" x2="1.55em" y2="0.85em" />
                    </svg>
                </div>
            </div>
            :<div className="add-selection-card">
                <div className="add-call-input">
                    <div>Select new type:</div>
                    <select value={addType} onChange={handleSelectChange}>
                        <option value="conditional">Add Conditional</option>
                        {!props.defaultPresent && props.suggestDefault
                        ? <option value="default">Add Default</option>
                        : null}
                    </select>
                </div>
                <div className="add-selection-buttons">
                    <button onClick={()=>{pushAddType()}}>Add</button>
                    <button onClick={()=>{closeCard()}}>Cancel</button>
                </div>
            </div>}

        </div>
    )
}