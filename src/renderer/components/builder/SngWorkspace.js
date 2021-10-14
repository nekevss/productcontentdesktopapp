import React from 'react';
import './style/sngWorkspace.scss';
import StyleGuideBuildSpace from './BuildSpace.js';
import TreeDrawer from './components/TopLevelTree.js';

export default function SngWorkspace(props) {
    const [currentClass, setCurrentClass] = React.useState()
    const [currentType, setCurrentType] = React.useState()

    React.useEffect(() => {
        console.log("Style Guide has been altered. Adjusting current class and type")
        setCurrentClass(props.activeClass)
        setCurrentType(props.activeType)
    }, [props.StyleGuide])

    return (
        <div className="workspace-body">
            {props.active
            ? <ActiveWorkspace {...props}
                currentClass={currentClass} 
                currentType={currentType} />
            : <WorkspaceWelcome />}
        </div>
    )
}

//Move active workspace to a separate file and import.
function ActiveWorkspace(props) {
    const [drawerStack, setDrawerStack] = React.useState([])
    const [activeSGIndex, setActiveSGIndex] = React.useState(0)
    const [displaySG, setDisplaySG] = React.useState(false);
    const [displayStyleGuide, setDisplayStyleGuide] = React.useState(false)
    const [displayDrawer, setDisplayDrawer] = React.useState(true);
    const [currentGenerator, setCurrentGenerator] = React.useState({});
    
    React.useEffect(()=>{
        console.log("Logging the new Drawer Stack")
        drawerStack.length > 0 ? console.log(drawerStack) : console.log("The drawer stack still has no entries");
    }, [drawerStack])

    const OpenInDisplay = (incomingGenerator, level, index) => {
        console.log(`Recieved a request to open style guide at level ${level} index ${index} in display`)
        setCurrentGenerator(incomingGenerator);
        setDisplaySG(true);
    }

    const CloseDisplay = () => {
        setDisplaySG(false);
    }

    const toggleDrawer = () => {
        let _display = !displayDrawer;
        setDisplayDrawer(_display);
    }

    return (
        <div className="active-workspace">
            {displayDrawer
            ?<div className="top-level-drawer">
                <div className="drawer-header">
                    <div className="minimize-div"><img onClick={()=>{toggleDrawer()}} src="./assets/Staple.png"></img></div>
                </div>
                <TreeDrawer {...props} 
                    OpenStyleGuide={(g,l,i)=>OpenInDisplay(g,l,i)}
                />
            </div>
            : <HiddenDrawer toggle={()=>{toggleDrawer()}} />}
            {displaySG 
            ? <StyleGuideBuildSpace {...props}
                activeGenerator={currentGenerator}
                activeIndex={activeSGIndex}
                displayDrawer={displayDrawer} />
            : null}
        </div>
    )
}

/*
To use TopLevelDrawerContainer use the below code under drawer-header
Below is unused, but does contain working code for a connecting element line
function TopLevelDrawerContainer(props) {
    const [x, setX] = React.useState(0);
    const [y1, setY1] = React.useState(0);
    const [y2, setY2] = React.useState(0);
    const [scrollPos, SetScrollPos] = React.useState(0);
    
    //I can have the line save by adding app width to props, and update on window size...probably
    React.useEffect(()=>{
        let parent = document.getElementsByClassName("drawer-body")[0];
        let width = parent.offsetWidth;
        let widthcheck = parent.scrollHeight > parent.clientHeight;
        let parentRect = parent.getBoundingClientRect();
        console.log(`Scrollbar Check: ${widthcheck}`)
        let currentCards = parent.childNodes;
        console.log('Logging current cards');
        console.log(currentCards)
        if (currentCards.length > 2) {
            console.log("Creating line")
            //initNode --
            let initNode = currentCards[0];
            let initRect = initNode.getBoundingClientRect();
            let initHeight = initRect.bottom - parentRect.top
            let thisy1 = initHeight;
            //lastNode
            let lastPosition = currentCards.length - 2;
            let lastNode = currentCards[lastPosition];
            let lastRect = lastNode.getBoundingClientRect();
            let thisy2 = lastRect.bottom - parentRect.top;
            
            //Set my states
            widthcheck ? setX((width/2)-12) : setX(width/2);
            setY1(thisy1);
            setY2(thisy2);
        }
        
        //console.log(x)
    }, [props.drawerStack])

    const handleScroll = () =>{
        console.log("A scroll was detected!")
        let drawer = document.getElementsByClassName('drawer-body')[0];
        let scrollAmount = drawer.scrollTop;
        let thisScroll = scrollAmount - scrollPos;
        let currentY1 = y1;
        let newY1 = currentY1 - thisScroll;
        setY1(newY1);
        SetScrollPos(scrollAmount);
    }

    //TODO: must finish adding in lines
    return (
        <div className="drawer-body" onScroll={handleScroll}>
            {props.drawerStack}
            <svg className="div-connector" width="100%" height="100%">
                <line x1={x} y1={y1} x2={x} y2={y2} style={{stroke:"rgb(128,128,128)", strokeWidth:"2"}} />
            </svg>
        </div>
    )
}
*/


function HiddenDrawer(props) {

    return (
        <div className="hidden-drawer">
            <div className="hidden-top">
                <div><img onClick={()=>props.toggle()} src="./assets/Staple.png"></img></div>
            </div>
            <div className="hidden-spacer"></div>
        </div>
    )
}

//probably need a top-first-level function component
//this would return node stack as value.

function WorkspaceWelcome(props) {
    return (
        <div className="active-workspace">
            <div className="welcome-container">
                <h1>Welcome to the Style Guide Builder!</h1>
                <p>This builder is an interface designed to assist in building
                both a Style Guide formula and Sku Name Generator as well as the handling
                of and interaction with Sku Name Generator. Please note: these assets are
                stored locally and must be exported to a centralized storage through a
                different interface.</p>
                <p>Button Overview:</p>
                <ul>
                    <li><b>Import Asset: </b>Loads asset from locally stored JSON</li>
                    <li><b>New Style Guide: </b>Creates blank template Style Guide</li>
                    <li><b>Clear Builder: </b>Resets Style Guide Builder (Should be done prior to importing an asset or creating blank asset)</li>
                    <li><b>Add Conditional: </b>Adds a conditional logic element to top level drawer</li>
                    <li><b>Add Default: </b>Adds default logic element to top level drawer (logically functions as "All Other Values")</li>
                    <li><b>Run Validation: </b>Validates whether current asset contains errors</li>
                    <li><b>Expose Assets: </b>Exposes the Style Guide Formula and the Sku Name Generator Assets for external use</li>
                    <li><b>Export Formula: </b>Exports Style Guide Formula to local storage</li>
                    <li><b>Export Builder: </b>Exports Sku Name Builder to local storage</li>
                    <li><b>Export Assets: </b>Exports both assets to local storage</li>
                    <li><b>Delete Curernt Style Guide: </b>Deletes assets for loaded class</li>
                </ul>
                <p>Formula Card Overview:</p>
                <ul>
                    <li><b>String Card: </b>Provides input for a static string of characters</li>
                    <li><b>Attribute Card: </b>Provides inputs for an attribute call</li>
                    <li><b>Conditional Card: </b>Provides inputs for an attribute call with conditional logic</li>
                </ul>
                <p>Logic Types Overview</p>
                <ul>
                    <li><b>If (Spec-Value): </b>Returns true in the case where the called attribute is equal to expected value(s), if not returns false and moves to next case</li>
                    <li><b>Else (Default): </b>Provides true in all cases, never returns false</li>
                    <li><b>If Not (Spec-Value): </b>Returns true in the case where the called attribute is not equal to expected value(s), if not returns false and moves to next case</li>
                    <li><b>If Null (Spec): </b>Returns a null value, which throws an error on the case, if not returns false and moves to next case</li>
                    <li><b>Includes (Spec-Value): </b>Returns true in the case where the expected value is found within the called attribute, if not returns false and moves to next case</li>
                    <li><b>Equals (Spec-Spec): </b>Returns true in the case where the called attribute is equal to secondary called attribute (Please note: expected values are treated as attribute calls), if not returns false and moves to next case</li>
                    <li><b>Not Equals (Spec-Spec): </b>Returns true in the case where the called attribute is not equal to secondary called attribute (Please note: expected values are treated as attribute calls), if not returns false and moves to next case</li>
                </ul>
                <p>Important Notes:</p>
                <ul>
                    <li>Expected values should be separated by && (please note: best practice is with no spaces added)</li>
                    <li>Conditional calls must have a return object on end case</li>
                    <li>Including attribute calls in else statements are best practice</li>
                    <li>If/Else statement is recommended in two-option conditional vs. If/If statement (Note: there are cases where If/If statement is necessary)</li>
                    <li>Validation must be run prior to exposing or exporting assets</li>
                </ul>
            </div>
        </div>
    )
}