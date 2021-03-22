import React from 'react';
import '../../style/StyleGuideBuilder/sngCards.scss';


export function InitNodeCard(props) {

    return (
        <div className="start-node">
            <div className="start-node-class">
                <div>{"Class: " + props.activeClass}</div>
            </div>
            <div className="start-node-type">
                <div>{"Type: " + (props.activeType == 'simple'
                ? "Simple"
                : "Complex")}</div>
            </div>

        </div>
    )
}

export function DefaultGeneratorCard(props) {

    const openSG = () => {
        props.OpenInDisplay(props.index)
    }

    return (
        <div className="default-node">
            <div className="default-node-container">
                <div className="default-title"><p>Default Formula</p></div>
                <div className="default-controls">
                    <div className="f-x" onClick={()=>{openSG()}}><p>f(x)</p></div>
                </div>
            </div>
        </div>
    )
}

export function InputGeneratorCard(props) {
    const [nested, setNested] = React.useState(false)


    return (
        <div className="input-node">
            <InputForm {...props} />
        </div>
    )
}

function InputForm(props) {
    const [inputType, setInputType] = React.useState(props.myType);
    const [specValue, setSpecValue] = React.useState(props.mySpec);
    const [expectedValues, setExpectedValues] = React.useState(props.myValues)

    const handleInputType = (event) => {
        setInputType(event.target.value)
        //send value to top level here
    }

    const handleSpecChange = (event)=> {
        setSpecValue(event.target.value)
    }

    const handleExpectedValuesChange = (event)=> {
        setExpectedValues(event.target.value)
    }

    const openSG = () => {
        props.OpenInDisplay(props.index-1)
    }

    const saveValues = (event) => {
        console.log(`Recieved a request to save to top stack for index ${props.index}`);
        let _ifCalled =[];
        const regex = /\,/g
        if (regex.test(expectedValues)) {
            _ifCalled = expectedValues.split(regex);
        } else {
            _ifCalled.push(expectedValues);
        }
        
        const _newTopStackValue = {
            type: inputType,
            call: {
                callType: null,
                spec: specValue
            },
            ifCalled: _ifCalled
        };

        props.updateStack("topStack", props.index, _newTopStackValue)
    }

    return (
        <div className="input-form">
            <div className="inputs-columns">
                <div className="inputs-row">
                    <div>Type:</div>
                    <TypeSelection selectionType={inputType} handleSelectionChange={handleInputType} />
                </div>
                <div className="inputs-row">
                    <div>Spec:</div>
                    <input className="text-input" type="text" defaultValue={specValue} onChange={handleSpecChange} placeholder="" />
                </div>
                <div className="inputs-row">
                    <div>Value(s):</div>
                    <input className="text-input" type="text" defaultValue={expectedValues} onChange={handleExpectedValuesChange} placeholder="" />
                </div>
            </div>
            <TopLevelControls openSG={()=>{openSG()}} saveValues={()=>{saveValues()}} />
        </div>
    )
}


function nestedinput(props) {

    //create another InputGeneratorCard

    return (
        <div className="nested-condition">


        </div>
    )
}

function TypeSelection(props) {

    return (
        <select className="text-input" value={props.selectionType} onChange={props.handleSelectionChange}>
            <option value={"if"}>If</option>
            <option value={"else"}>Else</option>
            <option value={"ifNot"}>If Not</option>
            <option value={"includes"}>Includes</option>
            <option value={"equals"}>Equals</option>
            <option value={"notEquals"}>Not Equal</option>
        </select>
    )
}

function TopLevelControls(props) {
    return(
        <div className="input-controls">
            <div className="f-x" onClick={()=>{props.openSG()}}><p>f(x)</p></div>
            <div className="save-staple" onClick={()=>{props.saveValues()}}><img src="./assets/StapleSave.png"></img></div>
        </div>
    )
}