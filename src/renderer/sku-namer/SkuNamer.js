require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import ReactLoading from 'react-loading';
import BlankNavbar from '../navbars/blankNav.js';
import './style/SkuNamer.scss';

export default function BulkSkuNamer(props) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isRan, setIsRan] = React.useState(false);
    const [displayReport, setDisplayReport] = React.useState(false);
    const [firstTable, setFirstTable] = React.useState([]);
    const [secondTable, setSecondTable] = React.useState([]);
    const [attributeReport, setAttributeReport] = React.useState({});

    React.useEffect(()=>{
        window.api.receive("sku-namer-batch", (batchData)=>{
            console.log("Got a batch sent from the main process!")
            let batchArray = JSON.parse(batchData)
            console.log("Here's the batch")
            console.log(batchArray);
            runSkuBuilder(batchArray);
        })
        window.api.receive("sku-namer-finished", (report)=>{
            setAttributeReport(report);
            console.log("The bulk sku namer is finished running!")
            window.api.invoke("register-report", report);
            setIsLoading(false);
        })
        
        return ()=> {
            window.api.removeListener("sku-namer-batch");
            window.api.removeListener("sku-namer-finished");
        }
    }, [])

    const runSkuBuilder = (batchData) => {
        let firstTableValues = firstTable;
        let secondTableValues = secondTable;

        if (firstTableValues.length == 0) {
            firstTableValues.push(<tr key={"first-table-hrow"}><th key={"P-ID-header"}>Pyramid ID</th><th key={"class-header"}>Class</th></tr>)
            secondTableValues.push(<tr key={"second-table-hrow"}><th key={"gen-name-header"}>Generated Name</th><th key={"pass-fail-header"}>Pass/Fail</th></tr>)
        }

        let batchStartIndex = firstTableValues.length

        let counter = 0;
        batchData.forEach((value, index, array) => {
            //console.log("Here's the value from the Bulk Data Set");
            //console.log(value);
            let batchIndex = batchStartIndex + index;
            firstTableValues.push(
                <tr key={"first-table-"+batchIndex}>
                    <td key={"PyramidId"+batchIndex} dangerouslySetInnerHTML={{__html:value.pyramidId}}></td>
                    <td key={"Class"+batchIndex} dangerouslySetInnerHTML={{__html:value.skuClass}}></td>
                </tr>
            );
            let checkResult = value.check ? "Pass" : "Fail";
            secondTableValues.push(
                <tr key={"second-table-"+batchIndex}>
                    <td key={"GeneratedName"+batchIndex} dangerouslySetInnerHTML={{__html:value.generatedName}}></td>
                    <td key={"Report"+batchIndex} dangerouslySetInnerHTML={{__html:checkResult}}></td>
                </tr>
            );

            counter++;
            if (counter == array.length) {
                //ending load animation was here
            }
        })
        
        setFirstTable(firstTableValues);
        setSecondTable(secondTableValues);
        
    }

    const RunNamer = () => {
        setIsLoading(true);
        window.api.invoke("run-sku-namer")
        setIsRan(true);
    }

    const toggleReportDisplay = () => {
        if (!isRan && !displayReport) {
            window.api.alert("send-alert", "The report is unavailable! Please run bulk namer to access report.")
        } else {
            setDisplayReport(!displayReport);
        }
    }

    const CopyValues = () => {
        if (isRan) {
            let el = document.getElementById("results-table")
            let clipboard = navigator.clipboard;
            let body = document.body;
            let range;
            let selection;

            if (document.createRange && window.getSelection) {
                range = document.createRange();
                selection = window.getSelection();
                selection.removeAllRanges();
                try {
                    range.selectNodeContents(el)
                    //console.log("Running 1")
                    selection.addRange(range);
                } catch (e) {
                    console.log("Running 2")
                    //range.selectNode(el);
                    selection.addRange(range);
                }
                        
                // Might not be handling this the best...but I think since
                // this is mostly being done in the framework we should be fine
                if (clipboard) {
                    console.log("Clipboard is present");
                    console.log(range);
                    navigator.clipboard.writeText(selection)
                }
                
                // The below is the other copy command
                //document.execCommand('copy');    
            } else if (body.createTextRange) {
                //console.log("Running 3")
                range = body.createTextRange();
                range.moveToElementText(el);
                range.select();
                
                // Might not be handling this the best...but I think since
                // this is mostly being done in the framework we should be fine
                if (clipboard) {
                    console.log("Clipboard is present");
                    console.log(range);
                    navigator.clipboard.writeText(range)
                }
                
                // The below is the other copy command
                //document.execCommand('copy');  
            }
        } else {
            window.api.alert("send-alert", "There are no values to copy! Please run bulk namer to copy values.")
        }
    }

    return (
        <div className="bulk-sku-namer">
            <BlankNavbar />
            <div className="central-container">
                {isLoading
                ? <div className="load-container">
                    <ReactLoading className="react-loader" type={"bars"} color={"gray"} width={"12em"} height={"12em"} />
                </div>
                :!isRan
                ? <div className="load-container"><h1>Welcome to the Bulk Sku Namer! Press run to create names for the current SKU set.</h1></div>
                : displayReport
                ? <AttributeReportDisplay report={attributeReport} />
                :<div className="tables-container">
                    <div className="first-table">
                        <table>
                            <tbody>
                                {firstTable}
                            </tbody>
                        </table>
                    </div>
                    <div id={"results-table"} className="second-table">
                        <table>
                            <tbody>
                                {secondTable}
                            </tbody>
                        </table>
                    </div>
                </div>}
            </div>
            <div className={displayReport? "controls-panel report" : "controls-panel normal"} >
                <div title="Run the builder on loaded sku set" className="run" onClick={()=>RunNamer()}><div>Run</div></div>
                <div title="Open attribute level report" onClick={()=>{toggleReportDisplay()}} className="report">{!displayReport?<div>View Report</div>:<div>Close Report</div>}</div>
                <div title="Copy generated sku name and report values" onClick={()=>{CopyValues()}} className="copy"><div>Copy Results</div></div>
            </div>
        </div>
    )
}


function AttributeReportDisplay(props) {
    const [reportStack, setReportStack] = React.useState([]);
    const [tableRows, setTableRows] = React.useState([]);
    const [validReport, setValidReport] = React.useState(false);

    React.useEffect(()=>{
        openReport(0);
    }, [])

    const openReport = (reportIndex) => {
        const report = props.report;
        let stack = [];
        let tableStack = []

        //create an array of report keys
        const keys = Object.keys(report);

        //iterate through keys and create the report stack
        stack = keys.map((key, index) => {
            return (
                <div key={key}
                    className={reportIndex == index
                        ? "stack-tab active"
                        : "stack-tab inactive"}
                    onClick={()=>{openReport(index)}}><p>{key}</p>
                </div>
            )
        })

        //finding the active report using the key array and index;
        const activeReport = report[keys[reportIndex]].report;
        const SkuAmount = report[keys[reportIndex]].SkuAmount;
        console.log("Here's the active Report")
        console.log(activeReport);
        const activeReportKeys = Object.keys(activeReport);

        if (activeReportKeys.length == 0) {
            setValidReport(false);
        } else {
            tableStack = activeReportKeys.map((key, index)=>{
                let attempts = activeReport[key].attempts;
                let connections = activeReport[key].conn;
                let AmountCalled = (attempts / SkuAmount) * 100;
                let SuccessfulCalls = (connections/attempts) * 100;

                return (
                    <tr key={"row"+index}>
                        <td key={"attribute-"+index}>{key}</td>
                        <td key={"called-"+index}>{AmountCalled.toPrecision(3)+'%'}</td>
                        <td key={"successful-"+index}>{SuccessfulCalls.toPrecision(3)+'%'}</td>
                    </tr>
                )
            })

            console.log("Here's the stack of table rows");
            console.log(tableStack);

            tableStack.unshift(<tr key={"header-row"}><th>Attribute</th><th>Percentage of Time Called</th><th>Percentage of Successful Calls</th></tr>)
            setValidReport(true);
        }

        setReportStack(stack);
        setTableRows(tableStack);
    }

    return(
        <div className="report-container">
            <div className="reports-stack">
                {reportStack}
            </div>
            <div className="report-display">
                {!validReport
                ?<div className="error-message">
                    <h3>There was no valid report for this class</h3>
                </div>
                : <table>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>}
            </div>
        </div>
    )
}