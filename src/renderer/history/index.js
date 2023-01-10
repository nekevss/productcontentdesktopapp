require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import HistoryNode from './components/node';
import HistoryNavbar from './components/navbar';
import './style/history.scss';

export default function HistoryDisplay(props) {
    const [nodeData, setNodeData] = React.useState([]);

    React.useEffect(()=>{
        runDisplay()
    }, [])

    const runDisplay = () => {
        console.log("Fetch node data to display history")
        window.api.invoke("request-cache-data").then((data)=>{
            console.log(data)
            setNodeData(data)
        }).catch((err)=>{if(err){console.log(err)}})
    }

    const clearHistory = () => {
        window.api.invoke("nuke-history").then((response)=>{
            console.log(response)
            if (response === "nuked") {
                setNodeData([]);
            } else {
                window.api.message("post-message", "Files were not deleted");
            }
        })
    } 

    return (
        <>
            <HistoryNavbar clearHistory={()=>clearHistory()} />
            <div className="history-container">
                {nodeData.length > 0
                ? nodeData.map((value, index)=>{
                    return <HistoryNode key={"history-node-"+index} node={value} run={runDisplay} />
                })
                : null}
            </div>
        </>

    )
}

