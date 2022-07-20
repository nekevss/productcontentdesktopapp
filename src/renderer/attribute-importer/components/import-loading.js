import React from 'react';

export default function ImportLoading(props) {
    const [statusMessage, setStatusMessage] = React.useState(props.statusMessage);
    //const [loadWidths, setLoadWidths] = React.useState({loaded:0, notLoaded:0});
    const [containerStyle, setContainerStyle] = React.useState(()=>{
        return {
            height: "6em",
            width: props.width ? props.width : "25em",
        }
    })

    React.useEffect(()=>{
        //const loadBar = document.getElementById("import-load-bar")
        //const width = loadBar.getBoundingClientRect().width;
        //console.log(width);
        //console.log(props.percentage);
        //const _loadWidths = {
        //    loaded: width * props.percentage,
        //    notLoaded: width * (1-props.percentage)
        //}
        //setLoadWidths(_loadWidths)
        setStatusMessage(props.statusMessage)
    }, [props.percentage, props.statusMessage])

    /*
    <svg id="import-load-bar" width={"90%"} height="2em" style={{display: "block", margin: "0.5em auto 0"}}>
        <rect x={0} width={loadWidths.loaded} height="2em" style={{fill:"#cc0000"}} />
        <rect x={loadWidths.loaded} width ={loadWidths.notLoaded} height="2em" style={{fill:"lightgray"}} />
    </svg> 
    */

    return (
        <div className="import-loader-container" style={containerStyle}>
            <div dangerouslySetInnerHTML={{__html: statusMessage}} style={{width: "90%", margin:"0.5em auto"}} />
        </div>
    )
}