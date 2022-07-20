import React from 'react';
import reactDOM from "react-dom";
import ReactLoading from 'react-loading';
import SecondaryNavbar from './navbars/secondaryNav.js';
import SecondaryInterface from './secondary/secondaryInterface.js';

function SecondaryApp() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [thisResource, setThisResource] = React.useState({});
    const [generators, setGenerators] = React.useState({});
    const [classIndex, setClassIndex] = React.useState([]);
    const [isSpecific, setIsSpecific] = React.useState(false);
    const [searchedClass, setSearchedClass] = React.useState("");

    React.useEffect(()=>{
        window.addEventListener("contextmenu", RightClickFunction, false)
        window.addEventListener("click", HandleLinkClicks, false)

        LoadResources()

        return ()=> {
            window.removeEventListener("contextmenu", RightClickFunction);
            window.removeEventListener("click", HandleLinkClicks);
        }
    }, [])

    const LoadResources = () => {
        runFetch("style guide").then((data)=>{
            console.log(data)
            setThisResource(data);
            setIsLoading(false);
        }).catch((err)=>{
            console.log(err)
        })
        //load generators in the background, since they are not needed to load table
        runFetch("generators").then((data)=>{
            console.log(data)
            setGenerators(data);
        }).catch((err)=>{
            console.log(err)
        })
        fetchIndex().then((data)=>{
            setClassIndex(data);
        }).catch(err=>console.log(err))
        setIsSpecific(false);
        setSearchedClass("");

    }

    const fetchIndex = async()=>{
        let index = await window.api.invoke("fetch-class-index")
        return index
    }

    const runFetch = async(requestedResource) => {
        let resource = await window.api.invoke("fetch-resource", requestedResource)
        return resource
    }

    const handleSearch = (searchValue) => {
        const activateSearch = searchValue === "" ? false : true;
        if (searchValue.toLowerCase() !== searchedClass.toLowerCase()) {
            setSearchedClass(searchValue);
        }
        setIsSpecific(activateSearch);
    }

    return (
        <div className="resources-app">
            <SecondaryNavbar 
                LoadResources={()=>{LoadResources()}}
                isSpecific={isSpecific}
                />
            {!isLoading
            ? <SecondaryInterface 
                resource={thisResource} 
                generators={generators}
                classIndex={classIndex}
                searchedClass={searchedClass}
                handleSearch={(a)=>{handleSearch(a)}}
                isSpecific={isSpecific}
                />
            :<div className="load-container">
                <ReactLoading className="react-loader" type={"bars"} color={"gray"} width={"12em"} height={"12em"} />
            </div>}
        </div>
    )
}

const RightClickFunction = (event, param) => {
    event.preventDefault();
    let contextData;
    if (event.target.tagName == "IMG") {
        contextData = {tagName:"IMG", src:event.target.src}
    } else {
        contextData = {tagName:event.target.tagName}
    }
    window.api.message("fetch-context-menu", contextData);
}

const HandleLinkClicks = (event, param) => {
    if (event.target.tagName == "A" && event.target.href.startsWith('http')) {
        event.preventDefault();
        window.api.message("open-in-browser", event.target.href);
    }
}

reactDOM.render(<SecondaryApp />, document.getElementById("root"));