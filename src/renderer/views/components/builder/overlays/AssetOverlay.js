import React from 'react';
import './style/AssetOverlay.scss';
import GenerateFormula from '../formula/GenerateFormula.js';


export default function AssetOverlay(props) {
    const [thisAsset, setThisAsset] = React.useState('');
    const [config, setThisConfig] = React.useState({});

    React.useEffect(()=>{
        fetchConfiguration().then(data=>setThisConfig(data)).then(err=>{if(err){console.log(err)}})        
    },[])

    React.useEffect(()=>{
        console.log("Oh cool, running Asset Overlay")
        setThisAsset(props.StyleGuide)
    }, [props.StyleGuide])

    const fetchConfiguration = async ()=>{
        return await window.api.invoke("fetch-configuration");
    }

    return (
        <div className="asset-overlay" onClick={()=>{props.setOverlay("")}}>
            <div className="asset-interface" onClick={(evt)=>{evt.stopPropagation()}}>
                <StyleGuideFormula {...props} config={config} asset={thisAsset} />
                <AssetJSON asset={thisAsset} />
            </div>
        </div>
    )
}

function AssetJSON(props) {
    const [stringifiedAsset, setStringifiedAsset] = React.useState('');

    React.useEffect(()=>{
        console.log("Made it to JSON Level")
        let StyleGuideString = JSON.stringify(props.asset);
        setStringifiedAsset(StyleGuideString);
    }, [props.asset])

    const handleCopy = () => {
        let jsonField = document.getElementById("jsonValue");
        let range = document.createRange();
        let clipboard = navigator.clipboard;
        
        range.selectNodeContents(jsonField);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        // Might not be handling this the best...but I think since
        // this is mostly being done in the framework we should be fine
        if (clipboard) {
            console.log("Clipboard is present");
            console.log(range);
            navigator.clipboard.writeText(range)
        }
        
        // The below is the other copy command
        //document.execCommand('copy');
        
        window.getSelection().removeAllRanges();
    }

    return (
        <div className="json-container">
            <div className="json-title"><h2>Raw Builder JSON</h2></div>
            <div className="json-body">
                <div id="jsonValue" className="json-value">{stringifiedAsset}</div>
            </div>
            <div className="json-button">
                <button onClick={()=>handleCopy()}>Copy</button>
            </div>
        </div>
    )
}

function StyleGuideFormula(props) {
    const [StyleGuideFormula, setStyleGuideFormula] = React.useState('');

    React.useEffect(()=>{
        // console.log("Made it to formula Generation level");
        let formula = "";
        console.log(props.config)

        if (props.asset && props.config) {
            // We now should know we are generating a formula, so let's create our context
            let formulaTypes = {};
            let context = {};
            // Carry over the Style Guide Builder Object and values from config
            context["Style Guide Builder"] = props.config["Style Guide Builder"];
            
            let configTypes = props.config["Formula Types"];
            for (const [key, value] of Object.entries(configTypes)) {
                // I'm only doing the below because I know there is only one space...
                // AKA YOLO LOL
                const [type, op] = key.split(" ");

                if (Object.keys(formulaTypes).includes(type)) {
                    formulaTypes[type][op] = value;
                } else {
                    formulaTypes[type] = {};
                    formulaTypes[type][op] = value;
                }
            }
            console.log("Here's the generated formula types");
            console.log(formulaTypes);

            context.formulaTypes = formulaTypes
            
            formula = GenerateFormula(context, props.asset);

            console.log("Logging formula being set");
            console.log(formula);
        }
        
        setStyleGuideFormula(formula);
        props.updateFormula(formula);
    }, [props.config])


    const handleCopy = () => {
        const formula = document.getElementById("formulaValue");
        const range = document.createRange();
        const clipboard = navigator.clipboard;

        range.selectNodeContents(formula);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        // Might not be handling this the best...but I think since
        // this is mostly being done in the framework we should be fine
        if (clipboard) {
            console.log("Clipboard is present");
            console.log(range);
            navigator.clipboard.writeText(range)
        }
        
        // The below is the other copy command
        //document.execCommand('copy');
        
        window.getSelection().removeAllRanges();
    }

    return (
        <div className="formula-container">
            <div className="formula-title"><h2>Builder Generated Formula</h2></div>
            <div className="formula-body">
                <div id="formulaValue" className="formula-value" dangerouslySetInnerHTML={{__html:StyleGuideFormula}}></div>
            </div>
            <div className="formula-button">
                <button onClick={()=>{handleCopy()}}>Copy</button>
            </div>
        </div>
    )
}