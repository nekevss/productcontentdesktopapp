require("regenerator-runtime/runtime");
require("core-js/stable");
import React, { useState, useEffect } from 'react';
import ReactLoading from 'react-loading';
import '../../style/drawer.scss'


export default function SkuDrawer(props) {
    const [data, setData] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const currentSku = React.useRef();
    const initialSku = React.useRef();

    const scrollToSKU = () => {
        currentSku.current.scrollIntoView({
            behavior: "smooth"
        })
    }

    const scrolltoIntial = () => {
        initialSku.current.scrollIntoView({
            behavior:"smooth"
        })
    }

    //preload the cards on index 0 load
    useEffect(()=> {
        (async function(){
            let skuCards;
            let skuset = await window.api.invoke('request-skuset')
            console.log("Here is skuset: ")
            console.log(skuset)
            skuCards = skuset.map((sku, index) => {
                let current = false;
                let idString = "";

                if (sku[props.config["Excel Mapping"]["Sku Number"]]) {
                    current = sku[props.config["Excel Mapping"]["Sku Number"]] == props.sku[props.config["Excel Mapping"]["Sku Number"]]
                    idString = "SKU: " + sku[props.config["Excel Mapping"]["Sku Number"]]
                } else {
                    current = sku[props.config["Excel Mapping"]["Pyramid Id"]] == props.sku[props.config["Excel Mapping"]["Pyramid Id"]]
                    idString = "ID: " + sku[props.config["Excel Mapping"]["Pyramid Id"]]
                }
                return (
                    <div ref={ index == 0
                    ? initialSku
                    : current
                    ? currentSku
                    : null}
                    className="menu-card-padder"
                    key={index}>
                        <div className="menu-card" onClick={()=> {props.setSkuPosition(index)}}>
                            <div className="menu-image-container">
                                <div><img src={props.source + sku["Primary Image"]} /></div>
                            </div>
                            <div className="menu-details-container">
                                <div className="sku-class" dangerouslySetInnerHTML={{__html: "Class: " + sku[props.config["Excel Mapping"]["Sku Class"]]}}></div>
                                <div className="sku-number" dangerouslySetInnerHTML={{__html: idString}}></div>
                                <div className="sku-name" dangerouslySetInnerHTML={{__html: "SKU Name: " + sku[props.config["Excel Mapping"]["Sku Name"]]}}></div>
                            </div>
                        </div>
                    </div>
                );
            })
            
            console.log("Setting Sku Card Data")
            setData(skuCards);
            setIsLoading(false);
            console.log(skuCards);

            if (props.position > 0) {
                scrollToSKU()
            }
        })()
    }, [])

    return (
        <div className = "menu-container">
            <div className="menu-header">
                <div className="menu-btn">
                    <button className="initial-btn" onClick={()=>{scrolltoIntial()}}>Scroll to Top</button>
                </div>
                <div className="menu-message">
                    <p>{(props.position + 1) + " out of " + props.length }</p>
                </div>
                <div className="menu-btn">
                    <button className="close-btn" onClick={() => {props.toggleSkuMenu()}}>Close</button>
                </div>
            </div>
            {isLoading 
            ? <ReactLoading className="react-loader" type={"balls"} color={"grey"} width={"7em"} height={"7em"} />
            :<div id="menu-cards" className="menu-card-container">
                {data}
            </div>}
            
        </div>
    )
}