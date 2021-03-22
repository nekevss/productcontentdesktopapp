import React from 'react';
import '../../style/nav.scss'


export default function MainNavbar(props) {
    console.log("Logging state length value in Main Navbar")
    console.log(props.length)
    return (
        <div className="mainNav">
            {props.length == 1
            ? <LeftSideNav {...props} backstyle={{visibility:'hidden'}} nextstyle={{visibility:'hidden'}} />
            : props.position <= 0
            ? <LeftSideNav {...props} backstyle={{visibility:'hidden'}} nextstyle={{visibility:'visible'}} />
            : props.position >= props.length - 1
            ? <LeftSideNav {...props} backstyle={{visibility:'visible'}} nextstyle={{visibility:'hidden'}} />
            : <LeftSideNav {...props} backstyle={{visibility:'visible'}} nextstyle={{visibility:'visible'}} />
            }
            <RightSideNav {...props} />
        </div>
    );
}

function LeftSideNav(props) {

    return (
        <div className="left-side-nav">
            {props.isCurrent
            ?<button className="reset-button" onClick={() => props.setSkuPosition(0)}>Reload</button>
            :<button className="reset-button" onClick={() => props.escapeHistory()}>Exit</button>}
            <button className="back-button" onClick={() => props.setSkuPosition(props.position - 1)} style={props.backstyle}>Back</button>
            <button className="next-button" onClick={() => props.setSkuPosition(props.position + 1)} style={props.nextstyle}>Next</button>
            {props.length > 1
            ?<button className="menu-button" onClick={() => props.toggleSkuMenu()} >SKU Menu</button>
            :null}
        </div>
    );
    
}

function RightSideNav(props) {
    const [searchValue, setSearchValue] = React.useState("");
    const [searchActive, setSearchActive] = React.useState(false);
    const [activeValue, setActiveValue] = React.useState("");

    const handleTextChange = (event) => {
        if (searchActive) {
            UndoSearch();
        }
        setSearchValue(event.target.value);
    }

    const CheckKeyPress = (event) => {
        if (!searchActive) {
            if (event.key === "Enter") {
                RunSearch();
            }
        }
    }

    const RunSearch = () => {
        if (!searchActive) {
            console.log(`Searching for value: ${searchValue}`);
            const cleaner = /\\$/gi
            const cleanSearch = searchValue.replace(cleaner, "")
            let regex = new RegExp(cleanSearch, "gi");
            let contentBody = document.getElementsByClassName("body-container")[0];
            let queue = [];
            queue.push(contentBody);

            while (queue.length > 0) {
                let element = queue.shift();
                let children = element.children;

                if (children.length == 0) {
                    const oldText = element.innerHTML;
                    if (regex.test(oldText)) {
                        const foundValues = oldText.match(regex);
                        const noDuplicateFoundValues = foundValues.filter((item, index)=>{return foundValues.indexOf(item)===index})
                        console.log(element);
                        console.log(noDuplicateFoundValues);
                        let newText = oldText;
                        noDuplicateFoundValues.forEach((value)=>{
                            let thisRegex = new RegExp(value, 'g');
                            let highlightText = "<mark style='background-color:yellow'>"+value+"</mark>";
                            newText = newText.replace(thisRegex, highlightText);                            
                        })
                        element.innerHTML = newText;
                    } 
                } else {
                    queue.push(...children);
                }
            }

            setActiveValue(searchValue);
            setSearchActive(true);
        }
    }

    const UndoSearch = () => {
        console.log("Undoing Search...");
        const cleaner = /\\$/gi
        const cleanSearch = searchValue.replace(cleaner, "")
        let regex = new RegExp(cleanSearch, "gi");
        let contentBody = document.getElementsByClassName("body-container")[0];
        let queue = [];
        queue.push(contentBody);

        while (queue.length > 0) {
            let element = queue.shift();
            let children = element.children;

            if (element.tagName=="MARK") {
                let markText = element.innerHTML;
                let thisParent = element.parentNode;

                if (regex.test(markText)) {
                    const foundValues = markText.match(regex);
                    const noDuplicateFoundValues = foundValues.filter((item, index)=>{return foundValues.indexOf(item)===index})
                    noDuplicateFoundValues.forEach((value)=>{
                        thisParent.replaceChild(document.createTextNode(value), element);
                    })
                } 
            } else {
            queue.push(...children);
            }
        }

        setActiveValue("");
        setSearchActive(false);
    }

    return (
        <div className="right-side-nav">
            <input type="search" results={5} value={searchValue} onChange={handleTextChange} onKeyUp={CheckKeyPress} placeholder="Enter text here"></input>
            <button onClick={()=>{RunSearch()}} className="search-button">Search</button>
        </div>
    )
}