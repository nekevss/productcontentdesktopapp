export let formulaTypes = {
    "if": {
        operand: " = ",
        conditionJoinClause: ", ",
        returnGenJoinClause: '", "'
    },
    "ifNot": {
        operand: " is null",
        conditionJoinClause: ", ",
        returnGenJoinClause: '", "'
    },
    "ifNull": {
        operand: " != ",
        conditionJoinClause: ", ",
        returnGenJoinClause: '", "'
    },
    "includes": {
        operand: " includes ",
        conditionJoinClause: ", ",
        returnGenJoinClause: '", "'
    },
    "equals": {
        operand:  " = ",
        conditionJoinClause: "&gt; or &lt;",
        returnGenJoinClause: "$gt;, &lt;"
    },
    "notEquals": {
        operand: " != ",
        conditionJoinClause: "&gt; or &lt;",
        returnGenJoinClause: "&gt; or &lt;"
    },
    "contains": {
        operand: " contains ",
        conditionJoinClause: "&gt; or &lt;",
        returnGenJoinClause: "&gt; or &lt;"
    },
    "else": {
        operand: " = All Other Values"
    },
}