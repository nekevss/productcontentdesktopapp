require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import './style/body.scss';
import DisplayPanel from './display-panel/index.js';
import ImageGallery from './image-gallery';

export default function MainBody(props) {
    const [currentSKU, setCurrentSKU] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [contentReport, setContentReport] = React.useState([]);
    const [attributeReport, setAttributeReport] = React.useState([]);

    React.useEffect(()=>{
        handleSKUContent(props.sku, props.attributes, props.config)
    }, [])

    React.useEffect(()=>{
        handleSKUContent(props.sku, props.attributes, props.config);
    }, [props.sku])

    React.useEffect(()=>{
        console.log("current SKU has changed to the below and is loaded")
        console.log(currentSKU)
    }, [currentSKU])

    const handleSKUContent = (incomingSKU, incomingAttributes, incomingConfig) => {
        window.api.invoke("request-sku-report", {sku: incomingSKU, config: incomingConfig})
            .then((contentReport)=> {
                console.log("Content Report Complete.");
                setContentReport(contentReport);
            })
            .catch((err)=>{if(err){console.log(err)}}) 

        window.api.invoke("run-attribute-search", {sku: incomingSKU, attributes: incomingAttributes, config: incomingConfig})
            .then((evaluatedAttributes)=> {
                console.log("Attributes evaluated")
                setAttributeReport(evaluatedAttributes)
            })
            .catch((err)=>{if(err){console.log(err)}}) 

        // Run Spellcheck after searching for attributes and running the SKU Report
        const spellcheckPackage = {
            sku: incomingSKU,
            config: props.config
        }
        window.api.invoke("complete-spellcheck", spellcheckPackage)
            .then((cleanedSKU)=>{
                console.log(cleanedSKU)
                setCurrentSKU(cleanedSKU)
                if (isLoading) {
                    setIsLoading(false)
                }
            })
            .catch((err)=>{if(err){console.log(err)}})             
    }

    return(
        <>
        {isLoading
        ? null
        : <div className="body-container">
            <div className="top-spacer">
                <p dangerouslySetInnerHTML={{__html: currentSKU[props.config["Excel Mapping"]["PPH Path"]]}}></p> 
            </div>
            <div className="top-container">
                <ImageGallery {... props} />
                <DisplayPanel 
                    config ={ props.config}
                    styleGuide={ props.styleGuide} 
                    skuNameTokens={props.skuNameTokens} 
                    sku={currentSKU}
                    attributes={props.attributes}
                    contentReport={contentReport}
                    attributeReport={attributeReport} 
                />
            </div>
            <div className="lower-container">
                <WrittenContent sku={currentSKU} config ={props.config} />
                <SpecsTable sku={currentSKU} config ={props.config} />
            </div> 
        </div>
        }
        </>
    )
}




function WrittenContent(props) {

    const extendedDesc = React.useRef() 
    if (extendedDesc.current) {
        extendedDesc.current = extendedDesc.current.replace("/<lt\/*>/gi", "<");
        extendedDesc.current = extendedDesc.current.replace("/<gt\/*>/gi", ">");
    }

    return (
        <div className="WrittenContent">
            <h3>About Product</h3>
            {props.sku[props.config["Excel Mapping"]["Headliner"]] 
            ? <h4 dangerouslySetInnerHTML={{__html: props.sku[props.config["Excel Mapping"]["Headliner"]]}}></h4>
            : null}
            {props.sku[props.config["Excel Mapping"]["Short Description"]]
            ? <p dangerouslySetInnerHTML={{__html: props.sku[props.config["Excel Mapping"]["Short Description"]]}}></p>
            : null}
            <Bullets sku={props.sku} config={props.config} />
            {props.sku[props.config["Excel Mapping"]["Extended Description"]]
            ? <p dangerouslySetInnerHTML={{__html: props.sku[props.config["Excel Mapping"]["Extended Description"]]}}></p>
            : null}
        </div>
    );

}

function Bullets(props) {
    let bullets = [];
    let call = "";

    let bulletsArray = props.config["Excel Mapping"]["Bullets"];

    bulletsArray.forEach((value, index)=>{
        call = value;
        if (props.sku[call]) {
            bullets.push(<li key={call} dangerouslySetInnerHTML={{__html: props.sku[call]}}></li>)
        }
    })

    return (
        <div className="BulletCopy">
            {bullets}
        </div>
    );
}

function SpecsTable(props) {
    let tablespecs = [];
    let tablevalues = [];
    let tablerows = [];

    let skuSpecs = props.sku[props.config["Excel Mapping"]["Attributes Object Name"]];

    //create arrays of table data
    for (let spec in skuSpecs) {
        tablespecs.push(spec)
        skuSpecs[spec] ? tablevalues.push(skuSpecs[spec]) : tablevalues.push("null")
    }

    let isOdd = tablespecs.length % 2 == 1;

    //console.log(isOdd);

    if (isOdd) {
        for (let i = 0; i < tablespecs.length - 1; i=i+2) {
            tablerows.push(
                <tr key={i}>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i]}}></td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i]}}></td>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i+1]}}></td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i+1]}}></td>
                </tr>
            );
        };
        tablerows.push(
            <tr key={"remaining"}>
                <td dangerouslySetInnerHTML={{__html: tablespecs[tablespecs.length-1]}}>
                </td>
                <td dangerouslySetInnerHTML={{__html: tablevalues[tablevalues.length-1]}}>
                </td>
            </tr>
        );
    } else {
        for (let i = 0; i <= tablespecs.length - 1; i=i+2) {
            tablerows.push(
                <tr key={i}>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i]}}>
                    </td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i]}}>
                    </td>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i+1]}}>
                    </td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i+1]}}>
                    </td>
                </tr>
            );
        }
    }  
    
    return (
        <div className="spec-section">
                <table>
                    <tbody>
                        {tablerows}
                    </tbody>
                </table>
        </div>
    );
}