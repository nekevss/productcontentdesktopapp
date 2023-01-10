require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import BlankNavbar from '../blank-nav';
import ReactLoading from 'react-loading';
import './style/ResourceManager.scss';

export default function ResourceManager(props) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [config, setConfig] = React.useState({});
    const [storagePath, setStoragePath] = React.useState("");

    React.useEffect(()=>{
        window.api.invoke("fetch-configuration").then(_config=>{
            console.log(_config);
            setConfig(_config);
            setStoragePath(_config["Functional Data"]["Resources Path"]);
            setIsLoading(false);
        }).catch(err=>{console.log(err)})
    }, [])

    return(
        <>
            <BlankNavbar />
            {isLoading
            ? <ReactLoading className="react-loader" type={"bars"} color={"gray"} width={"12em"} height={"12em"} />
            : <ResourceManagerBody config={config} path={storagePath} />}
            
        </>
    )
}

function ResourceManagerBody(props) {
    const [thisPath, setThisPath] = React.useState(props.path);

    React.useEffect(()=>{
        console.log("Logging incoming path")
        console.log(props.path)
        setThisPath(props.path)
    }, [props.config])

    const handlePathChange = (event) => {
        setThisPath(event.target.value);
    }

    const UpdateConfig = () => {
        let _config = props.config;
        _config["Functional Data"]["Resources Path"] = thisPath;
        window.api.invoke("post-configuration", _config);
    }

    return (
        <div className="resource-container">
            <div className="path-display">
                <div className="title">Resource Path:</div>
                <input type="text" value={thisPath} onChange={handlePathChange} />
                <div className="btns">
                    <button onClick={()=>{UpdateConfig()}}>Update</button>
                </div>
            </div>
            <ResourceInterface path={props.path} />
        </div>
    )
}

function ResourceInterface(props) {

    const updateLocal = (updateType) => {
        console.log("Updating local files...")
        let updatePackage = {path: props.path, type: updateType}
        window.api.invoke("update-local", updatePackage);
    }

    const postLocal = (postType) => {
        console.log("Posting local files...")
        let postPackage = {path: props.path, type: postType}
        window.api.invoke("post-local", postPackage);
    }

    return(
        <div className="resources-interface">
            <div className="resource-block">
                <div className="title">Configuration</div>
                <div className="btn fetch" onClick={()=>{updateLocal("config")}}><p>Update Local</p></div>
                <div className="btn post" onClick={()=>{postLocal("config")}}><p>Export to Remote</p></div>
            </div>
            <div className="resource-block">
                <div className="title">Style Guides</div>
                <div className="btn fetch" onClick={()=>{updateLocal("sg")}}><p>Update Local</p></div>
                <div className="btn post" onClick={()=>{postLocal("sg")}}><p>Export to Remote</p></div>
            </div>
            <div className="resource-block">
                <div className="title">Sku Name Builders</div>
                <div className="btn fetch" onClick={()=>{updateLocal("sng")}}><p>Update Local</p></div>
                <div className="btn post" onClick={()=>{postLocal("sng")}}><p>Export to Remote</p></div>
            </div>
            <div className="resource-block">
                <div className="title">All Local Resources</div>
                <div className="btn fetch" onClick={()=>{updateLocal("all")}}><p>Update Local</p></div>
                <div className="btn post" onClick={()=>{postLocal("all")}}><p>Export to Remote</p></div>
            </div>
        </div>
    )
}