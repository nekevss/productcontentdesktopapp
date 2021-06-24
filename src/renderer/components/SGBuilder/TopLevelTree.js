import React from 'react';
import '../../style/StyleGuideBuilder/treedrawer.scss';
import RecursiveInputNode from "./TopLevelConditionCard.js";
import DefaultGeneratorCard from './TopLevelDefaultCard';

export default function TreeDrawer(props) {
    const [TopLevelClass, setTopLevelClass] = React.useState(props.StyleGuide.class);
    const [TopLevelType, setTopLevelType] = React.useState(props.StyleGuide.type);
    const [TopLevelArray, setTopLevelArray] = React.useState(props.StyleGuide.returnGenerator);
    const [styleRef, setStyleRef] = React.useState({});
    const [ComponentArray, setComponentArray] = React.useState([])

    React.useEffect(()=>{
        let incomingStyleGuide = props.StyleGuide;
        setTopLevelClass(incomingStyleGuide.class);
        setTopLevelType(incomingStyleGuide.type);
        setTopLevelArray(incomingStyleGuide.returnGenerator);
    }, [props.StyleGuide])

    React.useEffect(()=>{
        let parent = document.getElementsByClassName("drawer-body")[0];
        let width = parent.offsetWidth;
        let widthcheck = parent.scrollHeight > parent.clientHeight;
        console.log(`Here's width ${width}`);
        console.log(`Scrollbar Check: ${widthcheck}`)

        let style = {
            drawerWidth: width,
            scrollbar: widthcheck
        }

        setStyleRef(style);

        let _ComponentArray = [];
        if (TopLevelType == 'simple') {
            _ComponentArray.push(
                <InitNode key={"init"} 
                    thisClass={TopLevelClass}
                    save={()=>{saveToState()}} />
            );
            _ComponentArray.push(
                <DefaultGeneratorCard key={"default"}
                    currentCondition={TopLevelArray[0]}
                    OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                    remove={(i)=>{RemoveItem(i)}}
                    TopLevelType={TopLevelType}
                    index={0}
                />
            );
        } else {
            console.log("Logging the top level array before mapping");
            console.log(props.StyleGuide.returnGenerator);
            console.log(TopLevelArray);
            TopLevelArray.forEach((thisObject, index, arr)=>{
                console.log(`Here's the object being mapped at index ${index}`)
                console.log(thisObject);
                
                if (thisObject.type == 'else') {
                    _ComponentArray.push(
                        <DefaultGeneratorCard key={"default"}
                            currentCondition={thisObject}
                            OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                            remove={(i)=>{RemoveItem(i)}}
                            TopLevelType={TopLevelType}
                            index={index}
                        />
                    )
                } else {
                    _ComponentArray.push(
                        <RecursiveInputNode 
                            key={"input"+index}
                            currentCondition={thisObject}
                            index={index}
                            updateValidationState={(v)=>props.updateValidationState(v)}
                            OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                            passToParent={(val, index)=>{updateReturnGenerators(val, index)}}
                            remove={(i)=>{RemoveItem(i)}}
                            parentLevel={0}
                            parentStyle={styleRef} />
                    )
                    _ComponentArray.push(
                        <AddTopLevelNode
                            key={"add-top-level"+index} 
                            pushInputToStack={(i, j)=>pushInputToStack(i, j)} 
                            defaultPresent={arr[arr.length - 1].type == "else" ? true : false}
                            suggestDefault={arr.length - 1 === index} 
                            index={index+1}
                            />
                    )
                } 
            });

            //adding our initial nodes ot stack
            _ComponentArray.unshift(
                <AddTopLevelNode
                    key={"add-top-level-0"}
                    pushInputToStack={(i, j)=>pushInputToStack(i, j)}
                    defaultPresent = {TopLevelArray[TopLevelArray.length - 1].type == "else" ? true : false}
                    suggestDefault={false} 
                    index={0}
                    />
            )
            _ComponentArray.unshift(
                <InitNode key={"init"}
                    thisClass={TopLevelClass}
                    save={()=>{saveToState()}} />
            );
        }

        console.log("Logging the new drawer components");
        console.log(_ComponentArray);
        let newStyleGuide = {
            type: TopLevelType,
            class: TopLevelClass,
            returnGenerator: TopLevelArray
        };
        console.log("Logging the corresponding top level stack");
        console.log(newStyleGuide);
        props.updateStyleGuide(newStyleGuide);

        setComponentArray(_ComponentArray);
    }, [TopLevelArray])

    const RemoveItem = (indexToRemove) => {
        let newTopLevel = TopLevelArray;
        newTopLevel = newTopLevel.filter((value, index)=>{return index !== indexToRemove});
        console.log("Logging newTopLevel")
        console.log(newTopLevel);
        setTopLevelArray(newTopLevel);
        console.log("Logging the Top Level stack after item removal");
        console.log(props.StyleGuide);
        props.updateValidationState("none");
    }

    const updateReturnGenerators = (incomingValues, incomingIndex)=> {
        console.log("Loggin the TopLevelArray prior to adjustment");
        console.log(TopLevelArray);

        console.log("I've recieved a request to update the return generators");
        console.log(incomingValues);
        let _returnGenerators = TopLevelArray;
        _returnGenerators[incomingIndex] = incomingValues;
        setTopLevelArray(_returnGenerators);
        props.updateValidationState("none");
    }

    const pushInputToStack = (typeValue, addIndex) => {

        console.log("Logging current Style Guide Object in callStackPush:")
        console.log(props.StyleGuide)

        let _returnGenerator = TopLevelArray;
        console.log("Here's the current Return Generator Array")
        console.log(_returnGenerator);
        if (_returnGenerator.length == 0) {
            window.api.alert("send-alert","Please initialize Style Guide before adding conditional")
        } else {
            const newCondition = typeValue == 'conditional' 
                ? {
                    type : "if",
                    spec: "",
                    ifCalled: [""],
                    nestedType: "",
                    nestedConditions: []
                }
                : {
                    type : "else",
                }
            
            let newReturnGenerator = [];

            if (addIndex == _returnGenerator.length) {
                newReturnGenerator = newReturnGenerator.concat(_returnGenerator);
                newReturnGenerator.push(newCondition);
            } else {
                for (let i in _returnGenerator) {
                    if (i == addIndex) {
                        newReturnGenerator.push(newCondition);
                    }
                    newReturnGenerator.push(_returnGenerator[i]);                        
                }   
            } 

            const newStyleGuide = {
                class: props.StyleGuide.class,
                type: props.StyleGuide.type,
                returnGenerator: newReturnGenerator
            }

            props.updateStyleGuide(newStyleGuide);
        }
        console.log(`Finished pushing ${typeValue} to stack`)
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
        setCardDisplay('card')
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