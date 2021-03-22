import React from 'react';
import '../../style/StyleGuideBuilder/SGForm.scss';

export default function SGForm(props) {
    const [sgType, setSgType] = React.useState("")
    const [sgClass, setSgClass] = React.useState("")

    React.useEffect(()=>{
        setSgType("simple")
        setSgClass("")
    }, [props.displaySGForm])


    const handleInputChange = (event) => {
        setSgType(event.target.value)
    }

    const handleTextChange = (event) =>{
        setSgClass(event.target.value)
    }

    const handleSubmit = (event) => {
        console.log("The new class is " + sgClass)
        console.log("The new SG Type is " + sgType)
    
        props.submitSGFormValues(sgClass, sgType)
        props.setOverlay("")
        setSgType('simple')
        setSgClass('')
        //enter call to main class here
    }

    return (
        <div className="sg-form-container" onClick={()=>{props.setOverlay("")}}>
            <form className="sg-form" onClick={(evt)=> evt.stopPropagation()}>
                <div className="input-container">
                    <div className="text-container">
                        <div>New Style Guide Class: </div>
                        <input type="text" id="new-sg-name" defaultValue={sgClass} onChange={handleTextChange} placeholder="Enter Class Here"></input>
                    </div>
                    <div className="select-container">
                        <div>New Style Guide Type: </div>
                        <select value={sgType} onChange={handleInputChange}>
                            <option value="simple">Simple Style Guide</option>
                            <option value="complex">Complex Style Guide</option>
                        </select>
                    </div>
                </div>
                <button onClick={()=>{handleSubmit()}}>Submit</button>
            </form>
        </div>
    )
}