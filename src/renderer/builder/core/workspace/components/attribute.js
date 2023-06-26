import React from 'react';
import '../buildspace.scss';

export default function AttributeCard(props) {
    const [StyleGuide, setStyleGuide] = React.useState(props.styleGuide);
    const [specValue, setSpecValue] = React.useState(props.styleGuide.spec);
    const [endString, setEndString] = React.useState(props.styleGuide.endString);
    const [leadString, setLeadString] = React.useState(props.styleGuide.leadString);
    const [report, setReport] = React.useState(props.styleGuide.report)
    const [postType, setPostType] = React.useState(props.styleGuide.postType);

    React.useEffect(()=>{
        setStyleGuide(props.styleGuide);
        setSpecValue(props.styleGuide.spec)
        setLeadString(props.styleGuide.leadString);
        setEndString(props.styleGuide.endString)
        setReport(props.styleGuide.report)
    }, [props.styleGuide])

    const handleSpec = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["spec"] = event.target.value;
        setSpecValue(event.target.value);
        props.updateValidationState("none")
    }

    const handleString = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["endString"] = event.target.value;
        setEndString(event.target.value);
        props.updateValidationState("none")
    }

    const handleLead = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["leadString"] = event.target.value;
        setLeadString(event.target.value);
        props.updateValidationState("none")
    }

    const handleReport = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["report"] = event.target.checked;
        setReport(event.target.checked);
    }

    const handlePostType = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide["postType"] = event.target.checked;
        setPostType(event.target.checked);
    }

    const remove = () => {
        props.remove(props.index)
    }

    return (
        <div className="spec-container">
            <div className="inputs-section">
                <div className="input-row">
                    <div className="input-title">Attribute:</div>
                    <input onChange={handleSpec} value={specValue} type="text" placeholder="Enter attribute here" />
                </div>
                <div className="input-row">
                    <div className="string-title">Lead String:</div>
                    <input onChange={handleLead} value={leadString} type="text" placeholder="(Optional) Enter leading string" />
                </div>
                <div className="input-row">
                    <div className="string-title">Sub String:</div>
                    <input onChange={handleString} value={endString} type="text" placeholder="(Optional) Enter subsequent string" />
                </div>
            </div>
            <div className="button-section">
                <button onClick={()=>{remove()}}>Remove</button>
                <div className="toggle-inputs">
                    <div>
                        <div>Post-Type:</div>
                        <input type="checkbox" onChange={handlePostType} checked={postType}/> 
                    </div>
                    <div>
                        <div>Mandatory:</div>
                        <input type="checkbox" onChange={handleReport} checked={report}/> 
                    </div>
                </div>
            </div>
        </div>
    )
}