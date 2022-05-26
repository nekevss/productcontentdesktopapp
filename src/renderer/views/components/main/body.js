import React, {useState} from 'react';
import './style/body.scss';
import ImageGrid from './Imagegrid.js';
import DataPresenter from './presenter/presenter.js';
//switch to functional with hooks

export default function MainBody(props) {
    const handleSKUContent = (incomingSKU) => {
        // Adjust html tags for all fields that we complete reporting on for content.
        const ltTag = new RegExp("<lt\\/>", "gi");
        const gtTag = new RegExp("<gt\\/>", "gi");
        let fieldsToClean = props.config["Functional Data"]["Reporting Fields"];
        fieldsToClean.forEach((field)=>{
            let fieldValue = incomingSKU[field];
            if (fieldValue !== null) {
                fieldValue = fieldValue.replace(ltTag, "<");
                fieldValue = fieldValue.replace(gtTag, ">");
                incomingSKU[field] = fieldValue;
            }
        })
        return incomingSKU
    }

    const [currentSKU, setCurrentSKU] = React.useState(()=>{return handleSKUContent(props.sku)})

    React.useEffect(()=>{
        let newSKU = handleSKUContent(props.sku);
        setCurrentSKU(newSKU)
    }, [props.sku])


    return(
        <div className="body-container">
            <div className="top-spacer">
                <p dangerouslySetInnerHTML={{__html: currentSKU[props.config["Excel Mapping"]["PPH Path"]]}}></p>
            </div>
            <div className="top-container">
                <ImageGallery {... props} />
                <DataPresenter 
                    config ={ props.config}
                    styleGuide={ props.styleGuide} 
                    gen={props.gen} 
                    sku={currentSKU}
                    attributes={props.attributes} />
            </div>
            <div className="lower-container">
                <WrittenContent sku={currentSKU} config ={props.config} />
                <SpecsTable sku={currentSKU} config ={props.config} />
            </div>
            
        </div>
    )
}


function ImageGallery(props) {
    const [primarySource, setPrimarySource] = React.useState(props.primaryImage);
    const [zoomActive, setZoomActive] = React.useState(false);

    React.useEffect(()=>{
        const img = document.getElementById("centralImage");
        img.addEventListener("mouseover", handleZoom, false);
        window.addEventListener("scroll", handleScroll, false)

        return () => {
            img.removeEventListener("mouseover", handleZoom, false);
            window.removeEventListener("scroll", handleScroll, false)
        }
    }, [])

    React.useEffect(()=>{
        setPrimarySource(props.primaryImage)
    }, [props.primaryImage]);


    const handleZoom = () => {
        setZoomActive(true);
        document.getElementById("ImageZoom").style.visibility = "visible";
        ImageZoom("centralImage", "ImageZoom");
    }
    
    const handleScroll = () => {
        let result = document.getElementById("ImageZoom");
        let scrollY = window.scrollY;
        if (result) {
            result.style.top = (192 + scrollY) + 'px';
        }
    }

    const ImageZoom = (imgID, resultID) => {
        
        let img, lens, result, cx, cy;
        //sets DOM objects
        img = document.getElementById(imgID);
        result = document.getElementById(resultID);
        /* Create lens div and set attributes: */
        lens = document.createElement("DIV");
        lens.setAttribute("class", "zoom-lens");
        lens.setAttribute("id", "ZoomLens")
        /* Insert lens onto img parent node: */
        let parent= img.parentElement;
        let children = parent.children;
        let firstChild = children[0]
        if (firstChild.id !== lens.id) {
            parent.insertBefore(lens, img);
        }
        
        /* Calculate the ratio between result DIV and lens: */
        //result div width divided by lens offset width

        //lens is a static 64 (4em) vs the result lens being 300px x 300px
        cx = 300 / 64;
        cy = 300 / 64;
        /* Set background properties for the result DIV */
        let widthValue = img.width * cx;
        let heightValue = img.height * cy;
        //console.log(`${widthValue} and ${heightValue}`)
        //console.log("url('" + img.src + "?wid="+ widthValue + "&hei=" + heightValue + "')")
        result.style.backgroundImage = "url('" + img.src + "?wid="+ widthValue + "&hei=" + heightValue + "')";
        result.style.backgroundSize = widthValue + "px " + heightValue + "px";
    }

    const moveLens = (evt) => {
        //console.log("Move Lens function fired")
        let img = document.getElementById("centralImage");
        let result = document.getElementById("ImageZoom");
        let lens = document.getElementById("ZoomLens");
        let pos, x, y;
        let scrollY = window.scrollY;
        /* Prevent any other actions that may occur when moving over the image */
        evt.preventDefault();
        /* Get the cursor's x and y positions: */
        pos = getCursorPos(evt, img);
        let imageData = img.getBoundingClientRect()
        let resultData = result.getBoundingClientRect()
        /* Calculate the position of the lens: */
        let cx = result.offsetWidth / lens.offsetWidth;
        let cy = result.offsetHeight / lens.offsetHeight;
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);
        //console.log(`cx is ${cx} and cy is ${cy}`)
        
        /* Prevent the lens from being positioned outside the image: */
        if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
        if (x < 0) {x = 0;}
        if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
        if (y < 0) {y = 0;}
        
        /* Set the position of the lens: */
        lens.style.left = (x + imageData.left) + 'px';
        lens.style.top = (y + imageData.top + scrollY) + 'px';
        /* Display what the lens "sees": */
        let resultX = x * cx;
        let resultY = y * cy;
        //console.log(`resultX: ${resultX} and resultY: ${resultY}`)
        result.style.backgroundPosition = "-" + resultX + "px -" + resultY + "px";
        //stabilize the zoom result on scroll
        result.style.top = (192 + scrollY) + 'px';
    }

    const getCursorPos = (evt, img) => {
        let imageData, x = 0, y = 0;
        evt = evt || window.event;
        /* Get the x and y positions of the image: */
        imageData = img.getBoundingClientRect();
        //console.log(a);
        /* Calculate the cursor's x and y coordinates, relative to the image: */
        x = evt.pageX - imageData.left;
        y = evt.pageY - imageData.top;
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        //console.log({x : x, y : y});
        return {x : x, y : y};
    }

    const handleMouseLeave = () => {
        setZoomActive(false)
    }

    return(
        <div className="ImageGallery">
            {zoomActive?<div id="ImageZoom" className="image-zoom"></div>:null}
            <div className = "central-image" onMouseLeave={handleMouseLeave} >
                {zoomActive?<div id="ZoomLens" className="zoom-lens" onMouseMove={moveLens}></div>:null}
                <img id="centralImage" className="current-image" src={primarySource} onMouseMove={moveLens}  />
            </div>
            <ImageGrid sku ={props.sku} config={props.config} source={props.source} setcurrentimage={(data)=> {props.setprimaryimage(data)}}/>  
        </div>
    );
}

function WrittenContent(props) {

    const extendedDesc = React.useRef() 
    console.log(extendedDesc.current)
    if (extendedDesc.current) {
        extendedDesc.current = extendedDesc.current.replace("/<lt\\/>/gi", "<");
        extendedDesc.current = extendedDesc.current.replace("/<gt\\/>/gi", ">");
        console.log(extendedDesc.current)
    }

    return (
        <div className="WrittenContent">
            <h3>About Product</h3>
            {props.sku[props.config["Excel Mapping"]["Headliner"]] 
            ? <h4 dangerouslySetInnerHTML={{__html: props.sku[props.config["Excel Mapping"]["Headliner"]]}}></h4>
            : null}
            {props.sku[props.config["Excel Mapping"]["Short Description"]]
            ? <p dangerouslySetInnerHTML={{__html: props.sku[props.config["Excel Mapping"]["Short Description"]]}}></p>
            : null}
            <Bullets sku={props.sku} config={props.config} />
            {props.sku[props.config["Excel Mapping"]["Extended Description"]]
            ? <p dangerouslySetInnerHTML={{__html: props.sku[props.config["Excel Mapping"]["Extended Description"]]}}></p>
            : null}
        </div>
    );

}

function Bullets(props) {
    let bullets = [];
    let call = "";

    let bulletsArray = props.config["Excel Mapping"]["Bullets"];

    bulletsArray.forEach((value, index)=>{
        call = value;
        if (props.sku[call]) {
            bullets.push(<li key={call} dangerouslySetInnerHTML={{__html: props.sku[call]}}></li>)
        }
    })

    return (
        <div className="BulletCopy">
            {bullets}
        </div>
    );
}

function SpecsTable(props) {
    let tablespecs = [];
    let tablevalues = [];
    let tablerows = [];

    let skuSpecs = props.sku[props.config["Excel Mapping"]["Attributes Object Name"]];

    //create arrays of table data
    for (let spec in skuSpecs) {
        tablespecs.push(spec)
        skuSpecs[spec] ? tablevalues.push(skuSpecs[spec]) : tablevalues.push("null")
    }

    let isOdd = tablespecs.length % 2 == 1;

    //console.log(isOdd);

    if (isOdd) {
        for (let i = 0; i < tablespecs.length - 1; i=i+2) {
            tablerows.push(
                <tr key={i}>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i]}}></td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i]}}></td>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i+1]}}></td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i+1]}}></td>
                </tr>
            );
        };
        tablerows.push(
            <tr key={"remaining"}>
                <td dangerouslySetInnerHTML={{__html: tablespecs[tablespecs.length-1]}}>
                </td>
                <td dangerouslySetInnerHTML={{__html: tablevalues[tablevalues.length-1]}}>
                </td>
            </tr>
        );
    } else {
        for (let i = 0; i <= tablespecs.length - 1; i=i+2) {
            tablerows.push(
                <tr key={i}>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i]}}>
                    </td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i]}}>
                    </td>
                    <td dangerouslySetInnerHTML={{__html: tablespecs[i+1]}}>
                    </td>
                    <td dangerouslySetInnerHTML={{__html: tablevalues[i+1]}}>
                    </td>
                </tr>
            );
        }
    }  
    
    return (
        <div className="spec-section">
                <table>
                    <tbody>
                        {tablerows}
                    </tbody>
                </table>
        </div>
    );
}