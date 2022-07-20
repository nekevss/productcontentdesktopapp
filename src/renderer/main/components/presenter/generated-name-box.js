require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';

export default function GeneratedName(props) {
    const [generatorReturn, setGeneratorReturn] = React.useState("")
    const [checkResult, setCheckResult] = React.useState("");

    React.useEffect(()=>{
        if (props.sku && props.gen) {
            runRequest().then((response)=>{
                //set values based on response
                if (response.check) {
                    setCheckResult("Pass")
                } else {
                    setCheckResult("Failed")
                }

                setGeneratorReturn(response.name)
            }).catch((err)=>{if(err){console.log(err)}});
        } else {
            console.log("Current SKU or Generator is null");
        }
    }, [props.sku])
    
    const runRequest  = async() => {
        const request = {
            sku: props.sku,
            generator:props.gen,
            config: props.config
        };
        //send request to Main Process
        return await window.api.invoke("request-name", request);
    }

    return (
        <div className="gen-name-container">
            <div><b>Recommended SKU Name:</b></div>
            <div className="gen-name" dangerouslySetInnerHTML={{__html: generatorReturn}}></div>
            <div><b>Recommended Name Check:</b></div>
            <div dangerouslySetInnerHTML={{__html:checkResult}}></div> 
        </div>
        
    )
}