import React from 'react';
import '../../../style/sku-report.scss';

export default function SkuDataReport(props) {
    console.log(props.report)
    let thisReport =[]
    thisReport.push(
        <tr key={"Header"}>
            <td className="col-1">Test</td>
            <td className="col-2">Feedback</td>
        </tr>
    )

    props.report.forEach((row)=>{
        thisReport.push(
            <tr key={row.field + "-"+ row.test}>
                <td className="col-1">{row.test}</td>
                <td className="col-2">{row.message}</td>
            </tr>
        )
    })

    return (
        <div className="report-container">
            {props.reportLength > 0
            ? <table>
                <tbody>
                    {thisReport}
                </tbody>
            </table>
            : <div className="passed">
                All content tests were passed!
            </div>}
            <AttributeRecommender {...props} />
        </div>
    )
}

//gotta display that attribute data
function AttributeRecommender(props) {
    let display = props.attributeReport.map((value, index)=>{
        let table = [];
        let feedbackString = "";
        let currentValue = value.current;

        //check if there is a current value
        if (currentValue) {
            feedbackString = "Attribute has value. ";
            table.push(
                <tr key={"cur-"+index}>
                    <td key={"cur-col1-"+index}>Current Value</td>
                    <td key={"cur-col2-"+index}>{currentValue}</td>
                </tr>
            )
            if (value.currentFields.length > 0) {
                let currentFields = value.currentFields.join(", ")
                table.push(
                    <tr key={"curField-"+index}>
                        <td key={"curField-col1-"+index}>Current Value Fields</td>
                        <td key={"curField-col2-"+index}>{"Found in "+currentFields}</td>
                    </tr>
                )
            } else {
                feedbackString += "Current value is not in content. ";
            }

            if (value.rec) {
                let recommendations = value.rec;
                if (recommendations.length > 0) {
                    if (recommendations.includes(currentValue) && recommendations.length == 1) {
                        feedbackString += "Current value matches all recommendations.";
                    } else {
                        feedbackString += "Current value doesn't match recommendations.";

                        let recs = recommendations.join(" OR ")
                        let recFields = value.recFields.join(", ")
                        table.push(
                            <tr key={"recs-"+index}>
                                <td key={"recs-col1-"+index}>Recommendations</td>
                                <td key={"recs-col2-"+index}>{recs}</td>
                            </tr>
                        )
                        table.push(
                            <tr key={"recsField-"+index}>
                                <td key={"recsField-col1-"+index}>Recommendation Fields</td>
                                <td key={"recsField-col2-"+index}>{"Found in "+recFields}</td>
                            </tr>
                        )
                    }
                    
                } else {
                    feedbackString += "No potential recommendations found in content.";
                }
            } else {
                feedbackString += "Recommendations unavailable.";
            }
        } else {
            feedbackString = "Attribute is null. ";
            //run through recommendations
            if (value.rec) {
                let recommendations = value.rec;
                if (recommendations.length > 0) {
                    feedbackString += "Potential values found!"
                    let recs = recommendations.join(" OR ")
                    let recFields = value.recFields.join(", ")
                    table.push(
                        <tr key={"recs-"+index}>
                            <td key={"recs-col1-"+index}>Recommendations</td>
                            <td key={"recs-col2-"+index}>{recs}</td>
                        </tr>
                    )
                    table.push(
                        <tr key={"recsField-"+index}>
                            <td key={"recsField-col1-"+index}>Recommendation Fields</td>
                            <td key={"recsField-col2-"+index}>{"Found in "+recFields}</td>
                        </tr>
                    )
                } else {
                    feedbackString += "No values were found in content."
                }
            }
        }

        table.unshift(
            <tr key={"feedback-"+index}>
                <td key={"feedback-col1-"+index}>Feedback</td>
                <td key={"feedback-col2-"+index}>{feedbackString}</td>
            </tr>
        )

        return (
            <div key={"container-"+index} className="attribute-table">
                <table key={"table-"+index}>
                    <thead key={"table-head-"+index}>
                        <tr key={"head-row-"+index}>
                            <th key={"head-cell-"+index} colSpan="2" dangerouslySetInnerHTML={{__html: value.attribute}}></th>
                        </tr>
                    </thead>
                    <tbody key={"table-body-"+index}>
                        {table}
                    </tbody>   
                </table>
            </div>
        )
    })

    return (
        <div className="attribute-report-container">
            {display}
        </div>
    )
}