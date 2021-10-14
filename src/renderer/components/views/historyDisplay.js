require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import BlankNavbar from '../navbars/blankNav.js';
import './style/history.scss';

export default function HistoryDisplay(props) {
    const [nodeData, setNodeData] = React.useState([]);

    React.useEffect(()=>{
        runDisplay()
    }, [])

    const runDisplay = () => {
        loadFileData().then((data)=>{
            console.log(data)
            setNodeData(data)
        }).catch((err)=>{if(err){console.log(err)}})
    }

    const loadFileData = async() => {
        return await window.api.invoke("request-cache-data");
    }

    return (
        <div className="history-container">
            <BlankNavbar />
            <div className="history-display">
                {nodeData.length > 0
                ? nodeData.map((value, index)=>{
                    return <HistoryNode key={"history-node-"+index} node={value} run={runDisplay} />
                })
                : null}
            </div>
        </div>
    )
}

function HistoryNode(props) {
    //cards are static. Don't need useEffect -> just hard code

    const handleSelection = () => {
        window.api.message("set-history-state", props.node)
    }

    const handleDelete = () => {
        window.api.invoke("delete-cache-item", props.node).then((res)=>{
            props.run()
        }).catch((err)=>{
            if (err) {console.log(err)}
        })
    }

    return (
        <div className="history-node">
            <div className="data-section">
                <div dangerouslySetInnerHTML={{__html: "Name: " + props.node.fileName}} />
                <div dangerouslySetInnerHTML={{__html: "Time: " + props.node.time}} />
                <div dangerouslySetInnerHTML={{__html: "Sku Count: " + props.node.length}} />
            </div>
            <div className="buttons">
                <button onClick={()=>{handleSelection()}}>Select</button>
                <button onClick={()=>{handleDelete()}}>Delete</button>
            </div>
        </div>
    )
}