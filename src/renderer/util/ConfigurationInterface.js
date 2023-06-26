require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import './style/config-interface.scss';

// Props for ConfigurationInterace are
// requestedSections: String[] -> specific headers or ["all"]

// For overview, this was separated out in case of pulling the interface into individual "drawers" or overlays

export default function ConfigInterface(props) {
    const [thisConfig, setThisConfig] = React.useState({});
    const [sectionStack, setSectionStack] = React.useState([]);

    React.useEffect(()=>{
        fetchConfiguration().then(data => {
            console.log("Logging the fetched Configuration!");
            console.log(data);
            setThisConfig(data);
            localStorage.setItem("prior-config", JSON.stringify(data))
        }).catch(err=>{
            console.log(err);
        });
        
    }, [])

    React.useEffect(()=>{
        let config = thisConfig;
        let stack = [];

        const requestedSections = props.requestedSections

        if (requestedSections.includes("all")) {
            let sectionHeaders = Object.keys(config);
            sectionHeaders.forEach((value, index)=>{
                stack.push(
                    <ConfigurationSection
                        {...props}
                        key={"section-"+index}
                        sectionTitle={value}
                        section={config[value]}
                        configuration={thisConfig}
                        revert={()=>{revertToInitial()}} 
                        export={()=>{exportConfiguration()}}
                        />
                )
            })
        } else {
            requestedSections.forEach((value, index)=>{
                stack.push(
                    <ConfigurationSection
                        {...props}
                        key={"section-"+index}
                        sectionTitle={value}
                        section={config[value]}
                        configuration={thisConfig}
                        revert={()=>{revertToInitial()}} 
                        export={()=>{exportConfiguration()}}
                        />
                )
            })   
        }
        

        console.log("Setting Section Stack")

        setSectionStack(stack);
        setThisConfig(config);
    }, [thisConfig])

    const fetchConfiguration = async () => {
        let fetchedData = await window.api.invoke("fetch-configuration");
        return fetchedData;
    }

    const exportConfiguration = () => {
        let newConfig = thisConfig;
        console.log("Posting the configuration...");
        console.log(newConfig);
        window.api.invoke("post-configuration", newConfig);
        localStorage.setItem("prior-config", JSON.stringify(newConfig))
    }

    const revertToInitial = () => {
        console.log("Resetting to initial configuration")
        let oldConfig = JSON.parse(localStorage.getItem("prior-config"))
        if (JSON.stringify(config) !== JSON.stringify(oldConfig)) {
            console.log(oldConfig);
            setConfig(oldConfig);
        } else {
            console.log("No changes appear to exist between the current version and the saved");
        }
    }

    return (
        <div className="config-display">
            {sectionStack}
        </div>
    )
}

function ConfigurationSection(props) {
    const [thisSection, setThisSection] = React.useState(props.section);
    const [displayStack, setDisplayStack] = React.useState([]);

    React.useEffect(()=>{
        let stack = [];
        let _section = props.section;
        let sectionValues = Object.keys(_section);

        console.log("New section has been input")

        sectionValues.forEach((value, index)=>{
            if (value.includes("metadata")) {
                // Reserve metadata fields titles
                // TODO: Add metadata-summary field for under header
            } if (Array.isArray(_section[value])) {
                stack.push(
                    <ArrayConfigurationElement 
                        key={props.sectionTitle+"-element-"+index}
                        section = {_section}
                        elementTitle={value}
                        elementValue={_section[value]}
                        />
                )
            } else if (typeof _section[value] === 'object' && _section[value] !== null) {
                stack.push(
                    <ObjectConfigurationElement
                        key={props.sectionTitle+"-element-"+index} 
                        section = {_section}
                        elementTitle={value}
                        elementValue={_section[value]}
                        />
                )
            } else if (typeof _section[value] === "boolean") {
                stack.push(
                    <BooleanConfigurationElement
                        key={props.sectionTitle+"-element-"+index}
                        section={_section}
                        elementTitle={value}
                        elementValue={_section[value]}
                    />
                )
            } else {
                stack.push(
                    <BasicConfigurationElement 
                        key={props.sectionTitle+"-element-"+index}
                        section = {_section}
                        elementTitle={value}
                        elementValue={_section[value]}
                        />
                )
            }
        })

        if (stack.length > 0) {
            stack.push(
                <SectionControls key={"controls-"+props.sectionTitle} {...props} />
            )
        }

        console.log("Setting display stack")
        setDisplayStack(stack);
        setThisSection(_section);
    }, [props.section])

    return (
        <div className="config-section">
            <div className="section-header">
                <h2 dangerouslySetInnerHTML={{__html:props.sectionTitle}}></h2>
            </div>
            <div className="section-body">
                {displayStack}
            </div>
        </div>
    )
}

function BasicConfigurationElement(props) {
    const [thisSection, setThisSection] = React.useState(props.section);
    const [elementValue, setElementValue] = React.useState(props.elementValue);

    React.useEffect(()=> {
        setElementValue(props.elementValue);
        console.log(`${props.elementTitle} has value ${props.elementValue}`)
    }, [props.elementValue])
    
    const handleElementChange = (event) => {
        let _section = thisSection;
        _section[props.elementTitle] = event.target.value;
        setElementValue(event.target.value);
        setThisSection(_section);
    }

    return (
        <div className="basic-el">
            <div className="basic-el-title" dangerouslySetInnerHTML={{__html:props.elementTitle+":"}}></div>
            <input type="text" value={elementValue} onChange={handleElementChange} />
        </div>
    )
}

function ArrayConfigurationElement(props) {
    const [thisSection, setThisSection] = React.useState(props.section);
    const [displayValue, setDisplayValue] = React.useState(props.elementValue.join(","))

    React.useEffect(()=> {
        setDisplayValue(props.elementValue.join(","));
    }, [props.section])

    const handleElementChange = (event) => {
        let _section = thisSection;
        let value = event.target.value
        _section[props.elementTitle] = value.split(",")
        setThisSection(_section);
        setDisplayValue(value)
    }

    return (
        <div className="array-el">
            <div className="array-el-title" dangerouslySetInnerHTML={{__html:props.elementTitle+" (comma separated values array):"}}></div>
            <textarea type="text" value={displayValue} onChange={handleElementChange}  />
        </div>
    )
}

function ObjectConfigurationElement(props) {
    const [thisSection, setThisSection] = React.useState(props.section);
    const [displayValue, setDisplayValue] = React.useState(()=>{
        let incomingValue = JSON.stringify(props.elementValue);
        incomingValue = incomingValue.replace("{", "");
        incomingValue = incomingValue.replace("}", "");
        return incomingValue
    });

    const handleElementChange = (event) => {
        const regex = new RegExp('(\"[A-Za-z$-@{-~!#^_`\\[\\]\\s\\\\]+\"\:\"[A-Za-z$-@{-~!#^_`\\[\\]\\s\\\\]+\"($)*)+', "gmi")
        let _section = thisSection;
        const value = event.target.value;
        let resultsArray = value.match(regex);
        let result = resultsArray ? "{" + resultsArray.join(",") + "}" : "{}"
        let resultObj = JSON.parse(result);
        _section[props.elementTitle] = resultObj;
        setDisplayValue(value);
        console.log(_section);
        setThisSection(_section);
    }

    return (
        <div className="array-el">
            <div className="array-el-title" dangerouslySetInnerHTML={{__html:props.elementTitle+` (comma separated "key":"value" pairs):`}}></div>
            <textarea type="text" value={displayValue} onChange={handleElementChange}  />
        </div>
    )
}

function BooleanConfigurationElement(props) {
    const [thisSection, setThisSection] = React.useState(props.section);
    const [boolValue, setBoolValue] = React.useState(props.elementValue)

    console.log(`Boolean value is ${boolValue}`);

    const handleElementChange = (event) => {
        let _section = thisSection;
        _section[props.elementTitle] = event.target.checked;
        console.log(`Setting Boolean value to: ${event.target.checked}`)
        setThisSection(_section);
        setBoolValue(event.target.checked);
    }

    return (
        <div className='bool-el'>
            <div className='bool-el-title' dangerouslySetInnerHTML={{__html: props.elementTitle}}></div>
            <input type="checkbox" checked={boolValue} onChange={handleElementChange}></input>
        </div>
    )
}


function SectionControls(props) {
    
    const revert = () => {
        props.revert();
    }

    const exportConfig = () => {
        props.export();
    }

    return (
        <div className="section-controls">
            <div className="controls-spacer"></div>
            <div className="btn-container">
                <div onClick={()=>{exportConfig()}}><p>Save</p></div>
                <div onClick={()=>{revert()}}><p>Revert</p></div>
            </div>
        </div>
    )
}