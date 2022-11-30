require("regenerator-runtime/runtime");
require("core-js/stable");
import React from 'react';
import ReactLoading from 'react-loading';
import './style/legacy.scss'
import BlankNavbar from '../blank-nav'


export default class LegacyInterface extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            skuset : [],
            config : {}
        }
    }

    async componentDidMount() {
        const data = await window.api.invoke("request-skuset");
        const _config = await window.api.invoke("fetch-configuration");
        this.setState({
            skuset: data,
            config: _config
        })
    }

    render() {
        return (
            <>
                <BlankNavbar />
                <div className="legacy-view">
                    <LegacySkuTable {...this.props} skuset={this.state.skuset} config={this.state.config} />
                </div>
            </>
        );
    }
}

function LegacySkuTable(props) {
    const [rows, setRows] = React.useState([]);
    const [headRows, setHeadRows] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true);
    const imgsource = "https://www.staples-3p.com/s7/is/image/Staples/";

    React.useEffect(()=>{
        let SkuRows = [];
        let skuset = props.skuset;

        if (skuset.length > 0) {
            let tableColumns = props.config["Functional Data"]["Legacy Table Columns"];
            let imageCalls = props.config["Excel Mapping"]["Image Set"];

            SkuRows.push(skuset.map((sku, index)=> {
                let columns = [];
                
                tableColumns.forEach((value, i)=>{
                    if (imageCalls.includes(value)) {
                        columns.push(
                            <td key={"row"+index+ "col"+i}>
                                {sku[value]
                                ? <img src={imgsource + sku[value]} />
                                : ""}
                            </td>
                        )
                    } else {
                        columns.push(
                            <td key={"row"+index+ "col"+i} dangerouslySetInnerHTML={{__html:sku[value] ? sku[value]: ""}}></td>
                        )
                    }
                })

                columns.unshift(
                    <td key={"button" + index}>
                        <button className="open-button"
                            onClick={() => props.changeViewWithFocus('main', index)}>Open</button>
                    </td>
                )

                return(
                    <tr key={"Row" + index}>
                        {columns}
                    </tr>
                )
            }))

            let thead = tableColumns.map((value, index)=>{
                return (
                    <th key={"header-"+index}>
                        {value}
                    </th>
                )
            })

            thead.unshift(<th key={"button-header"}>Open in Main View</th>)
    
            let theadRow = (<tr>{thead}</tr>)

            setHeadRows(theadRow)
            setRows(SkuRows);
            setIsLoading(false);
        }
        
    }, [props.skuset])

    return (
        <div className="legacy-table-container">
            {isLoading
            ?<ReactLoading className="react-loader" type={"bars"} color={"gray"} width={"10em"} height={"10em"} />
            : <table>
                <thead>
                    {headRows}
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            }  
        </div>
    )
}