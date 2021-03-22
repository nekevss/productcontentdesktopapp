require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import '../../style/views/secondInterface.scss';
import SuggestSearchBar from '../search/SuggestSearchBar.js';


export default function SecondaryInterface(props) {

    return(
        <div className="secondary-body">
            <SuggestSearchBar 
                {...props} 
                active={props.isSpecific}
                placeholder={"Search class to view"}
                button={"Specify"}
                button2={"Cancel"}
                index={props.classIndex}
                search={(a)=>{props.handleSearch(a)}}
                />
            {props.isSpecific
            ? <SecondarySpecificDisplay 
                {...props}
                />
            : <SecondaryFullDisplay 
                {...props} /> }
        </div>
    )
}


function SecondaryFullDisplay(props) {
    const [metadataDisplay, setMetadataDisplay] = React.useState([]);
    const [dataDisplay, setDataDisplay] = React.useState([]);
    const [loadComplete, setLoadComplete] = React.useState(false);

    React.useEffect(()=>{
        let resource = props.resource;
        let display = [];
        let metaDisplay = []
        let resourceData = resource.data;
        let resourceMeta = resource.metadata; 
        let metaKeys = Object.keys(resourceMeta);

        metaKeys.forEach((value, index)=>{
            metaDisplay.push(
                <div className="metadata-row" key={"metarow-"+index}>
                    <div key={"metakey-"+index}>{value+":"}</div>
                    <div key={"metavalue-"+index}>{resourceMeta[value]}</div>
                </div>
            )
        })

        resourceData.forEach((value, index)=>{
            display.push(
                <tr key={"row"+index}>
                    <td className="row-class" key={"class-"+index} dangerouslySetInnerHTML={{__html:value.class}}></td>
                    <td className="row-formula" key={"formula-"+index} dangerouslySetInnerHTML={{__html:value.styleGuide}}></td>
                    <td className="row-update" key={"updated-"+index} dangerouslySetInnerHTML={{__html:value.lastUpdate ? value.lastUpdate : "Unknown"}}></td>
                </tr>
            )
        })
        if (display.length>0) {
            display.unshift(
                <tr key={"header-row"}>
                    <th key={"header-class"}>Class</th>
                    <th key={"header-formula"}>Style Guide Formula</th>
                    <th key={"header-updated"}>Last Updated</th>
                </tr>
            )
        }

        setDataDisplay(display);
        setMetadataDisplay(metaDisplay);
        setLoadComplete(true);

    }, [props.resource, props.generators])

    return (
        <div className={loadComplete ? "resource-display loaded" : "react-loader"}>
            {loadComplete
            ?<div className="metadata-display">
                {metadataDisplay}
            </div>
            :null}
            {loadComplete
            ?<div className="data-display">
                <table>
                    <tbody>
                        {dataDisplay}
                    </tbody>
                </table>
            </div>
            :null}
        </div>
    )
}

function SecondarySpecificDisplay(props) {
    const [searchValue, setSearchValue] = React.useState(props.searchedClass);
    const [isFound, setIsFound] = React.useState(false);
    const [thisStyleGuide, setThisStyleGuide] = React.useState();
    const [display, setDisplay] = React.useState([]);
    const [reportDisplay, setReportDisplay] = React.useState([])
    const [sampleSize, setSampleSize] = React.useState(0);
    const [genFound, setGenFound] = React.useState(false);
    const [rawGenerator, setRawGenerator] = React.useState("")

    React.useEffect(()=>{
        console.log("Specific Display Element has been created")
        RunSearch();
    }, [])

    React.useEffect(()=>{
        console.log("New resources detected. Rerunning Search...")
        RunSearch();
    }, [props.resource, props.generators])

    React.useEffect(()=>{
        console.log("Searched Class value has been changed")
        setSearchValue(props.searchedClass);
    }, [props.searchedClass])

    React.useEffect(()=>{
        //doing this to trick the search
        console.log("Running the Search function!!!!")
        RunSearch()
    }, [searchValue])

    React.useEffect(()=>{
        let _thisStyleGuide = thisStyleGuide;
        let _display = [];
        let reportStack = [];

        if (_thisStyleGuide) {
            console.log(_thisStyleGuide)
            _display.push(
                <tr key={"header-row"}>
                    <th key={"header-class"}>Class</th>
                    <th key={"header-formula"}>Style Guide Formula</th>
                    <th key={"header-updated"}>Last Updated</th>
                </tr>
            )
            _display.push(
                <tr key={"row-specific"}>
                    <td className="row-class" key={"class-specific"} dangerouslySetInnerHTML={{__html:_thisStyleGuide.class}}></td>
                    <td className="row-formula" key={"formula-specific"} dangerouslySetInnerHTML={{__html:_thisStyleGuide.styleGuide}}></td>
                    <td className="row-update" key={"updated-specific"} dangerouslySetInnerHTML={{__html:_thisStyleGuide.lastUpdate ? _thisStyleGuide.lastUpdate : "Unknown"}}></td>
                </tr>
            )
            console.log("Logging the report")
            console.log(_thisStyleGuide.report);
            if (_thisStyleGuide.report) {
                let thisReportObject = _thisStyleGuide.report;
                let thisSample = thisReportObject.SkuAmount;
                let attributeReport = thisReportObject.report;
                let attributes = Object.keys(attributeReport);
                
                reportStack = attributes.map((key, index)=>{
                    let attempts = attributeReport[key].attempts;
                    let connections = attributeReport[key].conn;
                    let AmountCalled = (attempts / thisSample) * 100;
                    let SuccessfulCalls = (connections/attempts) * 100;

                    return (
                        <tr key={"row"+index}>
                            <td key={"attribute-"+index}>{key}</td>
                            <td className="percentage-cell" key={"called-"+index}>{AmountCalled.toPrecision(3)+'%'}</td>
                            <td className="percentage-cell" key={"successful-"+index}>{SuccessfulCalls.toPrecision(3)+'%'}</td>
                        </tr>
                    )
                })

                reportStack.unshift(<tr key={"header-row"}><th>Attribute</th><th>Percentage of Time Called</th><th>Percentage of Successful Calls</th></tr>)
                
                
                setSampleSize(thisSample);
                setReportDisplay(reportStack);
            } else {
                setSampleSize(0);
                setReportDisplay(reportStack);
            }
            setDisplay(_display);
            setIsFound(true)
        }

    }, [thisStyleGuide])

    const RunSearch = () => {
        console.log(`Running search on the following value: ${searchValue}`)
        let _thisStyleGuide;
        let _gen;
        let resource = props.resource;
        let styleGuides = resource.data;
        let generators = props.generators.data;

        for (let guide of styleGuides) {
            if (guide.class.toLowerCase() == searchValue.toLowerCase()) {
                console.log("Found a Style Guide")
                _thisStyleGuide = guide;
                break;
            }
        }

        for (let gen of generators) {
            if (gen.class.toLowerCase() == searchValue.toLowerCase()){
                _gen = gen;
                console.log("Found a generator!")
                break;
            }
        }

        if (_thisStyleGuide) {
            setThisStyleGuide(_thisStyleGuide);
            setIsFound(true);
        } else {
            setIsFound(false);
            console.log("Apparently there was no style guide found.")
        }

        if (_gen) {
            setRawGenerator(_gen);
            setGenFound(true);
        } else {
            setGenFound(false);
            console.log("Apparently there was no generator found.")
        }
    }

    return (
        <div id="displayContainer" className="resource-display">
            {isFound
            ?<div className="data-display">
                <table className="formula-table">
                    <tbody>
                        {display}
                    </tbody>
                </table>
            </div>
            :<div className="data-display">
                <h2>No Style Guide Found. Please search another value.</h2>
            </div>}
            {isFound
            ? sampleSize > 0
            ?<div className="report-display">
                <h3>Last Attribute Report</h3>
                <div className="sample-size-container">
                    <div dangerouslySetInnerHTML={{__html: "Report Sample Size: "+sampleSize}}></div>
                </div>
                <table>
                    <tbody>
                        {reportDisplay}
                    </tbody>
                </table>
            </div>
            :null
            :null}
            {isFound && genFound
            ? <div className="generator-display">
                <h3>Raw Generator for Class</h3>
                <pre>
                    {JSON.stringify(rawGenerator, null, 4)}
                </pre>
            </div>
            :null}
        </div>
    )
}