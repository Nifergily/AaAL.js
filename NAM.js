// pythonic "".format
// TODO: ECMAScript 2015 defines template strings
// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/template_strings
// https://habrahabr.ru/post/313526/
// Browser support seems pretty good
if (!String.prototype.format) {
    String.prototype.format = function() {
        let args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}

function loadAlg(word, alg)
{
    document.getElementById("ErrorMsg").innerHTML = "Загружена запись алгоритма.\n";
    document.getElementById("Word").value = word;
    document.getElementById("CodeArea").value = alg;
    document.getElementById("ParsedCode").innerHTML = "<table width=100%><tr><td> </td></tr></table>";
}

function highlightCode(code, line)
{
    let area = document.getElementById("ParsedCode");
    let alpha, betha, arrow, dummy;
    dummy = "<table width=100% cellspacing=0>";
    for (i = 0; i < code.length; ++i)
    {
        let rule = code[i];
        let pos = rule.indexOf("->");
        let BGCol = " ";
        if (i == line) BGCol += " style=\"background-color:#c0c0d0;\"";

        if (pos < 0) pos = rule.indexOf( "=>" );
        if (0 <= pos)
        {
            alpha = rule.substr(0, pos);
            arrow = rule.substr(pos, 2);
            if (arrow == "->") arrow = "&#8594"; else arrow = "↦";
            betha = rule.substr(pos + 2, rule.length - pos - 2);
        }
        dummy += "<tr valign=top {0}><td {0} align=right>{1}.</td><td {0} align=right>{2}</td><td {0} align=center>{3}</td><td {0} align=left>{4}</td></tr>".format(BGCol, i+1, alpha, arrow, betha);
    }
    dummy += "</table>";
    area.innerHTML = dummy;
}

function runOnce()
{
    let rulesMaxQty = 50;
    let res = false;
    let executed = 0;
    let code = document.getElementById("CodeArea").value.split(/\n/);
    let word = document.getElementById("Word").value;
    let rules = new Array();
    let terminalRule;
    let pos;
    let alpha, betha;
    let c;

    R = 0;
    for (let i = 0; i < code.length && i < rulesMaxQty; ++i)
    {
        let tmp = code[i];
        let rule = "";
        for (let j = 0; j < tmp.length; ++j)
        {
            c = tmp.substr(j, 1);
            if (c != " " && c != "\t") rule += c;
        }
        if (0 < rule.length)
        {
            if (rule.indexOf ("->") < 0 && rule.indexOf ("=>") < 0)
                document.getElementById("ErrorMsg").value += (i + 1) + ": пропущен знак правила.\n";
            else
            {
                rules[R] = rule;
                ++R;
            }
        }
        else
            document.getElementById("ErrorMsg").value += (i + 1) + ": пустая строка.\n";
    }

    i = 0;
    totalRules = R <= 32 ? R : 32;
    terminalRule = false;
    while (executed == 0 && i < totalRules && !terminalRule)
    {
        terminalRule = false;
        rule = rules[i];
        if (0 <= (pos = rule.indexOf("->")))
        {
            alpha = rule.substr(0, pos);
            betha = rule.substr(pos + 2, rule.length - pos - 2);
            if (0 <= word.indexOf(alpha))
            {
                document.getElementById("Word").value = word.replace(alpha, betha);
                executed = i + 1;
            }
        }
        else if (0 <= (pos = rule.indexOf("=>")))
        {
            alpha = rule.substr(0, pos);
            betha = rule.substr(pos + 2, rule.length - pos - 2);
            if ( 0 <= word.indexOf(alpha))
            {
                document.getElementById("Word").value = word.replace(alpha, betha);
                terminalRule = true;
                executed = i + 1;
            }
        }
        if (executed) highlightCode(rules, i);
        ++i;
    }
    return (executed != 0 && !terminalRule) ? executed : 0;
}

function run()
{
    let maxExecutions  = 1000;
    let executionCount = 0;
    let Applicable     = true;

    let errorMessage = document.getElementById("ErrorMsg");
    errorMessage.value = "";
    while (runOnce() && (executionCount < maxExecutions)) { ++executionCount; }
    if (executionCount == maxExecutions)
        errorMessage.value += "Превышено время выполнения.\n";
    else
        errorMessage.value += "Выполнение завершено.\n";
}

function makeStep()
{
    let errorMessage = document.getElementById("ErrorMsg");
    if (r = runOnce())
        errorMessage.value += "Правило " + r + " применено.\n";
    else
        errorMessage.value = "Ни одно правило не применено, либо выполнено терминальное правило.\n";
}

