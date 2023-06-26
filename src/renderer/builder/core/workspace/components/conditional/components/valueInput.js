import React from 'react';
import '../Conditional.scss';

export default function ValueInput(props) {
    const [thisCondition, setThisCondition] = React.useState(props.thisCondition);
    const [expectedValuesString, setExpectedValuesString] = React.useState("");

    React.useEffect(()=>{
        setThisCondition(props.thisCondition);
        //const
        const expected = props.thisCondition.expectedValue
        let expectedJoined = expected.join("&&");
        setExpectedValuesString(expectedJoined);
    }, [props.thisCondition])

    const handleExpectedValuesChange = (event) => {
        let _condition = thisCondition;
        const regex = /\s\&\&\s/g;
        const regex2 = /\&\&/g;
        let val = event.target.value;
        let expectedSplit = regex.test(val) ? val.split(regex) : regex2.test(val) ? val.split(regex2) : [event.target.value];
        _condition.expectedValue = expectedSplit
        setExpectedValuesString(event.target.value);
        setThisCondition(_condition);
        props.updateValidationState("none");
    }

    return (
        <div className="input-row-node input">
            <div className="values-title">Expected:</div>
            <input value={expectedValuesString} onChange={handleExpectedValuesChange} placeholder="Enter Expected Values Here" />
        </div>
    )
}