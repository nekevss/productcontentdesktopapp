require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import './images.scss';
import ImageGrid from './image-grid.js';

export default function ImageGallery(props) {
    const [primarySource, setPrimarySource] = React.useState(props.primaryImage);
    const [zoomActive, setZoomActive] = React.useState(false);

    let zoomInitialized = React.useRef(false);

    React.useEffect(()=>{
        const img = document.getElementById("centralImage");
        img.addEventListener("mouseover", activateZoom, false);
        window.addEventListener("scroll", handleScroll, false)

        return () => {
            img.removeEventListener("mouseover", activateZoom, false);
            window.removeEventListener("scroll", handleScroll, false)
        }
    }, [])

    React.useEffect(()=>{
        setPrimarySource(props.primaryImage)
    }, [props.primaryImage]);

    React.useEffect(()=>{
        if (zoomActive) {
            let zoomNode = document.getElementById("ImageZoom");
            let lensNode = document.getElementById("ZoomLens");
            zoomNode.style.visibility = "visible";
            lensNode.style.visibility = "visible";
            initializeZoomedImage();
            zoomInitialized.current = true;
        }
    }, [zoomActive])


    const activateZoom = () => {
        setZoomActive(true);
    }
    
    const handleMouseLeave = () => {
        setZoomActive(false)
    }

    const handleScroll = () => {
        let result = document.getElementById("ImageZoom");
        let scrollY = window.scrollY;
        if (result) {
            result.style.top = (192 + scrollY) + 'px';
        }
    }
    
    const initializeZoomedImage = () => {
        
        let img, lens, result, cx, cy;
        //sets DOM objects
        img = document.getElementById("centralImage");
        result = document.getElementById("ImageZoom");
        
        /* Calculate the ratio between result DIV and lens: */
        //result div width divided by lens offset width

        //lens is a static 64 (4em) vs the result lens being 300px x 300px
        cx = 300 / 64;
        cy = 300 / 64;
        /* Set background properties for the result DIV */
        let widthValue = img.width * cx;
        let heightValue = img.height * cy;
        
        result.style.backgroundImage = "url('" + img.src + "?wid="+ widthValue + "&hei=" + heightValue + "')";
        result.style.backgroundSize = widthValue + "px " + heightValue + "px";
    }

    // Clean this
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

        if (zoomActive && zoomInitialized.current) {
        
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
            // let lensTop = y + imageData.top + scrollY > 64 ? y + imageData.top + scrollY > 64 : 64;
            
            lens.style.top = (y + imageData.top + scrollY) + 'px';
        
            /* Display what the lens "sees": */
            let resultX = x * cx;
            let resultY = y * cy;
            //console.log(`resultX: ${resultX} and resultY: ${resultY}`)
            result.style.backgroundPosition = "-" + resultX + "px -" + resultY + "px";
            //stabilize the zoom result on scroll
            result.style.top = (192 + scrollY) + 'px';
            
            // Set a threshold for card to disappear behind nav when scrolled.
            // Hard line is 64, but moved lower for some tolerance
            if (y + imageData.top <= 64) {
                //lens.style.visibility = "hidden";
                //result.style.visibility = "hidden";
                zoomInitialized.current = false
                setZoomActive(false)
            }
        } else {
            // Check if the mouse pointer has moved enough relative two 64 + 2em
            if (imageData.top < 0 && imageData.top + pos.y >= 86) {
                setZoomActive(true)
            }
        }
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


    return(
        <div className="image-gallery">
            {zoomActive?<div id="ImageZoom" style= {{visibility:"hidden"}} className="image-zoom"></div>:null}
            <div className = "central-image" onMouseLeave={handleMouseLeave} >
                {zoomActive?<div id="ZoomLens" style={{visibility:"hidden"}} className="zoom-lens" onMouseMove={moveLens}></div>:null}
                <img id="centralImage" className="current-image" src={primarySource} onMouseMove={moveLens}  />
            </div>
            <ImageGrid sku ={props.sku} config={props.config} source={props.source} setcurrentimage={(data)=> {props.setprimaryimage(data)}}/>  
        </div>
    );
}