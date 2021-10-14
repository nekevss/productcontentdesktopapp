import React from 'react';
import './style/AssetOverlay.scss';
import GenerateFormula from '../utils/GenerateFormula.js';


export default function AssetOverlay(props) {
    const [thisAsset, setThisAsset] = React.useState('');

    React.useEffect(()=>{
        console.log("Oh cool, running Asset Overlay")
        setThisAsset(props.StyleGuide)
    }, [props.StyleGuide])

    return (
        <div className="asset-overlay" onClick={()=>{props.setOverlay("")}}>
            <div className="asset-interface" onClick={(evt)=>{evt.stopPropagation()}}>
                <StyleGuideFormula {...props} asset={thisAsset} />
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
        range.selectNodeContents(jsonField);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    }

    return (
        <div className="json-container">
            <div className="json-title"><h2>Raw SNG JSON</h2></div>
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
        console.log("Made it to formula Generation level");
        let formula = GenerateFormula(props.asset);

        console.log("Logging formula being set");
        console.log(formula)
        
        setStyleGuideFormula(formula);
        props.updateFormula(formula);
    }, [props.asset])


    const handleCopy = () => {
        let formula = document.getElementById("formulaValue");
        let range = document.createRange();
        range.selectNodeContents(formula);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    }

    return (
        <div className="formula-container">
            <div className="formula-title"><h2>Style Guide Formula</h2></div>
            <div className="formula-body">
                <div id="formulaValue" className="formula-value" dangerouslySetInnerHTML={{__html:StyleGuideFormula}}></div>
            </div>
            <div className="formula-button">
                <button onClick={()=>{handleCopy()}}>Copy</button>
            </div>
        </div>
    )
}