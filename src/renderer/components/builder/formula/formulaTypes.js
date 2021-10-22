export let formulaTypes = {
    "if": {
        operand: " = ",
        parentOp: " ",
        conditionJoinClause: " || ",
        returnGenJoinClause: '", "'
    },
    "ifNull": {
        operand: " is null",
        parentOp: " null ",
        conditionJoinClause: " || ",
        returnGenJoinClause: '", "'
    },
    "ifNot": {
        operand: " != ",
        parentOp: " not ",
        conditionJoinClause: " || ",
        returnGenJoinClause: '", "'
    },
    "includes": {
        operand: " includes ",
        parentOp: " includes ",
        conditionJoinClause: " || ",
        returnGenJoinClause: '", "'
    },
    "equals": {
        operand:  " = ",
        parentOp: " equal to ",
        conditionJoinClause: "&gt; or &lt;",
        returnGenJoinClause: "$gt;, &lt;"
    },
    "notEquals": {
        operand: " != ",
        parentOp: " not equal to ",
        conditionJoinClause: "&gt; or &lt;",
        returnGenJoinClause: "&gt; or &lt;"
    },
    "contains": {
        operand: " contains ",
        parentOp: " contains ",
        conditionJoinClause: "&gt; or &lt;",
        returnGenJoinClause: "&gt; or &lt;"
    },
    "else": {
        operand: " = All Other Values",
        parentOp: " All Other Values",
    },
}