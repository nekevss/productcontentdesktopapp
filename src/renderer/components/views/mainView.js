require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import MainNavbar from '../navbars/mainNavbar.js';
import '../../style/app.scss'
import MainBody from '../main/body.js'
import SkuDrawer from '../main/SkuDrawer.js';
import ReactLoading from 'react-loading';

//**Rename this file to mainInterface**

//below should be built out with the sku state. Since it is local to this interface
export default class MainInterface extends React.Component {
    constructor(props) {
        super(props)
        this.source = "http://www.staples-3p.com/s7/is/image/Staples/";
        let lastView = localStorage.getItem("lastView");
        let skuPosition = lastView == "legacy" ? this.props.focusSKU : 0;
        console.log("sku position is " + skuPosition)
        this.sku = {};
        this.gen = localStorage.getItem('classGenerator') ? [{}] : JSON.parse(localStorage.getItem('classGenerator'));
        this.styleGuide = localStorage.getItem('styleGuide');
        this.attributes = null;
        this.config = {}
        this.state = {
            position : skuPosition,
            length : 1,
            primaryImage : this.source,
            skumenu : false,
            isLoaded: false,
            isCurrent: true
        }

        this.setSkuPosition = this.setSkuPosition.bind(this);
        this.toggleSkuMenu = this.toggleSkuMenu.bind(this);
        this.setprimaryimage = this.setprimaryimage.bind(this);
        this.returnDataAndState = this.returnDataAndState.bind(this);
        this.escapeHistory = this.escapeHistory.bind(this);
        this.handlePositionChange = this.handlePositionChange.bind(this);
    }

    async componentDidMount() {
        //run fetch here
        let lastView = localStorage.getItem("lastView");
        let skuPosition = lastView == "legacy" ? this.props.focusSKU : 0;
        console.log("sku position is " + skuPosition)
        let data = await this.returnDataAndState(skuPosition);
        this.sku = data.sku;
        const active = data.type === "current" ? true : false;
        let primary = this.source + data.sku[this.config["Excel Mapping"]["Primary Image"]];

        this.setState({
            isLoaded: true,
            position: data.position,
            length: data.length,
            primaryImage: primary,
            skumenu : false,
            isCurrent: active
        }, () => console.log(this.state))
    }

    async returnDataAndState(newPosition) {
        let functionalClass = "";
        //fetch configuration
        let activeConfig = await window.api.invoke("fetch-configuration");
        this.config = activeConfig;
        
        //run fetch here
        const responseState = await window.api.invoke('request-sku-and-state', newPosition)
        //invoke this separate, because it only needs to be invoked when
        //a class is updated
        console.log("Logging the config");
        console.log(this.config);
        let noStyleGuideClasses = activeConfig["Functional Data"]["No Style Guide Classes"]
        let skuClass = responseState.sku[activeConfig["Excel Mapping"]["Sku Class"]];
        
        //split webpath and compare on all cases. -> by default always pull class from webPath
        const webPath = responseState.sku[activeConfig["Excel Mapping"]["Web Path"]];
        if (noStyleGuideClasses.includes(skuClass)) {
            console.log("This class does not have a style guide. Checking the Web Path");
            if (webPath.includes("Items")) {
                let pphArray = webPath.split("/");
                for (let i=pphArray.length-1; i>=0; i=i-1) {
                    if (pphArray[i].includes("Items")) {
                        functionalClass = pphArray[i-1];
                        break;
                    }
                }
            } else {
                console.log('WebPath does not have "Items" in string')
            }
            
        } else {
            functionalClass = skuClass;
        }

        console.log("Here is the functional class: " + functionalClass)
        
        localStorage.setItem("class", functionalClass)

        //let feedback the config file to the main process so we aren't reading it.
        const detailQuery = {thisClass:functionalClass, thisSku:responseState.sku, thisPath:webPath, config: activeConfig}
        //change channel name from generator-request to request-class-details
        //run fetch here
        const classDetails = await window.api.invoke('request-class-details', detailQuery)

        console.log("Received new class details!")
        console.log(classDetails)

        this.attributes = classDetails.attributes;
        this.styleGuide = classDetails.styleGuide;
        localStorage.setItem("styleGuide", classDetails.styleGuide)
        this.gen = classDetails.SNG;
        localStorage.setItem("classGenerator", JSON.stringify(classDetails.SNG))

        console.log('Package receieved!');
        return responseState;
    }

    async setSkuPosition(myNewPosition) {
        if (myNewPosition == 0) {
            console.clear();
        }
        console.log("Position is being changed to: ")
        console.log(myNewPosition);
        //run fetch here
        let data = await this.returnDataAndState(myNewPosition)
        this.sku = data.sku;
        const active = data.type === "current" ? true : false;
        let primary = this.source + data.sku[this.config["Excel Mapping"]["Primary Image"]];
        this.setState({
            isLoaded: true,
            position: data.position,
            length: data.length,
            primaryImage: primary,
            skumenu : false,
            isCurrent: active
        }, () => console.log(this.state))
    }

    handlePositionChange(request) {
        if (request == "increment" && this.state.position < this.state.length - 1 && this.state.length !== 1) {
            console.log("Incrementing by 1")
            this.setSkuPosition(this.state.position + 1)
        }
        if (request == "decrement" && this.state.position > 0 && this.state.length !== 1) {
            console.log("Decrementing by 1")
            this.setSkuPosition(this.state.position - 1)
        }
    }

    setprimaryimage(newImage) {
        this.setState((prevState)=>{
            return {
                isLoaded: true,
                position: prevState.position,
                length:prevState.length,
                primaryImage: newImage,
                skumenu : prevState.skumenu,
                isCurrent: prevState.isCurrent
            }
        })
    }

    toggleSkuMenu() {
        console.log("Toggling Menu...");
        this.setState((prevState)=>{
            return {
                isLoaded: prevState.isLoaded,
                position : prevState.position,
                length: prevState.length,
                primaryImage: prevState.primaryImage,
                skumenu : !prevState.skumenu,
                isCurrent: prevState.isCurrent
            }
        })
    }

    async escapeHistory() {
        window.api.invoke("escape-history").then((res)=>{
            console.log(`Response from history escape: ${res}`)
            this.setSkuPosition(0)
        }).catch((err)=>{
            if(err){console.log(err)}
        })
    }

    render() {
        return (
        <div className = "mainView">
            {this.state.skumenu 
            ? <SkuDrawer {...this.state}
                config = {this.config}
                sku={this.sku}
                source ={this.source}
                toggleSkuMenu={this.toggleSkuMenu}
                setSkuPosition = {this.setSkuPosition}
                /> 
            : null}
            <MainNavbar {...this.state} 
                    toggleSkuMenu = {this.toggleSkuMenu}
                    handlePositionChange ={this.handlePositionChange}
                    setSkuPosition = {this.setSkuPosition}
                    escapeHistory = {this.escapeHistory}
            />
            {!this.state.isLoaded
            ? <div className="load-container">
                    <ReactLoading className="react-loader" type={"bars"} color={"gray"} width={"12em"} height={"12em"} />
            </div>
            :<MainBody {...this.state}
                    config= {this.config}
                    sku={this.sku}
                    gen={this.gen}
                    attributes={this.attributes}
                    styleGuide={this.styleGuide}
                    skuset={this.skuset}
                    source = {this.source}
                    setprimaryimage = {(data) => {this.setprimaryimage(data)}} 
                    />
            }
        </div>
    )}
}