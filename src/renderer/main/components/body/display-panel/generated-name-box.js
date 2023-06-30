require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';

export default function GeneratedName(props) {
    const [generatorReturn, setGeneratorReturn] = React.useState("")
    const [checkResult, setCheckResult] = React.useState("");
    const [confidenceLevel, setConfidenceLevel] = React.useState("")

    React.useEffect(()=>{
        if (props.sku && props.gen) {
            let request = {
                sku: props.sku,
                generator:props.gen,
                config: props.config
            };

            // send request to Main Process
            window.api.invoke("request-name", request)
                .then((response)=>{
                    console.log("Logging generated name report")
                    console.log(response)
                    // set values based on response
                    if (response.check) {
                        setCheckResult("Pass")
                    } else {
                        setCheckResult("Failed")
                    }

                    let confidenceLevel = response.confidenceGrade === 0 ? 0 + "%" : response.confidenceGrade + "%";

                    setConfidenceLevel(confidenceLevel)
                    setGeneratorReturn(response.name)
                })
                .catch((err)=>{if(err){console.log(err)}});
        } else {
            console.log("Current SKU or Generator is null");
        }
    }, [props.sku])
    
    return (
        <div className="gen-name-container">
            <div><b>Recommended SKU Name:</b></div>
            <div className="gen-name" dangerouslySetInnerHTML={{__html: generatorReturn}}></div>
            <div><b>Recommended Name Check:</b></div>
            <div dangerouslySetInnerHTML={{__html:checkResult + " with a score of " + confidenceLevel}}></div>
        </div>
        
    )
}