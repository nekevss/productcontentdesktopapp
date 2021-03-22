{
    class: value,
    returnGenerator : [ ---> queryGenerator??
	{
	    type: if || else || includes || error,
		call? :  value,
		nestedType : null || AND || OR,
	    ifCalled? : ["value"],
	    errorMessage? : "string",
	    thenReturn : {generator0}
	},
	{
	    type: if || else || includes || error,
	    call : { callType: null || OR || AND, spec : value},
	    ifCalled : ["value"],
	    thenReturn : {generator n+1}
	}
    ]
}

//reporting should always be true by default
//its whether to display or not
funcNum : {
	report: true || false
	stucture : stack || Tree,
	call: value
	conditional : [
	    {
			call: value,
			expectedValue: value,
			type: if || else || includes || ifNot
			nestedType: null || AND //--> or should just be another conditinal
			conditional? : [{
				type: if || ifNot || INCLUDES
				secondarySpec: value
				valueNeeded
			}]
			thenReturn : {
					call: value
					functionName:
					args:
					string:
					endString:
				}
	    }
	]
	endString? : value-to-concatenate
}

let SG_StructureOverview = {
	"top level": "Init Card",
	returnGenerator: [
		first-level: "Data",
		thenReturn: {
			"Second Level" : "blah",
			"conditional-spec" : [
				"Third-Level"
			]
		}
	]
}

let ex = { "class": "Pens", 
"returnGenerator" : [
	{
		"type" : "if", 
		"call" : {"callType" : null, "spec" : "Pen Type"}, 
		"ifCalled" : ["Fountain", "Calligraphy"], 
		"thenReturn" :  {"spec1" : "Brand", "string2" : " ", "spec3" : "Series or Collection", "string4" : " ", "spec5" : "Retractable", "string6" : " ", "spec7" : "Pen Type", "string8" : " Pen, ", "spec9" : "Pen Point Size", "string10" : " Nib, ", "spec11" : "True Color", "string12" : ", ", "spec13" : "Pen Pack Size", "string14" : " (", "spec15" : "Manufacturer Model #", "string16" : ")"}
	}, 
	{
		"type" : "if", 
		"call" : {"callType" : null, "spec" : "Pen Type"}, 
		"ifCalled" : ["Refill"], 
		"thenReturn" :  {"spec1" : "Brand", "string2" : " ", "spec3" : "Series or Collection", "string4" : " ", "spec5" : "Refill Type", "string6" : " Pen Refill, ", "spec7" : "Point Type", "string8" : " Point, ", "spec9" : "Ink Color", "string10" : " Ink, ", "spec11" : "Pen Pack Size", "string12" : " (", "spec13" : "Manufacturer Model #", "string14" : ")"}
	}, 
	{
		"type" : "if", 
		"call" : {"callType" : null, "spec" : "Pen Type"}, 
		"ifCalled" : ["Stylus & Smart Pens"], 
		"thenReturn" :  {"spec1" : "Brand", "string2" : " ", "spec3" : "Series or Collection", "string4" : " ", "spec5" : "Pen Type", "string6" : " Pen, ", "spec7" : "True Color", "string8" : ", ", "spec9" : "Pen Pack Size", "string10" : " (", "spec11" : "Manufacturer Model #", "string12" : ")"}
	}, 
	{
		"type" : "else", 
		"thenReturn" :  {
			"spec1" : "Brand", 
			"string2" : " ", 
			"spec3" : "Series or Collection", 
			"string4" : " ", 
			"func5" : {
				"report": true,
				"forSpec" : "Retractable",
				"conditions": [
					{
						"call" : "Retractable",
						"expectedValue" : "Yes",
						"nestedType" : "AND",
						"conditional" : [
							{
								"type": "if",
								"call" : "Erasable",
								"expectedValue" : "Yes",
								"nestedType" : null,
								"thenReturn" : {
									"string" : ""
								}
							},
							{
								"type" : "else",
								"thenReturn" : {
									"string" : "Retractable"
								}
							}
						]
					}
				]
			}, 
			"string6" : " ", 
			"func7" : {
				"report" : true,
				"forSpec" : "Erasable",
				"conditions" : [
					{
						"type": "if",
						"call" : "Erasable",
						"expectedValue" : "Yes",
						"nestedType" : null,
						"thenReturn" : {
							"string" : "Erasable"
						}
					},
					{
						"type" : "else",
						"thenReturn" : {
							"string" : ""
						}
					}
				]
			},
			"string8" : " ", 
			"spec9" : "Pen Type", 
			"string10" : " Pen, ", 
			"spec11" : "Point Type", 
			"string12" : " Point, ", 
			"spec13" : "Ink Color", 
			"string14" : " Ink, ", 
			"func15" : {
				"report" : true,
				"forSpec" : "Pen Pack Size",
				"conditions" : [
					{
						"type": "ifNot",
						"call" : "Pen Pack Size",
						"expectedValue" : "Each",
						"nestedType" : null,
						"thenReturn" : {
							"functionName" : "returnSpec",
							"args" : {
								"call" : "Pen Pack Size"
							},
							"endString" : ""
						}
					},
					{
						"type" : "else",
						"thenReturn" : {
							"string" : ""
						}
					}
				]
			}, 
			"string16" : " (", 
			"spec17" : "Manufacturer Model #", 
			"string18" : ")",
//NOTE: If Erasable and Retractable = Yes, remove Retractable from the SKU Name


"func5" : {"report": true,"forSpec" : "Retractable","conditions": [{"call" : "Retractable","expectedValue" : "Yes","nestedType" : "AND","conditional" : [{"type": "if","call" : "Erasable","expectedValue" : "Yes","nestedType" : null,"thenReturn" : {"string" : ""}},{"type" : "else","thenReturn" : {"string" : "Retractable"}}]}]}, 




"func7" : {"report" : true,"forSpec" : "Erasable","conditions" : [{"type": "if","call" : "Erasable","expectedValue" : "Yes","nestedType" : null,"thenReturn" : {"string" : "Erasable"}},{"type" : "else","thenReturn" : {"string" : ""}}]},


"func15" : {"report" : true,"forSpec" : "Pen Pack Size","conditions" : [{"type": "ifNot","call" : "Pen Pack Size","expectedValue" : "Each","nestedType" : null,"thenReturn" : {"functionName" : "returnSpec","args" : {"call" : "Pen Pack Size"},"endString" : ""}},{"type" : "else","thenReturn" : {"string" : ""}}]}, 