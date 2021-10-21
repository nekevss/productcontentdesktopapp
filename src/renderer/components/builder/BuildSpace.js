import React from 'react';
import ConditionalAttribute from './components/ConditionalCard.js';
import './style/buildspace.scss';

export default function StyleGuideBuildSpace(props) {
    const [currentGenerator, setCurrentGenerator] = React.useState(props.activeGenerator);
    const [styleGuide, setStyleGuide] = React.useState(props.activeGenerator.thenReturn);
    const [sgLength, setLength] = React.useState(()=>{
        return props.activeGenerator.thenReturn ? props.activeGenerator.thenReturn.length : 0;
    });
    const [thisStyle, setThisStyle] = React.useState();
    const [displayStack, setDisplayStack] = React.useState([]);

    React.useEffect(()=>{
        //set values upon props activeGenerator change
        setCurrentGenerator(props.activeGenerator);
        let incomingStyleGuide = props.activeGenerator.thenReturn;
        setStyleGuide(incomingStyleGuide);
        setLength(incomingStyleGuide.length);
    }, [props.activeGenerator])

    React.useEffect(()=> {
        //Should run a Element.offsetWidth to for setting margin
        let thisStyle = {}
        if (props.displayDrawer) {
            let parent = document.getElementsByClassName('top-level-drawer')[0];
            let width = parent.offsetWidth;
            console.log(`The width for setting the BuildSpace margin is ${width}`)
            thisStyle = {
                marginLeft : width/16 + 'em'
            }
        } else {
            let parent = document.getElementsByClassName('hidden-drawer')[0];
            let width = parent.offsetWidth;
            console.log(`The width for setting the BuildSpace margin is ${width}`)
            thisStyle = {
                marginLeft : width/16 + 'em'
            }
        }
        setThisStyle(thisStyle);
    }, [props.displayDrawer])

    React.useEffect(()=>{
        console.log("Entering useEffect for StyleGuide")
        //split the below into normal with svg and construction with working card
        let newStyleGuide = styleGuide;
        let newDisplayStack = [];
        if (sgLength > 0) {
            newStyleGuide.forEach((sgPart, index, array)=> {
                if (sgPart["type"] == "string") {
                    newDisplayStack.push(<StringCard key={sgPart.type + index} 
                        {...props} 
                        styleGuide={sgPart}
                        remove={(i)=>{RemoveItem(i)}}
                        index={index} />
                    )
                } else if (sgPart["type"] == "spec") {
                    //adding line to check for leadString exists and add it if not (can be removed after a December 2021).
                    if (!sgPart.leadString) {sgPart["leadString"]="";}
                    newDisplayStack.push(<SpecCard key={sgPart.type + index} 
                        {...props} 
                        styleGuide={sgPart}
                        remove={(i)=>{RemoveItem(i)}}
                        index={index} />
                    )
                } else {
                    newDisplayStack.push(<ConditionalAttribute key={sgPart.type + index} 
                        {...props} 
                        styleGuide={sgPart}
                        remove={(i)=>{RemoveItem(i)}}
                        index={index} />
                    )
                }
                newDisplayStack.push(
                    <AddCall key={"add-call"+index} 
                        {...props}
                        save={()=>{SaveStyleGuide()}}
                        updateStyleGuide={(type, i)=>{updateStyleGuide(type, i)}}
                        position={array.length-1 == index ? "end" : "mid"} 
                        cardDisplay={'svg'}
                        index={index+1}
                        />
                )
            })
            
            /*newDisplayStack = currentStyleGuide.map((sgPart, index)=> {
                legacy loop --> for reference
            })*/
            console.log("logging the mapped newDisplayStack")
            console.log(newDisplayStack)
            
        } else {
            newDisplayStack.push(
                <AddCall key={"add-call"} 
                    {...props}
                    save={()=>{SaveStyleGuide()}}
                    updateStyleGuide={(type, i)=>{updateStyleGuide(type, i)}}
                    position={"start"}
                    cardDisplay={'svg'}
                    index={0}
                    />
            )
        }
        
        setDisplayStack(newDisplayStack);
        console.log("Exiting useEffect for StyleGuide")
        //
    }, [sgLength, styleGuide]);

    const updateStyleGuide  = (callType, addIndex) => {
        console.log("Entering for StyleGuide Update Function")
        let _generator = currentGenerator;
        console.log(styleGuide)
        let newStyleGuide = [];

        if (styleGuide.length == 0) {
            let sgElement = getCallElement(callType)
            newStyleGuide.push(sgElement);
        } else if (addIndex == styleGuide.length) {
            newStyleGuide = newStyleGuide.concat(styleGuide);
            let sgElement = getCallElement(callType)
            newStyleGuide.push(sgElement);
        } else {
            //set up new key
            //push new key and set state
            for (let i in styleGuide) {
                if (i == addIndex) {
                    let newElement = getCallElement(callType);
                    newStyleGuide.push(newElement);
                }
                newStyleGuide.push(styleGuide[i]);
            }
        }

        console.log("Pushing new Style Guide");
        console.log(newStyleGuide);
        _generator.thenReturn = newStyleGuide;
        //update StyleGuide and Length
        setCurrentGenerator(_generator);
        setStyleGuide(_generator.thenReturn);
        setLength(_generator.thenReturn.length);

        console.log("Exiting StyleGuide Update Function");
    }

    const getCallElement = (callType) => {
        if (callType == "string") {
            return {
                type : callType,
                string : ""
            }
        } else if (callType == "spec") {
            return {
                type: callType,
                report: true,
                spec : "",
                leadString:"",
                endString : ""
            }
        } else {
            return {
                type: callType,
                report : true,
                forAttribute : "",
                conditions: []
            }
        }
    }

    const RemoveItem = (index_to_remove) => {
        console.log(`Request received to delete item at index ${index_to_remove} from Style Guide`)
        console.log(props.StyleGuide);
        let newStyleGuide = styleGuide.filter((value, index)=> index !== index_to_remove);
        //below probably shouldn't be done. For some reason, removing an item would lock the StyleGuide
        props.activeGenerator.thenReturn = newStyleGuide;
        setStyleGuide(newStyleGuide)
        setLength(newStyleGuide.length);
        console.log(props.StyleGuide);
        props.updateValidationState("none")
    }

    const SaveStyleGuide = () => {
        //Note: this might not be needed, but even if not
        //it allows the user to interact with something
        console.log("Logging local Style Guide")
        console.log(styleGuide);
        console.log("Logging StyleGuide before saving")
        console.log(props.StyleGuide)
        const currentStyleGuide = props.StyleGuide;
        props.updateStyleGuide(currentStyleGuide);
        localStorage.setItem("savedStyleGuide", JSON.stringify(currentStyleGuide));
        window.api.message("post-message", "Style Guide has been saved!")
    }

    return (
        <div className="build-space" style={thisStyle}>
            {displayStack}
        </div>
    )
}

function AddCall(props) {
    const computeStyle = (display) =>{
        if (display=='svg') {
            return props.position == "mid" 
                ? {height:"3.75em", margin: "0.75em auto 0 7.5em"}
                : props.position == "end" 
                ? {height:"3.75em", margin: "0.75em auto 1em 7.5em"} 
                : {height:"3.75em", margin: "1.25em auto 0 7.5em"}
        } else {
            return props.position == "mid" 
                ?   {height:"6.5em", margin: "0.75em auto 0 7.5em"} 
                : props.position == "end" 
                ? {height:"6.5em", margin: "0.75em auto 1em 7.5em"} 
                : {height:"6.5em", margin: "1.25em auto 0 7.5em"}
        } 
    }
    const [addCallCard, setAddCallCard] = React.useState(props.cardDisplay);
    const [addType, setAddType] = React.useState("string");
    const [containerStyle, setContainerStyle] = React.useState(()=>{
        return computeStyle(props.cardDisplay)
    })

    const handleSVGClick = () => {
        let style = computeStyle('card')
        setContainerStyle(style);
        setAddCallCard('card')
    }
    const handleSelectChange = (event) => {
        setAddType(event.target.value)
    }

    const closeCard = () => {
        let style = computeStyle('svg');
        setContainerStyle(style);
        setAddCallCard('svg');
    }

    const pushAddType = () => {
        console.log(`Received a request to add ${addType} to Style Guide`)
        props.updateStyleGuide(addType, props.index);
        closeCard();
    }

    return (
        <div className="sg-controls-container" style={containerStyle}>
            {addCallCard == "svg"
            ? <div className="sg-controls" style={props.position == "end" ? {width:"7.5em"}: {width:"3.25em"}}>
                <div title="Add Element" className="add-call-button" style={props.position == "end" ? {margin:"auto 0.25em auto 0.75em"}: {margin:"auto"}}>
                    <svg width="1.7em" height="1.7em" onClick={()=>handleSVGClick()}>
                        <circle cx="0.85em" cy="0.85em" r="0.75em"  />
                        <line x1="0.85em" y1="0.15em" x2="0.85em" y2="1.55em" />
                        <line x1="0.15em" y1="0.85em" x2="1.55em" y2="0.85em" />
                    </svg>
                </div>
                {props.position == "end"
                ?<div title="Save Style Guide" className="save-button" onClick={()=>{props.save()}}>
                    <img src="./assets/StapleSave.png" />
                </div>
                :null}
            </div>
            :<div className="add-call-card"> 
                <div className="add-call-input">
                    <div>Select new type:</div>
                    <select value={addType} onChange={handleSelectChange}>
                        <option value="string">Static String</option>
                        <option value="spec">Attribute Call</option>
                        <option value="function">Conditional Call</option>
                    </select>
                </div>
                <div className="add-call-buttons">
                    <button onClick={()=>{pushAddType()}}>Add</button>
                    <button onClick={()=>{closeCard()}}>Cancel</button>
                </div>
            </div>}
        </div>
    )
}


function StringCard(props) {
    const [StyleGuide, setStyleGuide] = React.useState(props.styleGuide);
    const [thisInput, setThisInput] = React.useState(props.styleGuide.string);

    React.useEffect(()=>{
        setStyleGuide(props.styleGuide);
        setThisInput(props.styleGuide.string)
    }, [props.styleGuide])

    const handleChange = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide.string = event.target.value;
        setThisInput(event.target.value);
        props.updateValidationState("none")
    }

    const remove = () => {
        props.remove(props.index)
    }

    return (
        <div className="string-container">
            <div className="input-section">
                <div className="input-row">
                    <div>Static String:</div>
                    <input type="text" value={thisInput} onChange={handleChange} placeholder="Enter string here" />
                </div>
            </div>
            <div className="button-section">
                <button onClick={()=>{remove()}}>Remove</button>
            </div>
        </div>
    )
}

function SpecCard(props) {
    const [StyleGuide, setStyleGuide] = React.useState(props.styleGuide);
    const [specValue, setSpecValue] = React.useState(props.styleGuide.spec);
    const [endString, setEndString] = React.useState(props.styleGuide.endString);
    const [leadString, setLeadString] = React.useState(props.styleGuide.leadString);
    const [report, setReport] = React.useState(props.styleGuide.report)

    React.useEffect(()=>{
        setStyleGuide(props.styleGuide);
        setSpecValue(props.styleGuide.spec)
        setLeadString(props.styleGuide.leadString);
        setEndString(props.styleGuide.endString)
        setReport(props.styleGuide.report)
    }, [props.styleGuide])

    const handleSpec = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["spec"] = event.target.value;
        setSpecValue(event.target.value);
        props.updateValidationState("none")
    }

    const handleString = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["endString"] = event.target.value;
        setEndString(event.target.value);
        props.updateValidationState("none")
    }

    const handleLead = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["leadString"] = event.target.value;
        setLeadString(event.target.value);
        props.updateValidationState("none")
    }

    const handleReport = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["report"] = event.target.checked;
        setReport(event.target.checked);
    }

    const remove = () => {
        props.remove(props.index)
    }

    return (
        <div className="spec-container">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="input-title">Attribute:</div>
                    <input onChange={handleSpec} value={specValue} type="text" placeholder="Enter attribute here" />
                </div>
                <div className="input-row">
                    <div className="string-title">Lead String:</div>
                    <input onChange={handleLead} value={leadString} type="text" placeholder="(Optional) Enter leading string" />
                </div>
                <div className="input-row">
                    <div className="string-title">Sub String:</div>
                    <input onChange={handleString} value={endString} type="text" placeholder="(Optional) Enter subsequent string" />
                </div>
            </div>
            <div className="button-section">
                <button onClick={()=>{remove()}}>Remove</button>
                <div className="report-input">
                    <div>Mandatory:</div>
                    <input type="checkbox" onChange={handleReport} checked={report}/> 
                </div>
            </div>
        </div>
    )
}