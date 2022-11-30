require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import MainNavbar from '../navbars/mainNavbar.js';
import '../style/app.scss'
import MainBody from './components/body'
import SkuDrawer from './components/sku-drawer';
import ReactLoading from 'react-loading';

//**Rename this file to mainInterface**

export default function MainInterface(props) {
    // Declare state variables. These values have some sort of relation to the state of components downstream
    const [currentPosition, setCurrentPosition] = React.useState(()=>{
        const lastView = localStorage.getItem("lastView");
        return lastView === "legacy" ? props.focusSKU : 0;
    })
    const [length, setLength] = React.useState(()=>{
        const lastView = localStorage.getItem("lastView");
        return lastView === "legacy" ? props.focusSKU + 1 : 1;
    });
    const [primaryImage, setPrimaryImage] = React.useState("https://www.staples-3p.com/s7/is/image/Staples/");
    const [skuMenu, setSkuMenu] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [isCurrent, setIsCurrent] = React.useState(true);

    // Generic variables that will be available throughout the component
    const positionRef = React.useRef(currentPosition);
    const lengthRef = React.useRef(length);
    const sku = React.useRef({});
    const config = React.useRef({});
    const builder = localStorage.getItem('classGenerator') ? React.useRef([{}]) : React.useRef(JSON.parse(localStorage.getItem('classGenerator')));
    const styleGuide = React.useRef(localStorage.getItem('styleGuide'));
    const attributes = React.useRef(null);
    const source = "https://www.staples-3p.com/s7/is/image/Staples/";
    

    React.useEffect(()=>{
        mountView();
    }, [])

    React.useEffect(()=>{
        if (props.reload) {
            console.log("Reload has been triggered")
            setSkuPosition(0)
            props.updateReload(false);
        }
    }, [props.reload])

    React.useEffect(()=>{
        console.log("currentPosition useEffect firing")
        positionRef.current = currentPosition
    }, [currentPosition])

    React.useEffect(()=>{
        window.addEventListener("keydown", checkKeyPress);
        
        return () => {
            window.removeEventListener("keydown", checkKeyPress)
        }
    }, [])

    const checkKeyPress = (evt) => {
        console.log(evt)
        if (evt.key === "ArrowRight") {
            console.log("Right arrow key pressed")
            console.log(`Requesting position be set to ${positionRef.current + 1}`)
            setSkuPosition(positionRef.current + 1)
        }
        if (evt.key === "ArrowLeft") {
            console.log("left arrow key pressed")
            console.log(`Requesting position be set to ${positionRef.current - 1}`)
            setSkuPosition(positionRef.current - 1)
        }   
    }

    const mountView = () => {
        window.api.invoke("fetch-configuration").then((fetchedConfig)=>{
            config.current = fetchedConfig
            setSkuPosition(currentPosition)
        })
    }

    const returnDataAndState = async(newPosition) => {       
        //run fetch here
        const responseState = await window.api.invoke("request-sku-and-state", newPosition);
        //invoke this separate, because it only needs to be invoked when
        //a class is updated
        console.log("Logging the config");
        console.log(config);
        const activeConfig = config.current;

        const webPath = responseState.sku[activeConfig["Excel Mapping"]["PPH Path"]];   

        // let feedback the config file to the main process so we aren't reading it.
        const detailQuery = {
            thisSku: responseState.sku, 
            thisPath: webPath
        }
        // change channel name from generator-request to request-class-details
        // run fetch here
        const classDetails = await window.api.invoke('request-class-details', detailQuery)

        console.log("Received new class details!")
        console.log(classDetails)

        console.log("Here is the functional class: " + classDetails.webClass)
        
        localStorage.setItem("class", classDetails.webClass)

        attributes.current = classDetails.attributes;
        styleGuide.current = classDetails.styleGuide;
        localStorage.setItem("styleGuide", classDetails.styleGuide)
        builder.current = classDetails.builder;
        localStorage.setItem("classGenerator", JSON.stringify(classDetails.builder))

        console.log('Package receieved!');
        return responseState;
    }

    const setSkuPosition = async(newPosition) => {
        console.log(`Setting SKU Position to ${newPosition} out of ${lengthRef.current}`)
        if (newPosition <= lengthRef.current - 1 && newPosition >= 0) {
            const activeConfig = config.current;
            if (newPosition == 0) {
                console.clear();
            }
            console.log("Position is being changed to: ")
            console.log(newPosition);
            //run fetch here
            let data = await returnDataAndState(newPosition)
            sku.current = data.sku;
            const active = data.type === "current" ? true : false;
            let primary = source + data.sku[activeConfig["Excel Mapping"]["Primary Image"]];
    
            if (active !== isCurrent) {
                setIsCurrent(active);
            }
    
            if (data.length !== length) {
                lengthRef.current = data.length
                setLength(data.length)
            }
    
            if (!isLoaded) {
                setIsLoaded(true)
            }
            
            setPrimaryImage(primary);
            setCurrentPosition(data.position)
        }
    }

    const handlePositionChange = (request) => {
        console.log(`Recieved a request to ${request} with ${length} and ${position}`);
        if (request == "increment") {
            console.log("Incrementing by 1")
            
        }
        if (request == "decrement") {
            console.log("Decrementing by 1")
            
        }
    }

    const setprimaryimage = (newImage) => {
        setPrimaryImage(newImage)
    }

    const toggleSkuMenu = () => {
        console.log("Toggling Menu...");
        setSkuMenu(!skuMenu)
    }

    const escapeHistory = () => {
        window.api.invoke("escape-history").then((res)=>{
            console.log(`Response from history escape: ${res}`)
            setSkuPosition(0)
        }).catch((err)=>{
            if(err){console.log(err)}
        })
    }

    return (
        <>
            <MainNavbar 
                length = {length}
                position = {currentPosition}
                isCurrent = {isCurrent} 
                toggleSkuMenu = {()=>toggleSkuMenu()}
                handlePositionChange ={handlePositionChange}
                setSkuPosition = {(i)=>setSkuPosition(i)}
                escapeHistory = {()=>escapeHistory()}
            />
            <div className = "main-view-container">
                {skuMenu 
                ? <SkuDrawer 
                    position ={currentPosition}
                    length = {length}
                    config = {config.current}
                    sku={sku.current}
                    source ={source}
                    toggleSkuMenu={()=>toggleSkuMenu()}
                    setSkuPosition = {(i)=>setSkuPosition(i)}
                    /> 
                : null}
                {!isLoaded
                ? <div className="load-container">
                        <ReactLoading className="react-loader" type={"bars"} color={"gray"} width={"12em"} height={"12em"} />
                </div>
                :<MainBody 
                        position = {currentPosition}
                        length = {length}
                        primaryImage ={primaryImage}
                        config= {config.current}
                        sku={sku.current}
                        gen={builder.current}
                        attributes={attributes.current}
                        styleGuide={styleGuide.current}
                        source = {source}
                        setprimaryimage = {(data) => {setprimaryimage(data)}} 
                        />
                }
            </div>
        </>
    )

}

// Below can be removed eventually as it is the intial and completely functional class based version 
// of MainView. MainView was reimplemented as the above but I'm keeping it on the off chance of a 
// worse case scenario.

/*
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
        const responseState = await window.api.invoke("request-sku-and-state", newPosition);
        //invoke this separate, because it only needs to be invoked when
        //a class is updated
        console.log("Logging the config");
        console.log(this.config);

        // There is a bug here. Sometimes when switching from Legacy view to Default view
        // the response sku will be undefined. No way to replicate so far. Seems to be with
        // the generic sheet post Pyramid software update 2/21/2022
        
        // Note: this function at one point used Sku Class as the default class. But this was ultimately 
        // unreliable due to excel cutting names early. So switching to the below approach. Might be a 
        // decent idea to write the below as a utility function on the main side. However, right now that
        // is more lines of code than just copy and pasting the below where need be (SKU Namer and Default 
        // View primarily) 
        const webPath = responseState.sku[activeConfig["Excel Mapping"]["PPH Path"]];
        let pphArray = webPath.split(/(?<=[\w.*+?^${}()|[\]\\])\/(?=[\w.*+?^${}()|[\]\\])/gi);
        for (let i = pphArray.length-1; i>=0; i=i-1) {
            // this finds the class based of the SKU being in a normal area
            if (pphArray[i].includes("Items")) {
                functionalClass = pphArray[i-1];
                break;
            }

            // The below is going to be super greedy. In most cases, the 4th PPH value should be the class.
            // Above we handle based off finding "Items", because we can verify the return is 
            // 100% valid.
            // Here, we are going to make a broad assumption that if we have made it to index 3, then
            // the value at that point is the class. This is being implemented primarily for SKU sets
            // and we will leave it be.

            if (i === 3) {
                functionalClass = pphArray[i];
                break;
            }

        }

        console.log("Here is the functional class: " + functionalClass)
        
        localStorage.setItem("class", functionalClass)

        // let feedback the config file to the main process so we aren't reading it.
        const detailQuery = {
            thisClass: functionalClass, 
            thisSku: responseState.sku, 
            thisPath: webPath, 
            config: activeConfig
        }
        // change channel name from generator-request to request-class-details
        // run fetch here
        const classDetails = await window.api.invoke('request-class-details', detailQuery)

        console.log("Received new class details!")
        console.log(classDetails)

        this.attributes = classDetails.attributes;
        this.styleGuide = classDetails.styleGuide;
        localStorage.setItem("styleGuide", classDetails.styleGuide)
        this.gen = classDetails.builder;
        localStorage.setItem("classGenerator", JSON.stringify(classDetails.builder))

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
        <>
            <MainNavbar {...this.state} 
                toggleSkuMenu = {this.toggleSkuMenu}
                handlePositionChange ={this.handlePositionChange}
                setSkuPosition = {this.setSkuPosition}
                escapeHistory = {this.escapeHistory}
            />
            <div className = "main-view-container">
                {this.state.skumenu 
                ? <SkuDrawer {...this.state}
                    config = {this.config}
                    sku={this.sku}
                    source ={this.source}
                    toggleSkuMenu={this.toggleSkuMenu}
                    setSkuPosition = {this.setSkuPosition}
                    /> 
                : null}
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
        </>
    )}
}
*/
