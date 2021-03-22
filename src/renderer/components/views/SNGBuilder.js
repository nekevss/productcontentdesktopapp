require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import SngControls from '../SGBuilder/SngControls.js';
import SngWorkspace from '../SGBuilder/SngWorkspace.js';
import BlankNavbar from '../navbars/blankNav.js';
import ValidationOverlay from '../SGBuilder/ValidationOverlay.js';
import ImportOverlay from '../SGBuilder/importOverlay.js';
import AssetOverlay from '../SGBuilder/AssetOverlay.js';
import RenameOverlay from '../SGBuilder/RenameOverlay.js';
import SGForm from '../SGBuilder/SGForm.js';
import '../../style/views/SNGBuilder.scss';

//NOTE: I am worried about improperly managing the state throughout the Style Guide Builder.
// This all being said, the current implementation does function, and so far no major issues 
// have been found. --> maybe integrate redux or something of the sort

export default class SNGBuilder extends React.Component {
    constructor() {
        super()
        let saved = JSON.parse(localStorage.getItem("savedStyleGuide")) 
        console.log(JSON.parse(null));
        this.activeClass = saved ? saved.class : "";
        this.activeType = saved ? saved.type: "";
        this.initialState = saved ? {
            overlay: "",
            active: true,
            validationStatus: "none",
            StyleGuide: saved,
            formula: ""
        } : {
            overlay : "",
            active : false,
            validationStatus: "none",
            StyleGuide : {},
            formula: ""
        }
        console.log(this.initialState)
        
        this.state = {
            overlay : this.initialState.overlay,
            active : this.initialState.active,
            validationStatus: this.initialState.validationState,
            StyleGuide : this.initialState.StyleGuide,
            formula: this.initialState.formula
        }

        //do the below really need to bind this? might not be best practice
        this.updateStyleGuide = this.updateStyleGuide.bind(this);
        this.toggleActive = this.toggleActive.bind(this);
        this.reset = this.reset.bind(this);
        this.import = this.import.bind(this);
        this.export = this.export.bind(this);
        this.setOverlay = this.setOverlay.bind(this);
        this.submitSGFormValues = this.submitSGFormValues.bind(this);
        this.updateValidationState = this.updateValidationState.bind(this);
        this.updateFormula = this.updateFormula.bind(this);
        this.renameStyleGuide = this.renameStyleGuide.bind(this);
    }

    setOverlay(requestedOverlay) {
        console.log(`Recieved a request to display a form with value: ${requestedOverlay}`)
        console.log("Here's the new state after updating the overlay:")
        this.setState((prevState)=>{
            return {
                overlay : requestedOverlay,
                active: prevState.active,
                validationState: prevState.validationState,
                StyleGuide : prevState.StyleGuide,
                formula: prevState.formula
            }
        }, ()=>{console.log(this.state)})
    }

    toggleActive() {
        console.log("Turning on workspace")
        this.setState((prevState) =>{
            console.log("Here's the toggle active prevState")
            console.log(prevState)
            return {
                overlay : prevState.overlay,
                active: !prevState.active,
                validationState: prevState.validationState,
                StyleGuide : prevState.StyleGuide,
                formula: ""
            }
        }, ()=> {
            if (this.state.active && this.state.overlay=="submit-form") {
                console.log("Setting overlay from toggleActive callback")
                this.setOverlay("")
            }   
        })
        
    }

    import(importedData) {
        console.log("Recieved imported data to import to state");
        let previousActive;

        this.setState((prevState)=> {
            previousActive = prevState.active;
            return {
                overlay: prevState.overlay,
                active: prevState.active,
                validationState: "none",
                StyleGuide: importedData,
                formula: ""
            }
        })
        this.activeClass = importedData.class;
        this.activeType = importedData.type;
        if (!previousActive) {
            this.toggleActive()
        }
    }

    export(exportType) {
        //TODO: build out
        if (exportType == "formula" || exportType == "all") {
            let formulaBundle = {class:this.activeClass, formula: this.state.formula}
            window.api.invoke("update-formula", formulaBundle)
        }
        if (exportType == "builder" || exportType == "all") {
            window.api.invoke("export-sng-package", this.state.StyleGuide)
        }
    }

    reset() {
        console.log("Turning off workspace and reseting")
        this.setState((prevState) =>{
            return {
                overlay: "",
                active: false,
                validationState: "none",
                StyleGuide : {},
                formula: ""
            }
        })
        localStorage.removeItem("savedStyleGuide");
        this.activeClass = "";
        this.activeType = "";

        console.log("Reset is complete")
    }

    submitSGFormValues(thisClass, thisType) {
        console.log(`Submitting values ${thisClass} and ${thisType}`)
        if (thisType == "simple") {
            this.updateStyleGuide({
                "class": thisClass,
                "type": thisType,
                "returnGenerator" : [{
                    type : "else",
                    thenReturn: []
                }]
            })
        } else {
            this.updateStyleGuide({
                "class": thisClass,
                "type": thisType,
                "returnGenerator" : [{
                    type : "if",
                    spec: "",
                    ifCalled: [""],
                    nestedType: "",
                    nestedConditions: []
                }]
            })
        }
        this.activeClass = thisClass;
        this.activeType = thisType;
        this.toggleActive()
    }

    async renameStyleGuide(newClassName) {
        let _currentStyleGuide = this.state.StyleGuide;
        const prevName = _currentStyleGuide.class;
        const updatePackage = {
            previousName:prevName,
            newName: newClassName
        }
        let mainConfirmation = await window.api.invoke("rename-style-guide", updatePackage);
        
        if (mainConfirmation == "complete") {
            this.activeClass = newClassName
            _currentStyleGuide.class = newClassName
            this.setState((prevState)=>{
                return {
                    overlay: prevState.overlay,
                    active: prevState.active,
                    validationState: "",
                    StyleGuide : _currentStyleGuide,
                    formula: ""
                }
            })
        } else {
            window.api.message("post-message", "Class name has not been changed.")
        }
    }

    updateStyleGuide(newValue) {
        this.setState((prevState)=> {
            return {
                overlay: prevState.overlay,
                active: prevState.active,
                validationState: prevState.validationState,
                StyleGuide : newValue,
                formula: ""
            }
        })
    }

    updateValidationState(newState) {
        this.setState((prevState)=>{
            return {
                overlay: prevState.overlay,
                active: prevState.active,
                validationState: newState,
                StyleGuide : prevState.StyleGuide,
                formula: prevState.formula
            }
        })
    }

    updateFormula(newFormula) {
        this.setState((prevState)=>{
            return {
                overlay: prevState.overlay,
                active: prevState.active,
                validationState: prevState.validationState,
                StyleGuide : prevState.StyleGuide,
                formula: newFormula
            }
        })
    }

    renderOverlay(overlay) {
        switch(overlay) {
            case "submit-form":
                return (
                    <SGForm {...this.state}
                        submitSGFormValues={(thisClass, thisType) => this.submitSGFormValues(thisClass, thisType)}
                        toggleActive={()=> {this.toggleActive()}}
                        setOverlay={(v)=>{this.setOverlay(v)}} />
                )
            case "validation-overlay":
                return (
                    <ValidationOverlay {...this.state} 
                        setOverlay={(v)=>{this.setOverlay(v)}}
                        updateValidationState={(v)=>{this.updateValidationState(v)}}
                        />
                )
            case "import-overlay":
                return (
                    <ImportOverlay {...this.state}
                        setOverlay={(v)=>{this.setOverlay(v)}}
                        import={(i)=>{this.import(i)}}
                        />
                )
            case "asset-overlay":
                return (
                    <AssetOverlay {...this.state}
                        updateFormula= {(v)=>{this.updateFormula(v)}}
                        setOverlay={(v)=>{this.setOverlay(v)}}
                        import={(i)=>{this.import(i)}}
                        />
                )
            case "rename-overlay":
                return (
                    <RenameOverlay {...this.state} 
                        renameStyleGuide={(i)=>this.renameStyleGuide(i)}
                        setOverlay={(v)=>{this.setOverlay(v)}}
                    />
                )
            default:
                return null;
        }
    }

    //should the nav bar be removed?
    render() {
        return (
            <div className="sng-builder-view">
                <BlankNavbar />
                <div className= "sng-container">
                    {this.renderOverlay(this.state.overlay)}
                    <SngControls {...this.state}
                        updateFormula= {(v)=>{this.updateFormula(v)}}
                        updateStyleGuide={(v)=>{this.updateStyleGuide(v)}}
                        setOverlay={(v)=>{this.setOverlay(v)}}
                        export={(v)=>this.export(v)}
                        reset={()=>{this.reset()}}
                        />
                    <SngWorkspace {...this.state}
                        updateValidationState={(v)=>{this.updateValidationState(v)}}
                        updateStyleGuide={(v)=>{this.updateStyleGuide(v)}}
                        activeClass={this.activeClass}
                        activeType={this.activeType} 
                        />
                </div>
            </div>
        );
    }
}