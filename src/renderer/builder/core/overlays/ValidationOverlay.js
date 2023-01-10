import React from 'react';
import './style/SGValidation.scss';

export default function ValidationOverlay(props) {
    const [validationLog, setValidationLog] = React.useState([]);
    const [errorLog, setErrorLog] = React.useState([]);
    const [errorCount, setErrorCount] = React.useState(0);
    const [validationCount, setValidationCount] = React.useState(0);

    React.useEffect(()=>{
        runValidation(props.StyleGuide);    
    }, [])

    React.useEffect(()=>{
        runValidation(props.StyleGuide);    
    }, [props.StyleGuide])

    const runValidation = (builder) => {
        window.api.invoke("validate-builder", builder).then((results)=>{
            console.log(results);
            createValidationDisplay(results.validationLog);
            createErrorDisplay(results.errorLog);
            setErrorCount(results.totalErrors);
            setValidationCount(results.validationLog.length);
            if (results.fatalErrors == 0) {
                console.log("Validation State updated to Passed")
                props.updateValidationState("Passed");
            } else {
                console.log("Validation State updated to Failed");
                props.updateValidationState("Failed");
            }
        });
    }

    const createValidationDisplay = (logs) => {
        let validationLogs = [];

        logs.forEach((value, index)=>{
            validationLogs.push(<tr key ={"log-entry-"+index}><td>{value}</td></tr>)
        })

        setValidationLog(validationLogs)
    }

    const createErrorDisplay = (logs) =>{
        let errorLogs = [];

        logs.forEach((value, index)=>{
            errorLogs.push(<tr key ={"err-log-entry-"+index}><td>{value}</td></tr>)
        })

        setErrorLog(errorLogs)
    }

    return (
        <div className="validation-overlay" onClick={()=>{props.setOverlay("")}}>
            <div className="validation-interface" onClick={(evt)=>{evt.stopPropagation()}}>
                <div className="result-container">
                    {errorCount == 0 
                    ? "Validation Complete! No Errors were found!"
                    : `Validation Complete! There were ${errorCount} errors found. Please see the error log.`}
                </div>
                {errorCount !== 0
                ?<div className="error-log">
                    <table>
                        <tbody><tr><th>Error Log</th></tr>{errorLog}</tbody>
                    </table>
                </div>
                :null}
                {validationCount !== 0
                ?<div className="validation-log">
                    <table>
                        <tbody><tr><th>Validation Log</th></tr>{validationLog}</tbody>
                    </table>
                </div>
                :null}
            </div>
        </div>
    )
}