import React from 'react';
import '../buildspace.scss';

export default function StaticString(props) {
    const [StyleGuide, setStyleGuide] = React.useState(props.styleGuide);
    const [thisInput, setThisInput] = React.useState(props.styleGuide.string);

    React.useEffect(()=>{
        setStyleGuide(props.styleGuide);
        setThisInput(props.styleGuide.string)
    }, [props.styleGuide])

    const handleChange = (event) => {
        let _styleGuide = StyleGuide;
        _styleGuide.string = event.target.value;
        setThisInput(event.target.value);
        props.updateValidationState("none")
    }

    const remove = () => {
        props.remove(props.index)
    }

    return (
        <div className="string-container">
            <div className="input-section">
                <div className="input-row">
                    <div>Static String:</div>
                    <input type="text" value={thisInput} onChange={handleChange} placeholder="Enter string here" />
                </div>
            </div>
            <div className="button-section">
                <button onClick={()=>{remove()}}>Remove</button>
            </div>
        </div>
    )
}