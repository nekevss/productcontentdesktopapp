import React from 'react';
import './style/BuilderWorkspace.scss';
import StyleGuideBuildSpace from './BuildSpace.js';
import TreeDrawer from './components/TreeDrawer.js';
import BuilderWelcome from './templates/builderWelcome.js';

export default function BuilderWorkspace(props) {
    const [currentClass, setCurrentClass] = React.useState()
    const [currentType, setCurrentType] = React.useState()

    React.useEffect(() => {
        console.log("Style Guide has been altered. Adjusting current class and type")
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
        <div className="workspace-body">
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
