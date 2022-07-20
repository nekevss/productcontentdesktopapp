require("regenerator-runtime/runtime");
require("core-js/stable");
import React from "react";
import reactDOM from "react-dom";
import MainInterface from "./main/index.js";
import LegacyInterface from "./legacy-table/legacy.js";
import StyleGuideBuilder from "./builder/index.js";
import BulkSkuNamer from "./sku-namer/SkuNamer.js";
import ConfigurationViewer from "./config-interface/index.js";
import ResourceManager from "./resources/index.js";
import HistoryDisplay from "./history/index.js";
import Importer from "./attribute-importer/index.js";
import './style/app.scss';
import ImportOverlay from "./import-overlay/index.js";


// rough min-width for entire app: 900

// Partially wish the below was a function with React Hooks, but
// this is stable for now and manages the listener

// NOTE: class use on app wrapper is okay for now, use functions
// and React Hooks where possible going forward

class App extends React.Component {
    constructor() {
        super();
        //remove the below before production --dev-feature
        //let lastView = localStorage.getItem('lastView') ? localStorage.getItem('lastView') : 'main'
        this.focusSKU = 0;
        this.state = {
            view: "main",
            overlay: null,
            reload: false
        }

        this.changeViewWithFocus = this.changeViewWithFocus.bind(this);
        this.changeOverlay = this.changeOverlay.bind(this);
        this.updateReload = this.updateReload.bind(this);
        this.updateReloadAndOverlay = this.updateReloadAndOverlay.bind(this);
    }

    componentDidMount() {
        //add listeners here
        window.api.receive("change-interface", (data) => {
            console.log(data);
            let oldView = this.state.view;
            localStorage.setItem('lastView', oldView);
            this.setState((previousState)=> {
                return {
                    view: data,
                    overlay: previousState.overlay,
                    reload: previousState.reload
                }
            })
        })

        window.api.receive("change-overlay", (data) => {
            console.log(data);
            this.setState((previousState)=> {
                return {
                    view: previousState.view,
                    overlay: data,
                    reload: previousState.reload
                }
            })
        })
        window.api.receive("console-log", (message)=>{
            console.log(message)
        })
        window.api.receive("console-display", (data)=>{
            console.log(JSON.parse(data))
        })
        
        window.addEventListener("contextmenu", RightClickFunction, false)
        window.addEventListener("click", HandleLinkClicks, false)
    }

    componentWillUnmount() {
        //remove listeners here
        window.api.removeListener("change-interface");
        window.api.removeListener("change-overlay");
        window.api.removeListener("console-log");
        window.api.removeListener("console-display");
        window.removeEventListener("contextmenu", RightClickFunction);
        window.removeEventListener("click", HandleLinkClicks);
    }

    //this function allows a sku to be opened in default view from legacy view
    changeViewWithFocus(newView, newFocus) {
        console.log("Oh, hey! I recieved a request to open a sku in " + newView)
        console.log("The sku index is: " + newFocus);
        let oldView = this.state.view;
        localStorage.setItem('lastView', oldView);
        if (newFocus !== -1) {
            this.focusSKU = newFocus;
        }
        this.setState((previousState)=> {
            return {
                view: newView,
                overlay: previousState.overlay,
                reload: previousState.reload
            }
        })
        window.scrollTo(0,0);
    }

    changeOverlay(newOverlay) {
        this.setState((previousState)=> {
            return {
                view: previousState.view,
                overlay: newOverlay,
                reload: previousState.reload
            }
        })
    }

    updateReload(bool) {
        this.setState((previousState)=> {
            return {
                view: previousState.view,
                overlay: previousState.overlay,
                reload: bool
            }
        })
    }

    updateReloadAndOverlay(newState) {
        this.setState((previousState)=>{
            return {
                view: previousState.view,
                overlay: newState.overlay,
                reload: newState.reload
            }
        })
    }

    renderOverlay(activeOverlay) {
        switch(activeOverlay) {
            case "data-importer":
                return (
                    <div className='app-overlay' onClick={()=>{this.changeOverlay("")}}>
                        <ImportOverlay 
                            changeOverlay={(i)=>{this.changeOverlay(i)}} 
                            updateReloadAndOverlay={(i)=>this.updateReloadAndOverlay(i)}
                            />
                    </div>
                )
            default:
                return null
        }
    }

    renderView(activeView) {
        //clear the console on view change
        //console.clear();
        //application view router
        switch(activeView) {
            case "main":
                return (
                    <MainInterface 
                        reload={this.state.reload}
                        focusSKU={this.focusSKU}  
                        updateReload={(i)=>this.updateReload(i)}
                        />)
            case "configure":
                return (
                    <ConfigurationViewer />
                )
            case "manage-resources":
                return (
                    <ResourceManager />
                )
            case "legacy":
                return (
                    <LegacyInterface
                        focusSKU={this.focusSKU}
                        changeViewWithFocus={(newView, newFocus) => {this.changeViewWithFocus(newView, newFocus)}}
                        />
                )
            case "bulk-sku-namer":
                return (
                    <BulkSkuNamer />
                )
            case "style-guide-builder":
                return (
                    <StyleGuideBuilder />
                )
            case "history":
                return (
                    <HistoryDisplay />
                )
            case "import":
                return (
                    <Importer />
                )
            default:
                return null
        }
    }

    render() {
        return (
        <div className={"app-wrapper-" + this.state.view}>
            {this.renderOverlay(this.state.overlay)}
            {this.renderView(this.state.view)}
        </div>
    )}
}

const RightClickFunction = (event, param) => {
    event.preventDefault();
    let contextData;
    if (event.target.tagName == "IMG") {
        contextData = {tagName:"IMG", src:event.target.src}
    } else {
        contextData = {tagName:event.target.tagName}
    }
    window.api.message("fetch-context-menu", contextData);
}

const HandleLinkClicks = (event, param) => {
    if (event.target.tagName == "A" && event.target.href.startsWith('http')) {
        event.preventDefault();
        window.api.message("open-in-browser", event.target.href);
    }
}

reactDOM.render(<App />, document.getElementById("root"));