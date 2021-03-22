require("regenerator-runtime/runtime");
require("core-js/stable");
import React from "react";
import reactDOM from "react-dom";
import MainInterface from "./components/views/mainView.js";
import LegacyInterface from "./components/views/legacy.js";
import SNGBuilder from "./components/views/SNGBuilder.js";
import BulkSkuNamer from "./components/views/SkuNamer.js";
import ConfigurationViewer from "./components/views/configViewer.js";
import ResourceManager from "./components/views/ResourceManager.js";
import HistoryDisplay from "./components/views/historyDisplay.js";
import Importer from "./components/views/importer.js";
import './style/app.scss';


//rough min-width for entire app: 900

//Partially wish the below was a function with React Hooks, but
//this is stable for now and manages the listener

//NOTE: class use on app wrapper is okay for now, use functions
//and React Hooks where possible going forward

class App extends React.Component {
    constructor() {
        super();
        //remove the below before production --dev-feature
        //let lastView = localStorage.getItem('lastView') ? localStorage.getItem('lastView') : 'main'
        this.focusSKU = 0;
        this.state = {
            view :  "main"
        }

        this.changeViewWithFocus = this.changeViewWithFocus.bind(this)
    }

    componentDidMount() {
        //add listeners here
        window.api.receive("change-interface", (data) => {
            console.log(data);
            let oldView = this.state.view;
            localStorage.setItem('lastView', oldView);
            this.setState({
                view: data
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
        this.setState({
            view: newView
        })

        window.scrollTo(0,0);
    }

    renderView(activeView) {
        //clear the console on view change
        console.clear();
        //application view router
        switch(activeView) {
            case "main":
                return (
                    <MainInterface 
                        focusSKU={this.focusSKU}  
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
            case "sng-builder":
                return (
                    <SNGBuilder />
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