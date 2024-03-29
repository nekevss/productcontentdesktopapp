import React from 'react';
import './style/BuilderControls.scss';

export default function BuilderControls(props) {
    
    const assetImport = () => {
        if (props.active) {
            window.api.alert("send-alert","Workspace currently active. Please reset prior to importing new asset.")
        } else {
            props.setOverlay("import-overlay")
        }
    }

    const createBlank = () => {
        if (props.active) {
            window.api.alert("send-alert","Workspace currently active. Please reset prior to creating blank template.")
        } else {
            props.setOverlay("submit-form")
        }
    }

    const validate = () => {
        console.log("Opening validation overlay")
        let StyleGuide = props.StyleGuide;

        if (StyleGuide.class && StyleGuide.type) {
            props.setOverlay("validation-overlay");
        } else {
            window.api.alert("send-alert", "There does not appear to be a Style Guide to validate!")
        }
    }

    const runExport = (exportType) => {
        if (props.validationState == "Passed") {
            if (exportType == "formula" || exportType == "all") {
                if (props.formula === "") {
                    window.api.invoke("request-formula", props.styleGuide)
                        .then((formula)=>{props.updateFormula(formula)})
                } 
            }
            setTimeout(props.export(exportType), 500);
            props.setOverlay("");
        
        } else if (props.validationState == "Failed") {
            window.api.alert("send-alert", "Failed validation status detected! Please fix fatal errors and revalidate Style Guide.")
        } else {
            window.api.message("post-message", "Please validate Style Guide before exporting.")
        }
    }

    const exposeAssets = () => {
        if (props.validationState == "Passed") {
            props.setOverlay("asset-overlay");
        } else if (props.validationState == "Failed") {
            window.api.alert("send-alert", "Failed validation status detected! Please fix fatal errors and revalidate Style Guide.")
        } else {
            window.api.message("post-message", "Please validate Style Guide before accessing exposed assets.")
        }
    }

    const deleteCurrentStyleGuide = () => {
        console.log("Logging style guide prior to deleting.")
        console.log(props.StyleGuide);
        window.api.invoke("delete-style-guide", props.StyleGuide);
    }

    const rename = () => {
        if (!props.active) {
            window.api.alert("send-alert","There is no active style guide to rename.")
        } else {
            console.log("Open Rename Overlay")
            props.setOverlay("rename-overlay")
        }
    }

    return (
        <div className="controls-container">
            <div className="workspace-controls">
                <div className="state-controls">
                    <div className="import-sg" onClick={()=>{assetImport()}}><p>Stage Asset</p></div>
                    <div className="create-new" onClick={()=>{createBlank()}}><p>New Style Guide</p></div>
                    <div className="reset" onClick={()=>{props.reset()}}><p>Clear Builder</p></div>
                </div>
                <div className="validation-controls">
                    <div className="" onClick={()=>{validate()}}><p>Run Validation</p></div>
                    <div className="" onClick={()=>{exposeAssets()}}><p>Expose Assets</p></div>
                </div>
                <div className='sandbox-export-controls'>
                    <div className="" onClick={()=>{runExport("builder")}}><p>Commit Builder</p></div>
                    <div className="" onClick={()=>{runExport("formula")}}><p>Commit Formula</p></div>
                    <div className="" onClick={()=>{runExport("all")}}><p>Commit Assets</p></div>
                </div>
                <div className="high-level-controls">
                    <div className="convert" onClick={()=>{props.convertStyleGuideType()}}><p>Convert Type</p></div>
                </div>
                <div className="secondary-controls">
                    <div className="rename" onClick={()=>{rename()}}><p>Rename Style Guide</p></div>
                </div>
                <div className="fifth-controls">
                    <div className="delete" onClick={()=>{deleteCurrentStyleGuide()}}><p>Delete Current Style Guide</p></div>
                </div>
            </div>
        </div>
    )
}