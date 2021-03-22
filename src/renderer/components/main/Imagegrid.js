import React from 'react'


//update somebody to functional with hooks
export default function ImageGrid(props) {
    const [images, setImages] = React.useState([])

    React.useEffect(()=>{
        let imageSet = [];
        let imageCalls = props.config["Excel Mapping"]["Image Set"];
        imageCalls.forEach((value, index)=>{
            if (props.sku[value]) {
                imageSet.push(<GridImage key={"GridImage"+index} {...props} thisImage={props.source + props.sku[value]} />)
            }
        })
        setImages(imageSet)
    }, [props.sku])


    return (
        <div className = "ImageGrid">
            {images}
        </div>
    );
}

function GridImage(props) {

    const handleImageClick = () => {
        props.setcurrentimage(props.thisImage);
    }

    //assume primary image is always not null too match loading into central grid
    return (
        <div className= "gridimage-box">
            <img className = "gridimage" title={props.thisImage} src={props.thisImage} onClick = {() => handleImageClick()} />
        </div>
    )
}