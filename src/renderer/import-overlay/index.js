require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import './style/import-overlay.scss'

export default function ImportOverlay(props) {
    const [importName, setImportName] = React.useState('');

    const openDialog = async() => {
        const fileName = await window.api.invoke("open-file-dialog", "xlsm");
        console.log(fileName)
        if (fileName) {
            setImportName(fileName)
        }
    }

    const runQuickImport = () => {
        const importPackage = {
            type: "sku-data",
            filePath: "default"
        }
        window.api.invoke("run-import", importPackage).then((data)=>{
            if (data === "finished") {
                let updateValue = {
                    overlay: "",
                    reload: true
                }
                props.updateReloadAndOverlay(updateValue)
            }
        });
    }

    const runImport = () => {
        if (importName) {
            const importPackage = {
                type: "sku-data",
                filePath: importName
            }
            window.api.invoke("run-import", importPackage).then((data)=>{
                if (data !== "finished") {
                    window.api.alert("send-alert", "There was an issue when importing the sheeet. Please try again")
                } else {
                    let updateValue = {
                        overlay: "",
                        reload: true
                    }
                    props.updateReloadAndOverlay(updateValue)
                }
            });
        } else {
            window.api.alert("send-alert", "No file has been chosen! Please select a file to import.")
        }
    }

    return (
        <div className='global-importer' onClick={(evt)=>{evt.stopPropagation()}}>
            <div className="import-container">
                <h3>Smartsheet Import</h3>
                <div className="sheet-display">
                    <div dangerouslySetInnerHTML={{__html: importName ? importName : "Please select a Smartsheet to import"}} />
                    <button onClick={()=>{openDialog()}}>Select File</button>
                </div>
                <div className="buttons">
                    <button onClick={()=>{runQuickImport()}}>Quick Import</button>
                    <button onClick={()=>{runImport()}}>Import Selected</button>
                </div>
            </div>
        </div>
    )
}