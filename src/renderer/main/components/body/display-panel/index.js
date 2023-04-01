require("regenerator-runtime/runtime");
require("core-js/stable");
import React, { useState } from 'react';
import StyleGuideCard from './style-guide-card.js';
import SkuDataReport from './sku-report.js';
import './style/presenter.scss';

//Change name to TopsideDisplay ???
export default function DisplayPanel(props) {
    const [dataView, setdataView] = useState('main')
    const [extraStack, setExtraStack] = React.useState([]);

    React.useEffect(()=> {
        // Generate the extra info display stack
        let extraDisplay = [];
        const extraInput = props.config["Functional Data"]["Extra Fields"] ? props.config["Functional Data"]["Extra Fields"] : [];
        for (const call of extraInput) {
            if (props.sku[call]) {
                extraDisplay.push(<ExtraDataView key={"extra-"+call} title={call} value={props.sku[call]} />)
            }
        }

        setExtraStack(extraDisplay);
    }, [props.sku])

    const renderView = (view) => {
        switch (view) {
            case 'json':
                return (
                    <div className="conditional-block">
                        <FullDataTable {...props} />
                    </div>
                )
            case 'report':
                return (
                    <div className="conditional-block">
                        <SkuDataReport 
                            sku= {props.sku}
                            config={props.config}
                            report={props.contentReport}
                            reportLength = {props.contentReport.length} 
                            attributeReport={props.attributeReport}
                            />
                    </div>
                )
            default:
                return (
                    <div className="conditional-block">
                        <ITSPanel sku={props.sku} config={props.config} />
                        <TitleCard sku={props.sku} config={props.config} />
                        {extraStack.length>0
                        ? extraStack
                        : null}
                        <StyleGuideCard {...props} config={props.config} />
                    </div>
                )
        }
    }

    return (
        <div className="sku-data-container">
            <div className="sd-btn-container">
                <div onClick={() => {setdataView('main')}}
                    className={dataView == 'main' ? 'sd-btn-active' : 'sd-btn-inactive'}><p>Main</p></div>
                <div onClick={() => {setdataView('report')}} 
                    className={ dataView == 'report' ? 'sd-btn-active' : 'sd-btn-inactive'}><p>{props.contentReport.length == 0 ? "Reporting" : `Reporting (${props.contentReport.length})`}</p></div>
                <div onClick={() => {setdataView('json')}} 
                    className={dataView == 'json' ? 'sd-btn-active' : 'sd-btn-inactive'}><p>View Raw</p></div>
            </div>
            {renderView(dataView)}
        </div>
    );
}

function ITSPanel(props) {
    const [displayStack, setDisplayStack] = React.useState([]);

    React.useEffect(()=>{
        let display = [];
        let intentsTitles = props.config["Excel Mapping"]["Selling Intents Titles"];
        let intentCalls = props.config["Excel Mapping"]["Selling Intents"];

        intentCalls.forEach((value, index)=>{
            if (props.sku[value] && intentsTitles.length > index) {
                display.push(
                    <div key={"SellingIntent"+index} dangerouslySetInnerHTML={{__html:intentsTitles[index]+": "+ props.sku[value]}}></div>
                )
            }
        })

        setDisplayStack(display)

    }, [props.sku])

    return (
        <div className="its-container">
            {displayStack}
        </div>
    );
}

function TitleCard(props) {
    //this could probably be broken down further, but it's so static
    return (
        <div className="title-card">
            <div className="title-card-top">
                <div>
                {
                    props.sku[props.config["Excel Mapping"]["Sku Number"]] 
                    ? "Sku Number: " + props.sku[props.config["Excel Mapping"]["Sku Number"]]
                    : "Wholesale ID: " + props.sku[props.config["Excel Mapping"]['Wholesaler Number']]
                }
                </div>
                <div>{"Vendor Model Number: " + props.sku[props.config["Excel Mapping"]['Vendor Model Number']]}</div>
            </div>
            <div className="SkuName" dangerouslySetInnerHTML={{__html: props.sku[props.config["Excel Mapping"]['Sku Name']]}}></div>
            <div className="title-card-bottom">
                <div>{"Pyramid ID: " + props.sku[props.config["Excel Mapping"]["Pyramid Id"]]}</div>
                <div>{"UOM: " + props.sku[props.config["Excel Mapping"]["UOM"]]}</div>
            </div>
        </div>
    );
}

function FullDataTable(props) {
    return (
        <div className="full-sku">
            <pre>
                {JSON.stringify(props.sku, null, 4)}
            </pre>
        </div>
    );
}

function ExtraDataView(props) {

    return(
        <div className="extra-container">
            <div className="extra-title"><b>{props.title + ":"}</b></div>
            <div className="extra-input" dangerouslySetInnerHTML={{__html: props.value}}></div>
        </div>
    )
}