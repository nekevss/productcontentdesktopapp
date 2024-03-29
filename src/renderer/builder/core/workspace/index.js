import React from 'react';
import { StaticString, Attribute, ConditionalAttributeRoot } from './components/index.js';
import './buildspace.scss';

export default function ActiveBuilder(props) {
    const [currentBuilder, setCurrentBuilder] = React.useState(props.activeBuilder);
    const [styleGuide, setStyleGuide] = React.useState(props.activeBuilder.tokens);
    const [sgLength, setLength] = React.useState(()=>{
        return props.activeBuilder.tokens ? props.activeBuilder.tokens.length : 0;
    });
    const [thisStyle, setThisStyle] = React.useState();
    const [displayStack, setDisplayStack] = React.useState([]);

    React.useEffect(()=>{
        //set values upon props activeGenerator change
        setCurrentBuilder(props.activeBuilder);
        let incomingStyleGuide = props.activeBuilder.tokens;
        setStyleGuide(incomingStyleGuide);
        setLength(incomingStyleGuide.length);
    }, [props.activeBuilder])

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
                    newDisplayStack.push(<StaticString key={sgPart.type + index} 
                        {...props} 
                        styleGuide={sgPart}
                        remove={(i)=>{RemoveItem(i)}}
                        index={index} />
                    )
                } else if (sgPart["type"] == "attribute") {
                    //adding line to check for leadString exists and add it if not (can be removed after a December 2021).
                    if (!sgPart.leadString) {sgPart["leadString"]="";}
                    newDisplayStack.push(<Attribute key={sgPart.type + index} 
                        {...props} 
                        styleGuide={sgPart}
                        remove={(i)=>{RemoveItem(i)}}
                        index={index} />
                    )
                } else {
                    newDisplayStack.push(<ConditionalAttributeRoot key={sgPart.type + index} 
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
        let _builder = currentBuilder;
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
        _builder.tokens = newStyleGuide;
        //update StyleGuide and Length
        setCurrentBuilder(_builder);
        setStyleGuide(_builder.tokens);
        setLength(_builder.tokens.length);

        console.log("Exiting StyleGuide Update Function");
    }

    const getCallElement = (callType) => {
        if (callType == "string") {
            return {
                type : callType,
                string : ""
            }
        } else if (callType == "attribute") {
            return {
                type: callType,
                report: true,
                commaLed: false,
                attributeName : "",
                leadString:"",
                endString : ""
            }
        } else {
            return {
                type: callType,
                report : true,
                commaLed: false,
                rootAttribute : "",
                conditions: []
            }
        }
    }

    const RemoveItem = (index_to_remove) => {
        console.log(`Request received to delete item at index ${index_to_remove} from Style Guide`)
        console.log(props.StyleGuide);
        let newStyleGuide = styleGuide.filter((value, index)=> index !== index_to_remove);
        //below probably shouldn't be done. For some reason, removing an item would lock the StyleGuide
        props.activeBuilder.tokens = newStyleGuide;
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
                        <option value="attribute">Attribute Call</option>
                        <option value="conditionalAttribute">Conditional Call</option>
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



