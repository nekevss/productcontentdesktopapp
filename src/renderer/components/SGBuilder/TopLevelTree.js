import React from 'react';
import '../../style/StyleGuideBuilder/treedrawer.scss';

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
            _ComponentArray = TopLevelArray.map((thisObject, index)=>{
                console.log(`Here's the object being mapped at index ${index}`)
                console.log(thisObject);
                if (thisObject.type == 'else') {
                    return (
                        <DefaultGeneratorCard key={"default"}
                            currentCondition={thisObject}
                            OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                            remove={(i)=>{RemoveItem(i)}}
                            TopLevelType={TopLevelType}
                            index={index}
                        />
                    )
                } else {
                    return (
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
                }
                
            });
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

//Below is the code for the basic recursive element

function RecursiveInputNode(props) {
    const [thisCondition, setThisCondition] = React.useState(props.currentCondition);
    const [thisIndex, setThisIndex] = React.useState(props.index);
    const [thisLevel, setThisLevel] = React.useState(props.parentLevel + 1);
    const [childCount, setChildCount] = React.useState(props.currentCondition.nestedConditions.length);
    const [children, setChildren] = React.useState([]);
    const [thisStyle, setThisStyle] = React.useState({});

    //Use Effects for handling value updates

    React.useEffect(()=> {
        let drawerBody = document.getElementsByClassName("drawer-body")[0];
        let parentWidth = drawerBody.offsetWidth;
        let nodeWidth = (parentWidth * 0.9)/16;
        let widthcheck = drawerBody.scrollHeight > drawerBody.clientHeight;
        let marginCalculation = 1.5+(1.25*thisLevel);
        let thisWidth = widthcheck ? nodeWidth - marginCalculation : nodeWidth - marginCalculation
        let _style = {
            marginLeft: marginCalculation +'em',
            width: thisWidth +'em'
        }
        console.log("Logging the style object")
        console.log(_style);
        setThisStyle(_style);
    }, [])

    React.useEffect(()=>{
        setThisCondition(props.currentCondition)
        setThisIndex(props.index)
        setThisLevel(props.parentLevel + 1)
        setChildCount(props.currentCondition.nestedConditions.length)
    }, [props.currentCondition])

    React.useEffect(()=> {
        let _thisNested = thisCondition.nestedConditions;
        let _children = [];
        
        if (_thisNested.length > 0) {
            _children = _thisNested.map((value, index)=>{
                return (
                <RecursiveInputNode 
                    key={"level-"+thisLevel+"-index-"+index}
                    updateValidationState={(v)=>props.updateValidationState(v)}
                    OpenStyleGuide={(g,l,i)=>props.OpenStyleGuide(g,l,i)}
                    currentCondition={value}
                    parentLevel={thisLevel}
                    parentStyle={props.parentStyle}
                    remove={(i)=>{RemoveItem(i)}}
                    index={index} />
                )
            })
        }

        console.log("Logging children after creating components");
        console.log(_children);
        setChildren(_children);
        
    }, [thisCondition.nestedConditions.length])

    //button handlers

    const addChild = () => {
        console.log("Logging Condition before adding child");
        console.log(thisCondition);
        let _thisCondition = thisCondition;
        _thisCondition.nestedConditions.push({
            type : "if",
            spec: "",
            ifCalled: [""],
            nestedType: "",
            nestedConditions: []
        })
        _thisCondition.nestedType = _thisCondition.nestedType == "" ? "AND" : _thisCondition.nestedType;
        setThisCondition(_thisCondition);
        setChildCount(_thisCondition.nestedConditions.length);
        console.log('Logging the new condition after adding a child')
        console.log(thisCondition);
        props.updateValidationState("none")
    }

    const RemoveItem = (indexToRemove)=>{
        console.log(`Received a request to remove an item at index ${indexToRemove}`)
        let _thisCondition = thisCondition;
        _thisCondition.nestedConditions = _thisCondition.nestedConditions.filter((value, index)=>{return index !== indexToRemove})
        setThisCondition(_thisCondition);
        setChildCount(_thisCondition.nestedConditions.length);
        console.log("Logging StyleGuide after removing item");
        console.log(props.StyleGuide);
        props.updateValidationState("none")
    }

    const OpenSG = () => {
        console.log("Receieved a request to open the below condition");
        console.log(thisCondition);
        if (thisCondition.hasOwnProperty("thenReturn")) {
            props.OpenStyleGuide(thisCondition, thisLevel, thisIndex);
        } else {
            let _Condition = thisCondition;
            _Condition["thenReturn"] = [];
            setThisCondition(_Condition);
            props.OpenStyleGuide(_Condition, thisLevel, thisIndex);
        }
    }

    return (
        <div className={"input-node"}>
            <div className ="input-form" style={thisStyle}>
                <div className="inputs-section">
                    <div className="input-form-row">
                        <TypeSelection {...props}
                            thisLevel={thisLevel}
                            thisCondition={thisCondition} />
                        <AttributeInput {...props}
                            thisCondition={thisCondition} />
                    </div>
                    <div className="input-form-row">
                        <NestedTypeSelection {...props}
                            childCount={childCount}
                            thisCondition={thisCondition} />
                        <ValuesInput {...props}
                            thisCondition={thisCondition} />
                    </div>
                    
                </div>
                <TopLevelControls 
                    OpenSG={()=>{OpenSG()}}
                    addChild={()=>addChild()}
                    remove={(i)=>props.remove(i)}
                    index={thisIndex}
                    children={childCount} />
            </div>
            {childCount > 0 
            ? children
            :null}
        </div>
    )
}

//interior Components for the Recursive Input Node

function TypeSelection(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition)
    const [thisType, setThisType] = React.useState(props.thisCondition.type)

    React.useEffect(()=>{
        setThisCondition(props.thisCondition)
        setThisType(props.thisCondition.type)
    }, [props.thisCondition])

    const handleTypeChange = (event) => {
        let _Condition = thisCondition;
        let _thisType = event.target.value;
        _Condition.type = event.target.value;
        setThisType(_thisType);
        setThisCondition(_Condition);
    }

    return (
        <div className="input-form-column">
            <div className="row-title">Type:</div>
            <select className="type-input" value={thisType} onChange={handleTypeChange}>
                <option value={"if"}>If</option>
                {props.thisLevel > 1
                ? <option value={"else"}>Else</option>
                :null}
                <option value={"ifNot"}>If Not</option>
                <option value={"includes"}>Includes</option>
                <option value={"equals"}>Equals</option>
                <option value={"notEquals"}>Not Equal</option>
            </select>
        </div>
    )
}

function NestedTypeSelection(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition)
    const [nestedType, setNestedType] = React.useState(props.thisCondition.nestedType)

    React.useEffect(()=>{
        setThisCondition(props.thisCondition)
        setNestedType(props.thisCondition.nestedType)
    }, [props.thisCondition])

    const handleNestedTypeChange = (event) => {
        let _Condition = thisCondition;
        let _nestedType = event.target.value;
        _Condition.nestedType = event.target.value;
        setNestedType(_nestedType);
        setThisCondition(_Condition);
    }

    return (
        <div className="input-form-column" >
            <div className="row-title">Nested:</div> 
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

function AttributeInput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition)
    const [thisAttribute, setThisAttribute] = React.useState(props.thisCondition.spec)

    React.useEffect(()=>{
        setThisCondition(props.thisCondition)
        setThisAttribute(props.thisCondition.spec);
    }, [props.thisCondition])

    const handleSpecChange = (event) => {
        let _Condition = thisCondition;
        let _thisAttribute = event.target.value;
        _Condition.spec = event.target.value;
        setThisAttribute(_thisAttribute);
        setThisCondition(_Condition);
    }

    return (
        <div className="input-form-column">
            <div className="row-title">Spec:</div>
            <input value={thisAttribute} onChange={handleSpecChange} placeholder="Enter Spec Here" />
        </div>
    )
}

function ValuesInput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition)
    const [ifCalledString, setIfCalledString] = React.useState("")

    React.useEffect(()=>{
        setThisCondition(props.thisCondition);
        const ifCalled = props.thisCondition.ifCalled;
        let ifCalledString = ifCalled.join("&&")
        setIfCalledString(ifCalledString)
    }, [props.thisCondition])

    const handleValuesChange = (event) => {
        let _Condition = thisCondition;
        const regex = /\s\&\&\s/g;
        const regex2 = /\&\&/g;
        let val = event.target.value;
        let _ifCalled = regex.test(val) ? val.split(regex) : regex2.test(val) ? val.split(regex2) : [event.target.value];
        _Condition.ifCalled = _ifCalled;
        setIfCalledString(event.target.value);
        setThisCondition(_Condition);
    }

    return (
        <div className="input-form-column">
            <div className="row-title">Value(s):</div>
            <input value={ifCalledString} onChange={handleValuesChange} placeholder="Enter Values Here" />
        </div>
    )
}

function TopLevelControls(props) {

    const remove = () => {
        console.log("Recieved a request to remove a component");
        props.remove(props.index);
    }

    return(
        <div className="input-controls">
            <button title="Add a child element to node" onClick={()=>props.addChild()}>Add Child</button>
            <button title="Remove this element" onClick={()=>{remove()}}>Remove</button>
            {props.children == 0
            ?<button title="Open style guide formula in workbench" className="f-x" onClick={()=>{props.OpenSG()}}>Open Formula</button>
            : null}
            
        </div>
    )
}

//Default Generator Card

function DefaultGeneratorCard(props) {
    const [thisCondition, setThisCondition] = React.useState(props.currentCondition)

    const OpenSG = () => {
        let _Condition = thisCondition;
        if (thisCondition.hasOwnProperty("thenReturn")) {
            props.OpenStyleGuide(thisCondition, 1, props.index);
        } else {
            _Condition["thenReturn"] = [];
            setThisCondition(_Condition);
            props.OpenStyleGuide(_Condition, 1, props.index)
        }   
    }

    const remove = () => {
        props.remove(props.index);
    }

    return (
        <div className="default-node">
            <div className="default-node-container">
                <div className="default-title"><p>Default Formula</p></div>
                <div className="default-controls">
                    <button title="Open style guide formula in workbench" className="f-x" onClick={()=>{OpenSG()}}>Open Formula</button>
                    {props.TopLevelType == "complex"
                    ? <button title="Remove default generator" onClick={()=>{remove()}}>Remove</button>
                    :null}
                </div>
            </div>
        </div>
    )
}