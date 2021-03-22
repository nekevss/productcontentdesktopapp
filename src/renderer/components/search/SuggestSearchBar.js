import React from 'react';
import SearchSuggestions from './SearchSuggestions';
import '../../style/SuggestSearchBar.scss';

export default function SuggestSearchBar(props) {
    const searchRef = React.createRef()
    const [searchValue, setSearchValue] = React.useState('');
    const [suggestActive, setSuggestActive] = React.useState(false)

    React.useEffect(()=>{
        window.addEventListener('keydown', checkKeyPress)

        return ()=>{
            window.removeEventListener('keydown', checkKeyPress)
        }
    }, [])

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value)
        let check = event.target.value === "" ? false : true 
        setSuggestActive(check);
    }

    const checkKeyPress = (event) => {
        console.log("Keydown firing in search bar")
        const activeElement = document.activeElement;
        const searchBar = document.getElementById("searchBar");
        if (activeElement == searchBar) {
            console.log(event.key)
            if (event.key === "Enter") {
                let btn = document.getElementsByClassName("search-button")[0];
                btn.click()
            }
        }
    }

    const initSearch = () => {
        console.log(`Sending ${searchValue} outside of suggest-searchbar component`)
        props.search(searchValue);
        setSuggestActive(false)
    }

    const cancel = () => {
        setSearchValue("")
        props.search("");
        setSuggestActive(false);
    }

    const handleReturn = (suggestionsReturn) => {
        console.log(`Recieved ${suggestionsReturn} from Search Suggestions`)
        setSearchValue(suggestionsReturn);
        setSuggestActive(false);
        document.getElementById("searchBar").focus()
    }
    //wrap search bar in a div and place suggestions below it???

    return (
        <div className="suggest-search-container" ref={searchRef}>
            <input id="searchBar" 
                type="search" 
                value={searchValue} 
                onChange={handleSearchChange}
                placeholder={props.placeholder===""? "Enter text here":props.placeholder} 
                />
            {props.active && props.button2
            ?<button onClick={()=>{cancel()}} className="search-button">{props.button2}</button>
            :<button onClick={()=>{initSearch()}} className="search-button">{props.button}</button>}
            {suggestActive
            ? <SearchSuggestions 
                searchValue={searchValue} 
                searchId={"searchBar"}
                index={props.index}
                return={(v)=>{handleReturn(v)}} />
            : null}
        </div>
    )
}