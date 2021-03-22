import React from 'react';
import '../../style/StyleGuideBuilder/RenameOverlay.scss';

export default function RenameOverlay(props) {
    const [renameValue, setRenameValue] = React.useState('');

    const handleChange = (event) =>{
        setRenameValue(event.target.value);
    }
    
    const handleRename = () => {
        props.renameStyleGuide(renameValue)
    }

    return (
        <div className="rename-overlay" onClick={()=>{props.setOverlay("")}}>
            <div className="rename-interface" onClick={(evt)=>{evt.stopPropagation()}}>
                <div className="element-container">
                    <input type="text" value={renameValue} onChange={handleChange} placeholder="Enter new class name" />
                    <button onClick={()=>handleRename()}>Rename</button>
                </div>
            </div>
        </div>
    )
}