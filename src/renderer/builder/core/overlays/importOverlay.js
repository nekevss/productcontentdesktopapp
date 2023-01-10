require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import SuggestSearchBar from '../../../search/SuggestSearchBar.js'
import './style/ImportOverlay.scss';


export default function ImportOverlay(props) {
    const [classIndex, setClassIndex] = React.useState([])

    React.useEffect(()=>{
        window.api.invoke("fetch-class-index").then(data=>setClassIndex(data)).catch(err=>{if (err){console.log(err)}})
    }, [])

    const runImport = async (thisClass) => {
        console.log("Running style guide import...")
        const importedPackage = await window.api.invoke('request-class-data', thisClass);

        console.log("The returned import package is:")
        console.log(importedPackage)

        if (importedPackage) {
            props.import(importedPackage);
            props.setOverlay("");
        } else {
            window.api.alert('send-alert', "The requested style guide does not appear to exist.");
        }
    }

    const handleSearch = (searchValue) => {
        runImport(searchValue)
    }

    return (
        <div className="import-overlay" onClick={()=>{props.setOverlay("")}}>
            <div className="import-interface" onClick={(evt)=>{evt.stopPropagation()}}>
                <SuggestSearchBar 
                    placeholder={"Enter class to import"}
                    button={"Import"}
                    search={(v)=>handleSearch(v)}
                    index={classIndex}
                />
            </div>
        </div>
    )
}

/*
<div className="input-section">
    <div>Class Name:</div>
    <input type="text" value={thisClass} onChange={handleTextChange} onKeyUp={handleKeyUp} placeholder="Enter class to import" />
</div>
<div className="button-section">
    <button onClick={()=>{runImport()}}>Import</button>
</div>
*/