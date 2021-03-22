import React from 'react';
import '../../style/SearchSuggestions.scss'


export default function SearchSuggestions(props) {
    const [lastValue, setLastValue] = React.useState('');
    const [suggestionsDisplay, setSuggestionsDisplay] = React.useState([])
    const [thisStyle, setThisStyle] = React.useState(()=>{
        //lets compute the style,
        let searchBar = document.getElementById(props.searchId);
        const width = searchBar.offsetWidth;
        const elementPosition = searchBar.getBoundingClientRect()
        const newWidth = width * 0.98;

        const initialState = {
            width: newWidth,
            top:elementPosition.bottom,
            left:elementPosition.left
        }
        return initialState
    })

    React.useEffect(()=>{
        window.addEventListener('scroll', handleScroll)
        window.addEventListener('keydown', handleKeyPress)

        let index = props.index;
        console.log(props.searchValue)
        if (index.length > 0) {
            runSearch(props.searchValue, index);
            setLastValue(props.searchValue);
        } else {
            display.push(<div key={"no-match"} className="match-node" >
                <p dangerouslySetInnerHTML={{__html: "No Index to Search"}} />
            </div>)
            setSuggestionsDisplay(display)
        }
        
        return ()=>{
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [])

    React.useEffect(()=>{
        //Note: searchValue should never be "", suggestions should not render if thats the case
        if (lastValue.length < props.searchValue.length) {
            //need to check if suggestions are available
            let availableIndex = props.index;
            setTimeout(runSearch(props.searchValue, availableIndex), 250);
        } else {
            runSearch(props.searchValue, props.index)
        }
        setLastValue(props.searchValue);
        /*if (suggestions.length > 0) {
        } else {
            let display=(<div key={"no-match"} className="match-node" dangerouslySetInnerHTML={{__html: "No Matches Found"}}></div>)
            setSuggestionsDisplay(display)
        }*/
    }, [props.searchValue])

    const runSearch = (searchValue, searchIndex) => {
        const cleaner = /\\$/gi
        const cleanSearch = searchValue.replace(cleaner, "")
        const searchRegEx = "(^|\\s)" + cleanSearch;
        let regex;
        let display = [];
        try {
            regex = new RegExp(searchRegEx, "gi");
        } catch (err) {
            const char = searchValue.slice(searchValue.length - 1)
            window.api.alert('send-alert', `Invalid search character found! Invalid character: ${char}!`)
        }
        
        if (regex) {
            const matches = searchIndex.filter(value=>regex.test(value));
        
            console.log(matches.length);
            if (matches.length > 0) {
                console.log("Making the match value")
                for (let i in matches) {
                    let match = matches[i];
                    if (display.length>=5) {break;}
                    let tab = i + 1;
                    display.push(
                        <div key={"match"+i} tabIndex={tab} id={"match-"+i} onClick={selectValue} className="match-node">
                            <p dangerouslySetInnerHTML={{__html:match}} />
                        </div>)
                }
                setSuggestionsDisplay(display);
            } else {
                display.push(<div key={"no-match"} className="match-node" >
                    <p dangerouslySetInnerHTML={{__html: "No Matches Found"}} />
                </div>)
                setSuggestionsDisplay(display)
            }
        }
    }

    //https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
    const decodeHTML = (html) => {
        let txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    const selectValue = (event) => {
        if (event.target.tagName == "P") {
            if (event.target.innerHTML !=="No Matches Found") {
                props.return(decodeHTML(event.target.innerHTML));
            }
        }
        if (event.target.tagName == "DIV") {
            if (event.target.innerHTML !=="No Matches Found") {
                props.return(decodeHTML(event.target.firstChild.innerHTML));
            }
        }
    }

    const handleKeyPress = (event) =>{
        console.log("Keypress firing in suggestions")
        if (event.key == "ArrowDown" || event.key=="ArrowUp") { 
            event.preventDefault()
        }
        const activeElement = document.activeElement;
        const searchBar = document.getElementById("searchBar");
        const box = document.getElementById("suggestionsBox");
        const matches = box.children;
        console.log(matches);
        if (activeElement == searchBar) {
            if (event.key == "ArrowDown") {
                searchBar.blur()
                box.focus()
                console.log(box.firstChild)
                box.firstChild.focus();
            }
            if (event.key == "ArrowUp") {
                searchBar.blur()
                box.focus()
                console.log(box.lastChild)
                box.lastChild.focus();
            }
        } else {
            if (event.key == "ArrowDown") {
                console.log(matches)
                for (let i in matches) {
                    if (activeElement == matches[i]) {
                        if (matches[i] == box.lastChild) {
                            searchBar.focus()
                        } else {
                            console.log(document.getElementById("match-"+i))
                            matches[i].nextSibling.focus();
                        }
                    }
                }
            } else if (event.key == "ArrowUp") {
                for (let i in matches) {
                    if (activeElement == matches[i]) {
                        if (matches[i] == box.firstChild) {
                            searchBar.focus()
                        } else {
                            console.log(document.getElementById("match-"+i-1))
                            matches[i].previousSibling.focus();
                        }
                    }
                    
                }
            } else if (event.key == "Enter") {
                console.log(activeElement)
                props.return(decodeHTML(activeElement.firstChild.innerHTML))
            } else {
                //if any other key is pressed while suggest is active, focus should be moved to searchBar
                searchBar.focus()
            }
        }
        
    }

    const handleScroll = (event) => {
        let _style = thisStyle;
        let searchBar = document.getElementById(props.searchId)
        const elementPosition = searchBar.getBoundingClientRect()
        const newStyle = {
            width: _style.width,
            top:elementPosition.bottom,
            left:_style.left
        }
        setThisStyle(newStyle)
    }

    return (
        <div id="suggestionsBox" className="search-suggestions" style={thisStyle} >
            {suggestionsDisplay}
        </div>
    )
}