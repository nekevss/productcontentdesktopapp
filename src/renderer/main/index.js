require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import MainNavbar from './components/navbar/index.js';
import '../style/app.scss'
import MainBody from './components/body'
import SkuDrawer from './components/sku-drawer';
import ReactLoading from 'react-loading';


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
