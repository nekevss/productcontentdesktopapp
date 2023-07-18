import React from 'react';
import './style/BuilderWorkspace.scss';
import ActiveBuilder from './workspace/index.js';
import WorkspaceDrawer from './drawer/index.js';
import BuilderWelcome from './templates/builderWelcome.js';

export default function BuilderWorkspace(props) {
    const [currentClass, setCurrentClass] = React.useState()
    const [currentType, setCurrentType] = React.useState()

    React.useEffect(() => {
        console.log("Style Guide has been altered. Logging and adjusting current class and type");
        console.log(props.StyleGuide);
        console.log("Double checking Style Guide")
        
        let incomingStyleGuide = props.StyleGuide;

        // Below is actually handles the auto update of legacy else statements.

        /*-----------------------Beginning of Handle Block-----------------------------------------*/
        if (incomingStyleGuide.skuNameAst) {
            let updateStyleGuide = false;
            let incomingTopLevelArray = incomingStyleGuide.skuNameAst;
            let adjustedTopLevelArray = incomingTopLevelArray.map((condition)=>{
                if (condition.type === "else" && incomingStyleGuide.type === "complex") {
                    console.log("Else condition found. Logging input else condition");
                    console.log(condition);
                    let keyCount = Object.keys(condition).length;
                    if (keyCount < 3) {
                        updateStyleGuide = true;
                        return {
                            type: condition.type,
                            attributeName: "",
                            conditionTargets:[""],
                            nestedType: "",
                            nestedConditions: [],
                            tokens: condition.tokens
                        }
                    } else {
                        return condition
                    }
                } else {
                    return condition
                }
            })

            console.log(`Logging if Style Guide needs to be updated: ${updateStyleGuide}`);

            if (updateStyleGuide) {
                const newStyleGuide = {
                    class: props.StyleGuide.class,
                    type: props.StyleGuide.type,
                    skuNameAst: adjustedTopLevelArray
                }
        
                props.updateStyleGuide(newStyleGuide);
            }
    

        }
        /*---------------------END BLOCK------------------------------------- */        

        setCurrentClass(props.activeClass)
        setCurrentType(props.activeType)
    }, [props.StyleGuide])

    return (
        <>
            {props.active
            ? <ActiveWorkspace {...props}
                currentClass={currentClass} 
                currentType={currentType} />
            : <BuilderWelcome />}
        </>
    )
}

// Move active workspace to a separate file and import.
function ActiveWorkspace(props) {
    const [drawerStack, setDrawerStack] = React.useState([])
    const [activeSGIndex, setActiveSGIndex] = React.useState(0)
    const [displaySG, setDisplaySG] = React.useState(false);
    const [displayDrawer, setDisplayDrawer] = React.useState(true);
    const [currentBuilder, setCurrentBuilder] = React.useState({});
    
    React.useEffect(()=>{
        console.log("Logging the new Drawer Stack")
        drawerStack.length > 0 ? console.log(drawerStack) : console.log("The drawer stack still has no entries");
    }, [drawerStack])

    const OpenInDisplay = (incomingBuilder, level, index) => {
        console.log(`Recieved a request to open style guide at level ${level} index ${index} in display`)
        setCurrentBuilder(incomingBuilder);
        setDisplaySG(true);
    }

    const toggleDrawer = () => {
        let _display = !displayDrawer;
        setDisplayDrawer(_display);
    }

    return (
        <div className="workspace-body">
            {displayDrawer
            ?<div className="top-level-drawer">
                <div className="drawer-header">
                    <div className="minimize-div"><img onClick={()=>{toggleDrawer()}} src="./assets/Staple.png"></img></div>
                </div>
                <WorkspaceDrawer {...props} 
                    OpenStyleGuide={(g,l,i)=>OpenInDisplay(g,l,i)}
                />
            </div>
            : <HiddenDrawer toggle={()=>{toggleDrawer()}} />}
            {displaySG 
            ? <ActiveBuilder {...props}
                activeBuilder={currentBuilder}
                activeIndex={activeSGIndex}
                displayDrawer={displayDrawer} />
            : null}
        </div>
    )
}


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
