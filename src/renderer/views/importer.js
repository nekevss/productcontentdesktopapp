require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import BlankNavbar from './components/navbars/blankNav.js';
import ImportLoading from './components/importer/import-loading.js';
import './style/importer.scss';

export default function Importer(props) {
    const [isRunning, setIsRunning] = React.useState(false);
    const [percentage, setPercentage] = React.useState(0);
    const [message, setMessage]= React.useState("");

    React.useEffect(()=>{
        window.api.receive("import-status", (status)=>{
            setMessage(status);
        })

        window.api.receive("import-update", (perc)=>{
            console.log(perc)
            setPercentage(perc)
        })

        return ()=> {
            window.api.removeListener("import-status");
            window.api.removeListener("import-update");
        }
    }, [])

    return (
        <>
            <BlankNavbar />
            <div className="importer-container">
                <AttributionImporter setIsRunning={setIsRunning} />
            </div>
            <div style={{width:"90%", margin:"2em auto"}}>
                {isRunning
                ? <ImportLoading percentage={percentage} statusMessage={message} />
                : null
                }
            </div>    
        </>
    )
}

function AttributionImporter(props) {
    const [value, setValue] = React.useState("");

    const runImport = () => {
        if (value) {
            const importPackage = {
                type: "attribute",
                filePath: value
            }
            props.setIsRunning(true);
            window.api.invoke("run-import", importPackage);
        } else {
            window.api.alert("send-alert", "No file has been chosen! Please select a file to import.")
        }
    }

    const openDialog = async() => {
        const fileName = await window.api.invoke("open-file-dialog", "xlsx");
        console.log(fileName)
        if (fileName) {
            setValue(fileName)
        }
    }

    return (
        <div className="attribution-container">
            <h3>Attribution Import</h3>
            <div className="attribution-display">
                <div dangerouslySetInnerHTML={{__html: value ? value : "Please select an Excel file to import"}} />
                <button onClick={()=>{openDialog()}}>Select File</button>
            </div>
            <div className="buttons">
                <button onClick={()=>{runImport()}}>Import</button>
            </div>
        </div>
    )
}