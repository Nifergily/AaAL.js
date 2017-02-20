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

OutputWindowLength = 16;

function MakeHeader ( Headers )
{
  Res = "<tr><th>&nbsp;</th>";
  for ( i = 0; i < Headers.length; ++i )
    if ( Headers[i] == "_" )
      Res += "<th><span style=\"font-family:times new roman, serif;\">Λ</span></th>";
    else
      Res += "<th>" + Headers[i] + "</th>";
  return Res + "<tr>";
}

function GetHeaderCollumn ( Headers, CurrentChar )
{
  for ( i = 0; i < Headers.length; ++i )
    if ( Headers[i] == CurrentChar || Headers[i] == "_" && CurrentChar == " " )
      return i;
  return -1;
}

function MTRunOnce ()
{
  var RulesMaxQty = 50;
  var Res = false;
  var Executed = 0;
  var Code  = document.getElementById ("MTCodeArea").value.split ( "\n" );
  var Word  = document.getElementById ("MTInput").value;
  var State = document.getElementById ("MTState").value * 1;
  var Pos   = document.getElementById ("MTPos").value * 1;
  var Rules = new Array ();
  var TerminalRule = false;
  var pos;
  var alpha, betha;
  var c;

  R = 0;
  for ( i = 0; i < Code.length && i < RulesMaxQty; ++i )
  {
    var tmp  = Code[i];
    var Rule = "";
    var Spacer = true;
    for ( j = 0; j < tmp.length; ++j )
    {
      // Clean spacers
      c = tmp.substr(j,1);
      if ( c != " " && c != "\t" || !Spacer )
        if ( c != "\n" && c != "\r" )
          Rule += c;
      Spacer = c == " " || c == "\t";
    }
    if ( 0 < Rule.length )
      Rules[R++] = Rule;
    else
      document.getElementById ("MTErrorMsg").innerHTML += ( i + 1 ) + ": пустая строка\n";
  }

  if ( 0 < R )
  {
    // Print table header
    Headers = Rules[0].split ( " " );
    Header  = MakeHeader ( Headers );
    if ( State == -1 )
      // Only initial draw, no performance
      State = 0;
    else if ( 1 < R )
    {
      i = 1;
      Executed = false;
      while ( i < R && !Executed )
      {
        Line = Rules[i].split ( " " );
        LineState = 1 * Line[0];
        if ( State == LineState )
        {
          if ( Word == "" ) Word = " ";
          CurrentChar = Word.substr (Pos,1);
          Collumn = GetHeaderCollumn ( Headers, CurrentChar );
          if ( 0 <= Collumn )
          {
            Operations = Line[Collumn+1].split (",");
            NewChar    = Operations[0];
            if ( NewChar.length > 1 ) {
              document.getElementById ("MTErrorMsg").innerHTML += i + "." + (Collumn+1) + ": Попытка записи более одного символя в ячейку.\n";
              NewChar = NewChar[0]
            }

            if ( NewChar == "_" ) NewChar = " ";
            if ( Operations[2] != "" )
              if ( Operations[2] == "!" )
                TerminalRule = true;
              else
                State  = Operations[2] * 1;
            Direction  = Operations[1];

            if ( Direction == "L" || Direction == "l" )
            {
              if ( Pos == Word.length - 1 && 0 < Pos && ( NewChar == " " || NewChar == "" && CurrentChar == " " ))
              {
                Word = Word.substr (0, Pos);
                --Pos;
              }
              else
              {
                if ( Pos == 0 )
                {
                  if ( Word != " " )
                  {
		    if ( NewChar != " " && NewChar != ""  )
                      Word = " " + NewChar + Word.substr (Pos + 1, Word.length - Pos + 1);
                    else
                      Word = " " + Word;
                  }
                }
                else
                {
                  if ( NewChar != "" )
                    Word = Word.substr (0, Pos) + NewChar + Word.substr (Pos + 1, Word.length - Pos + 1);
                  --Pos;
                }
              }
            }
            else if ( Direction == "R" || Direction == "r" )
            {
              if ( Pos == 0 && ( NewChar == " " || NewChar == "" && CurrentChar == " " ) )
              {
                Word = Word.substr (1, Word.length - 1);
              }
              else
              {
                if ( NewChar != "" )
                {
                  Word = Word.substr (0, Pos) + NewChar + Word.substr (Pos + 1, Word.length - Pos + 1);
                }
                if ( Pos == Word.length - 1 )
                  Word += " ";
                ++Pos;
              }
            }
            else if ( Direction == "N" || Direction == "n" )
            {
              if ( NewChar == " " ) NewChar = "_";
              if ( NewChar != "" )
                Word = Word.substr (0, Pos) + NewChar + Word.substr (Pos + 1, Word.length - Pos + 1);
            }
            else
            {
              MTErrorMsg.innerHTML += "Ошибочная запись функции перехода.\n";
              return 0;
            }
            Executed = true;
          }
        }
        ++i;
      }
    }
  }

  Table = "";
  for ( i = 1; i < Rules.length; ++i )
  {
    Line = Rules[i].split ( " " );

    if ( 0 < Line.length )
    {
      LineState = 1 * Line[0];

      if ( LineState == State )
        Table += "<tr valign=top style=\"background-color:#e0f0e0;\">"
      else
        Table += "<tr valign=top>";
      Table += "<td align=right>" + LineState + "&nbsp;</td>";

      for ( j = 1; j < Line.length && j <= Headers.length; ++j )
      {
        CurChar = Word.substr(Pos,1);
        if ( LineState == State && ( CurChar == Headers[j-1] || CurChar == " " && Headers[j-1] == "_" ) )
          Table += "<td align=center style=\"background-color:#f0aaaa;\">&nbsp;" + Line[j] + "&nbsp;</td>";
        else
          Table += "<td align=center>&nbsp;" + Line[j] + "&nbsp;</td>";
      }

      for ( j = j; j <= Headers.length; ++j )
        Table += "<td>&nbsp;</td>";

      Table += "</tr>";
      ++R;
    }
  }
  document.getElementById ("MTInput").value   = Word;;
  document.getElementById ("MTParsedCode").innerHTML = "<table>" + Header + Table + "</table>";
  document.getElementById ("MTState").value = State;
  document.getElementById ("MTPos").value   = Pos;

  if ( TerminalRule ) return 2;
  if ( Executed )     return 1;
  return 0;
}

function MTRun ()
{
  var MaxExecution = 10000;
  var ExecutionCount = 0;
  var Applicable = true;

  MTReset ();
  document.getElementById ("MTErrorMsg").innerHTML = "";
  while ( MTRunOnce () == 1 && ExecutionCount < MaxExecution )
  {
    ShowOutput ();
    ++ExecutionCount;
  }
  MTReset ();
  if ( ExecutionCount == MaxExecution )
    document.getElementById ("MTErrorMsg").innerHTML += "Превышено время выполнения.\n";
  else
    document.getElementById ("MTErrorMsg").innerHTML += "Выполнение завершено.\n";
}

function MTStep ()
{
  var MTErrorMsg = document.getElementById ("MTErrorMsg");
  r = MTRunOnce();
  if ( r == 2 )
  {
    MTReset ();
    MTErrorMsg.innerHTML += "Выполнен переход в финальное состояние.\nРабота завершена.\n";
  }
  else if ( r == 1 ) MTErrorMsg.innerHTML += "Выполнен переход в состояние " + document.getElementById ("MTState").value + ", слово:'"+ document.getElementById ("MTInput").value +"'.\n";
  else MTErrorMsg.innerHTML += "Ошибка выполнения. Отсутствует соответствующая функция перехода.\n";
  ShowOutput ();
}

function MTLoadAlg ( Word, Alg )
{
  document.getElementById ("MTInput").value        = Word;
  document.getElementById ("MTCodeArea").value     = Alg;
  MTReset ();
  document.getElementById ("MTErrorMsg").innerHTML = "Загружена запись алгоритма.\n";
}

function ShowOutput ( Pos )
{
  var Input  = document.getElementById ("MTInput").value;
  var Output = document.getElementById ("MTOutput");
  var Pos    = document.getElementById ("MTPos").value * 1;
  if ( Input.length == 0 ) Input = " ";
  OutStr = "<table cellspacing=0 width=100%><tr><td align=right width=50%><table><tr><th>...</th>";
  for ( i = 0; i < Pos && i < Input.length ; ++i )
  {
    if ( Pos - i < OutputWindowLength )
    {
      c = Input.substr (i,1);
      if ( c == " " ) c = "_";
      OutStr += "<th>" + c + "</th>";
    }
  }
  c = Input.substr (i,1);
  if ( c == " " ) c = "_";
  OutStr += "</tr></table></td><td width=5><table cellspacing=0><tr><th style=\"background-color:#e0f0e0;\">" + c + "</th></tr></table></td><td align=left`><table><tr>";
  for ( i = Pos + 1; i < Input.length; ++i )
  {
    if ( i - Pos < OutputWindowLength )
    {
      c = Input.substr (i,1);
      if ( c == " " ) c = "_";
      OutStr += "<th>" + c + "</th>";
    }
  }
  OutStr += "<th>...</th></tr></table>";
  Output.innerHTML = OutStr;
}

function MTReset ()
{
  document.getElementById ("MTErrorMsg").innerHTML = "";
  document.getElementById ("MTState").value = -1;
  document.getElementById ("MTPos").value = 0;
  MTRunOnce ();
  ShowOutput ();
}
