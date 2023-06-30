import React from 'react';
import '../style/BuilderWorkspace.scss';

export default function BuilderWelcome(props) {
    return (
        <div className="workspace-body">
            <div className="welcome-container">
                <h1>Welcome to the Style Guide Builder!</h1>
                <p>This builder is an interface designed to assist in building
                both a Style Guide formula and Sku Name Builders as well as the handling
                of and interaction with Sku Name Builder. Please note: these assets are
                stored locally and must be exported to a centralized storage through a
                different interface.</p>
                <p>Button Overview:</p>
                <ul>
                    <li><b>Import Asset: </b>Loads asset from locally stored JSON</li>
                    <li><b>New Style Guide: </b>Creates blank template Style Guide</li>
                    <li><b>Clear Builder: </b>Resets Style Guide Builder (Should be done prior to importing an asset or creating blank asset)</li>
                    <li><b>Run Validation: </b>Validates whether current asset contains errors</li>
                    <li><b>Expose Assets: </b>Exposes the Style Guide Formula and the Sku Name Generator Assets for external use</li>
                    <li><b>Export Formula: </b>Exports Style Guide Formula to local storage</li>
                    <li><b>Export Builder: </b>Exports Sku Name Builder to local storage</li>
                    <li><b>Export Assets: </b>Exports both assets to local storage</li>
                    <li><b>Delete Current Style Guide: </b>Deletes assets for loaded class</li>
                </ul>
                <p>Formula Card Overview:</p>
                <ul>
                    <li><b>String Card: </b>Provides input for a static string of characters</li>
                    <li><b>Attribute Card: </b>Provides inputs for an attribute call</li>
                    <li><b>Conditional Card: </b>Provides inputs for an attribute call with conditional logic</li>
                </ul>
                <p>Logic Types Overview</p>
                <ul>
                    <li><b>If (SpecAttribute-Expected Value): </b>Returns true in the case where the called attribute is equal to expected value(s), if not returns false and moves to next case</li>
                    <li><b>Else (SpecAttribute): </b>Provides true in all cases where a value exists, never returns false</li>
                    <li><b>If Not (SpecAttribute-Expected Value): </b>Returns true in the case where the called attribute is not equal to expected value(s), if not returns false and moves to next case</li>
                    <li><b>If Blank (SpecAttribute): </b>Returns a null value, which throws an error on the case, if not returns false and moves to next case</li>
                    <li><b>Includes (SpecAttribute-Expected Value): </b>Returns true in the case where the expected value is found within the called attribute, if not returns false and moves to next case</li>
                    <li><b>Equals (Attribute Value-Attribute Value): </b>Returns true in the case where the called attribute is equal to secondary called attribute (Please note: expected values are treated as attribute calls), if not returns false and moves to next case</li>
                    <li><b>Not Equals (Attribute Value-Attribute Value): </b>Returns true in the case where the called attribute is not equal to secondary called attribute (Please note: expected values are treated as attribute calls), if not returns false and moves to next case</li>
                    <li><b>Contains (Attribute Value-Attribute Value): </b>Returns true in the case where the secondary called attribute (Expected) is found within the primary called spec (Attribute), if not returns false and moves to next case</li>
                </ul>
                <p>Important Notes:</p>
                <ul>
                    <li>Expected values should be separated by && (please note: best practice is with no spaces added)</li>
                    <li>Conditional calls must have a return object on end case</li>
                    <li>Including attribute calls in else statements are best practice</li>
                    <li>If/Else statement is recommended in two-option conditional vs. If/If statement (Note: there are cases where If/If statement is necessary)</li>
                    <li>Validation must be run prior to exposing or exporting assets</li>
                </ul>
            </div>
        </div>
    )
}