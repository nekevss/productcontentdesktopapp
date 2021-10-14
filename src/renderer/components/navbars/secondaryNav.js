import React from 'react';
import './style/nav.scss';


export default function SecondaryNavbar(props) {

    const FetchResources = ()=> {
        props.LoadResources();
    }

    return (
        <div className="mainNav">
            <div className="left-side-nav">
                <button className="reset-button" onClick={() => FetchResources()}>Reload</button>
            </div>
        </div>
    );
}

/*
<div className="sg-right-side-nav">
    <input id="textSearch" type="search" value={searchValue} onChange={handleTextChange} onKeyUp={CheckKeyPress} placeholder="Enter text to search" />
    <button onClick={()=>{RunSearch()}} className="search-button">Search</button>
</div> 

    const handleTextChange = (event) => {
        if (searchActive) {
            UndoSearch();
        }
        setSearchValue(event.target.value);
    }

    const CheckKeyPress = (event) => {
        let activeElement = document.activeElement;
        let searchBar = document.getElementById("textSearch");
        if (activeElement == searchBar && !searchActive) {
            if (event.key === "Enter") {
                runSearch();
            }
        }
    }

    const runSearch = () => {
        if (!searchActive) {
            console.log(`Searching for value: ${searchValue}`);
            let regex = new RegExp(searchValue, "gi");
            let contentBody = document.getElementsByClassName("resource-display")[0];
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
                        //console.log(element);
                        //console.log(noDuplicateFoundValues);
                        let newText = oldText;
                        noDuplicateFoundValues.forEach((value)=>{
                            let thisRegex = new RegExp(value, 'g');
                            let highlightText = "<mark style='background-color:yellow'>"+value+"</mark>";
                            newText = newText.replace(thisRegex, highlightText);                            
                        })
                        element.innerHTML = newText;
                    } 
                } else {
                    //need to catch <br>
                    if (children[0].tagName == "BR") {
                        const oldText = element.innerHTML;
                        if (regex.test(oldText)) {
                            const foundValues = oldText.match(regex);
                            const noDuplicateFoundValues = foundValues.filter((item, index)=>{return foundValues.indexOf(item)===index})
                            //console.log(element);
                            //console.log(noDuplicateFoundValues);
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
                console.log(queue);
            }

            setSearchActive(true);
        }
    }

    const UndoSearch = () => {
        console.log("Undoing Search...");
        let regex = new RegExp(searchValue, "gi");
        let contentBody = document.getElementsByClassName("resource-display")[0];
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

        setSearchActive(false);
    }

*/