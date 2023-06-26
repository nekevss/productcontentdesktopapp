import React from 'react';
import './style/AssetOverlay.scss';


export default function AssetOverlay(props) {
    const [thisAsset, setThisAsset] = React.useState('');

    React.useEffect(()=>{
        setThisAsset(props.StyleGuide)
    },[])

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
        // console.log(props.config)
        if (props.asset) {
            window.api.invoke("request-formula", props.asset)
                .then((formula)=>{
                    setStyleGuideFormula(formula)
                    props.updateFormula(formula)
                })
        } else {
            setStyleGuideFormula("");
            props.updateFormula("");
        }
    }, [props.asset])


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