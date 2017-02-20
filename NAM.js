if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function HighLightCode ( Code, Line )
{
  var Area = document.getElementById ("ParsedCode");
  var Alpha, Betha, Arrow, Dummy;
  Dummy = "<table width=100% cellspacing=0>";
  for ( i = 0; i < Code.length; ++i )
  {
    var Rule = Code[i];
    var pos = Rule.indexOf ( "->" );
    var BGCol = " ";
    if ( i == Line ) BGCol += " style=\"background-color:#c0c0d0;\"";

    if ( pos < 0 ) pos = Rule.indexOf ( "=>" );
    if ( 0 <= pos )
    {
      Alpha = Rule.substr ( 0, pos );
      Arrow = Rule.substr ( pos, 2 );
      if ( Arrow == "->" ) Arrow = "&#8594"; else Arrow = "↦";
      Betha = Rule.substr ( pos + 2, Rule.length - pos - 2 );
    }
    Dummy += "<tr valign=top {0}><td {0} align=right>{1}.</td><td {0} align=right>{2}</td><td {0} align=center>{3}</td><td {0} align=left>{4}</td></tr>".format(BGCol,i+1,Alpha,Arrow,Betha);
  }
  Dummy += "</table>";
  Area.innerHTML = Dummy;
}

function RunOnce ()
{
  var RulesMaxQty = 50;
  var Res = false;
  var Executed = 0;
  var Code = document.getElementById ("CodeArea").value.split (/\n/);
  var Word = document.getElementById ("Word").value;
  var Rules = new Array ();
  var TerminalRule;
  var pos;
  var alpha, betha;
  var c;

  R = 0;
  for ( i = 0; i < Code.length && i < RulesMaxQty; ++i )
  {
    var tmp = Code[i];
    var Rule = "";
    for ( j = 0; j < tmp.length; ++j )
    {
      c = tmp.substr(j,1);
      if ( c != " " && c != "\t" ) Rule += c;
    }
    if ( 0 < Rule.length )
    {
       if ( Rule.indexOf ( "->" ) < 0 && Rule.indexOf ( "=>" ) < 0 )
         document.getElementById ("ErrorMsg").innerHTML += ( i + 1 ) + ": пропущен знак правила.\n";
       else
       {
         Rules[R] = Rule;
         ++R;
       }
    }
    else
      document.getElementById ("ErrorMsg").innerHTML += ( i + 1 ) + ": пустая строка.\n";
  }

  i = 0;
  TotalRules = R <= 32 ? R : 32;
  TerminalRule = false;
  while ( Executed == 0 && i < TotalRules && !TerminalRule )
  {
    TerminalRule = false;
    Rule = Rules[i];
    if ( 0 <= ( pos = Rule.indexOf ( "->" ) ) )
    {
      alpha = Rule.substr ( 0, pos );
      betha = Rule.substr ( pos + 2, Rule.length - pos - 2 );
      if ( 0 <= Word.indexOf (alpha) )
      {
        document.getElementById ("Word").value = Word.replace ( alpha, betha );
        Executed = i + 1;
      }
    }
    else if ( 0 <= ( pos = Rule.indexOf ( "=>" ) ) )
    {
      alpha = Rule.substr ( 0, pos );
      betha = Rule.substr ( pos + 2, Rule.length - pos - 2 );
      if ( 0 <= Word.indexOf (alpha) )
      {
        document.getElementById ("Word").value = Word.replace ( alpha, betha );
        TerminalRule = true;
        Executed = i + 1;
      }
    }
    if ( Executed ) HighLightCode ( Rules, i );
    ++i;
  }
  return ( Executed != 0 && !TerminalRule ) ? Executed : 0;
}

function Run ()
{
  var MaxExecution   = 1000;
  var ExecutionCount = 0;
  var Applicable     = true;

  document.getElementById ("ErrorMsg").innerHTML = "";
  while ( RunOnce () && ExecutionCount < MaxExecution ) { ++ExecutionCount; }
  if ( ExecutionCount == MaxExecution )
    document.getElementById ("ErrorMsg").innerHTML += "Превышено время выполнения.\n";
  else
    document.getElementById ("ErrorMsg").innerHTML += "Выполнение завершено.\n";
}

function Step ()
{
  var ErrorMSg = document.getElementById ("ErrorMsg");
  if ( r = RunOnce() ) ErrorMSg.innerHTML += "Правило " + r + " применено.\n";
  else ErrorMSg.innerHTML = "Ни одно правило не применено, либо выполнено терминальное правило.\n";
}

function LoadAlg ( Word, Alg )
{
  document.getElementById ("ErrorMsg").innerHTML = "Загружена запись алгоритма.\n";
  document.getElementById ("Word").value = Word;
  document.getElementById ("CodeArea").value = Alg;
  document.getElementById ("ParsedCode").innerHTML = "<table width=100%><tr><td> </td></tr></table>";
}
