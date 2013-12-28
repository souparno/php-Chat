// PHP Script Chat - http://coursesweb.net/

var chatuserset = 0;        // used to check if chat user name is set
var logoutchat = 0;          // if set 1, user leaves the chat, to remove it from Online list
var chatroom = document.getElementById('chatroom') ? document.getElementById('chatroom').value : document.getElementById('s_room').innerHTML;        // store chat room
var callphp = 0;             // number of seconds till access frequently "setchat.php"
var nrchatusers = 1;         // store number of chat users online
var setchat = 'chatfiles/setchat.php';           // file accesed when add chat, or actualise user
var getchat = function() {return 'chattxt/'+chatroom+'.txt';};        // TXT file with chat content of current room
var ajxsend = 0;                                 // to control accessing Ajax 
var lastaddedc = 1;                                // stores Timestamp of last added chat
var playbeep = 2;                                // if 1 not beep, if 2 beep
var beepfile = 'beep1.wav';                      // the name of WAV file used for beep sound

/** Functions for cookie **/

// Check cookie and return the value
function GetCookie(name) {
  var result = '0';
  var myCookie = " " + document.cookie + ";";      // all the strings for cookie start with space, end with ;
  var searchName = " " + name + "=";      // search for data between 'name' and the next '='
  var startOfCookie = myCookie.indexOf(searchName);
  if (startOfCookie != -1) {      // if found data
    startOfCookie += searchName.length;      // omitte the previous cookie name
    var endOfCookie = myCookie.indexOf(";", startOfCookie);
    result = unescape(myCookie.substring(startOfCookie, endOfCookie));
  }
  return result;
}

// to deleete cookie
function delCookie(name) {
  var aday = 3*24*60*60*1000;
  var expDate = new Date();
  expDate.setTime (expDate.getTime() - aday);
  document.cookie = name + "=deletes; expires=" + expDate.toGMTString();

  // hide field to add texts and shows area to add name /code, or to enter in chat
  if(document.getElementById('name_code')) document.getElementById('name_code').style.display = 'block';
  if(document.getElementById('chatadd')) document.getElementById('chatadd').style.display = 'none';

  logoutchat = 1;       // set to delete the user from list
  chatuserset = 0;     // set not with a name in chat
}

// If no user added in form, calls to get chat user name from cookie
var cookie_namec = (document.getElementById('chatuser') && document.getElementById('chatuser').value.length>1) ? '0' : GetCookie('name_c');

if (cookie_namec!='0' && document.getElementById('name_code')) {
  callphp = 0;         // set "callphp" to 0 to force next ajax access to php file

  // Hides name /code, show field to add text chat
  document.getElementById('name_code').style.display = 'none';
  document.getElementById('chatadd').style.display = 'block';

  // Add cookie value in form to #chatuser
  document.getElementById('chatuser').value = cookie_namec;
  logoutchat = 0;     // set to not delete the user from list
  chatuserset = 1;
}

// If it is set cookie for room
var cookie_roomc = GetCookie('room_c');            // get chat room name from cookie
if (cookie_roomc!='0') {
  var chatrooms = document.getElementById('chatrooms').getElementsByTagName('span');    // Get <span> with chatroom
  
  // Removes "id" from <span> with chatroom, and set this ID to Span with room name from cookie
  for (var i=0; i<chatrooms.length; i++) {
    chatrooms[i].removeAttribute("id");
    if(chatrooms[i].innerHTML == cookie_roomc) chatrooms[i].setAttribute("id", "s_room");
  }
  if(document.getElementById('chatroom')) document.getElementById('chatroom').value = cookie_roomc;      // Change the value of form field for chatroom
  chatroom = cookie_roomc;              // set chat room in variable used for the name of TXT file for current room
}

    /* Function for audio beep */

// If it is set cookie for audio beep, sets playbeep with the value from cookie
var cookie_beepc = GetCookie('beep_c');
if(cookie_beepc !== '0' && document.getElementById('playbeep')) {
  playbeep = cookie_beepc;
  document.getElementById('playbeep').src = 'chatex/playbeep'+playbeep+'.png';
}

// Receives the text with Unix time of last added chat, get and set value for "lastaddedc"
// if "lastaddedc" changed, adds <embed> in #lastaddedc to play
function playBeep(lastchat) {
  if(lastchat != lastaddedc) {
    lastaddedc = lastchat;
    document.getElementById('chatbeep').innerHTML= '<audio autoplay="autoplay" src="chatex/'+beepfile+'" type="audio/wav"><embed src="chatex/'+beepfile+'" hidden="true" autostart="true" loop="false" /></audio>';
  }
}

// sets sound-beep on or off (playbeep 2 or 1), change image for playBeep()
function setPlayBeep(imgset) {
  playbeep = (playbeep == 1) ? 2 : 1;
  imgset.src = 'chatex/playbeep'+playbeep+'.png';

    // Sets data in cookie
    var name_cookie = 'beep_c';
    var val_cookie = playbeep;
    var oned = 48*60*60*1000;      // Cookie expiration, two days in milliseconds
    var expDate = new Date();
    expDate.setTime(expDate.getTime()+oned);

    document.cookie = name_cookie + "=" + escape(val_cookie) + "; expires=" + expDate.toGMTString();     // sets cookie
}

/** Functions for checkings and settings **/

// Check if the name is already used
function checkNameC(name_c) {
  var nameused = 0;
  if(document.getElementById('chatusersli')) {
    var chatusersli = document.getElementById('chatusersli').getElementsByTagName('li');    // gets the list with chat users
    var nrchatusersli = chatusersli.length;

    // Traverse chat users list
    for (var i=0; i<nrchatusersli; i++) {
      if (chatusersli[i].innerHTML.match(/[^\<]+/)==name_c) {
        nameused = 1;
        break;
      }
    }
  }
  return nameused;
}

// Changes chat room
function setChatRoom(room) {
  var chatrooms = document.getElementById('chatrooms').getElementsByTagName('span');    // Get <span> with chatroom
  
  // Removes "id" from <span> with chatroom
  for (var i=0; i<chatrooms.length; i++) {
    chatrooms[i].removeAttribute("id");
  }

  if(document.getElementById('chatroom')) document.getElementById('chatroom').value = room.innerHTML;      // Change the value of form field for chatroom
  chatroom = room.innerHTML;
  room.setAttribute("id", "s_room");      // Add id="s_room" to clicked Span
  document.getElementById('chats').innerHTML = texts.loadroom;
  callphp = 0;         // set "callphp" to 0 to force next ajax access to php file
  lastaddedc += 1      // changes this value to can update text chat

   // Set to register current room name in cookie
  var name_cookie = 'room_c';
  var val_cookie = room.innerHTML;
  var onew = 7*24*60*60*1000;      // Expiration time, one week, in milisecond
  var expDate = new Date();
  expDate.setTime(expDate.getTime()+onew);

  document.cookie = name_cookie + "=" + escape(val_cookie) + "; expires=" + expDate.toGMTString();   // set cookie
}

// return number of chat users online, from the list #chatusersli
function getNrChatUsers(){
  if(document.getElementById('chatusersli')) {
    return document.getElementById('chatusersli').getElementsByTagName('li').length;
  }
  else return 1;
}

// Check name /code, set cookie, show field to add chat
function setNameC(frm) {
  var chatuser = frm.chatuser.value;alert(chatuser[chatuser.length - 1])
  // If name not contains only: Letters, Numbers, Space, dash, and "_", between 2 and 12 characters. Or starts /ends with space
  if (chatuser.match(/^[a-z0-9 _-]{2,12}$/ig) == null || chatuser[0] == ' ' || chatuser[chatuser.length - 1] == ' ') {
    alert(texts.err_name);
    frm.chatuser.focus();
    return false;
  }
  // If incorrect code
  else if (frm.cod.value.length<4 || frm.cod.value!=document.getElementById('code_ch').innerHTML) {
    alert(texts.err_vcode);
    document.getElementById('code_ch').style.color = 'red';
    frm.cod.focus();
    frm.cod.select();
    return false;
  }
  else if (checkNameC(chatuser)==1) {
    alert(chatuser+texts.err_nameused);
    frm.chatuser.select();
  }
  // If correct code and name
  else {
    // Sets data for cookie
    var name_cookie = 'name_c';
    var val_cookie = chatuser;
    var oned = 24*60*60*1000;      // Cookie expiration, one day in milliseconds
    var expDate = new Date();
    expDate.setTime(expDate.getTime()+oned);

    document.cookie = name_cookie + "=" + escape(val_cookie) + "; expires=" + expDate.toGMTString();     // sets cookie
    // Hides name /code, show field to add text chat, delete the code
    document.getElementById('name_code').style.display = 'none';
    document.getElementById('chatadd').style.display = 'block';
    frm.cod.value = '';
    logoutchat = 0;     // set to not delete the user from list
    return chatuserset = 1;
  }
}

// function called when logged user click to enter in chat
function enterChat() {
  logoutchat = 0;     // set to not delete the user from list
  chatuserset = 1;
    document.getElementById('name_code').style.display = 'none';
    document.getElementById('chatadd').style.display = 'block';
  callphp = 0;         // set "callphp" to 0 to force next ajax access to php file
}

// gets chat text and sends it to ;php via ajaxF()
function addChatS(text) {
  if (chatuserset == 1) {
    var chat = text.adchat.value.length;

    // check number of characters in field that adds chat text
    if(chat < 2 || chat > 200) {
      alert(texts.err_textchat);
      text.adchat.focus();
    }
    else {
      // sends data to Ajax
      var  send_chat = "adchat="+encodeURIComponent(text.adchat.value)+"&chatuser="+text.chatuser.value;
      ajxsend = 1;         // Ajax busy now 

      ajaxF(setchat, send_chat);
      text.adchat.value = '';
    }
  }
  else setNameC(text);
  return false;
}

/** Start - functions to add URL, Format text, and Smiles in textarea **/

// check and pass the URL
function setUrl(idadd) {
  var url = window.prompt(texts.addurl);    // open Prompt to add URL

  // check if a correct URL (without http://), send it to addChatBIU(), else alert
  if (url.match(/^(www.){0,1}([a-zA-z0-9_,+ -]+[.]+)/)) addChatBIU('[url=http://'+url+']','[/url]', idadd);
  else alert(texts.err_addurl);
}

// Adaugare font B, I, U
function addChatBIU(start, end, zona) {
  var adchat = document.getElementById(zona);
  var IE = /*@cc_on!@*/false;    // this variable is false in all browsers, except IE

  if (IE) {
    adchat.value = adchat.value + start + end;    // Add in field the initial values + received dta
    var pos = adchat.value.length - end.length;    // Sets location for cursor position

    // position the cursor through a selected area
    range = adchat.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);        // start position
    range.moveStart('character', pos);        // end position
    range.select();                 // selects the zone
  }
  else if (adchat.selectionStart || adchat.selectionStart == "0") {
    var startPos = adchat.selectionStart;
    var endPos = adchat.selectionEnd;
    adchat.value = adchat.value.substring(0, startPos) + start + adchat.value.substring(startPos, endPos) + end + adchat.value.substring(endPos, adchat.value.length);

    // Place the cursor between formats in #adchat
    adchat.setSelectionRange((endPos+start.length),(endPos+start.length));
    adchat.focus();
  }
}

// for clicked smile in element with ID passed in "idadd"
function addSmile(smile, idadd) {
  var tarea_com = document.getElementById(idadd);
  tarea_com.value += smile;
  tarea_com.focus();
}

// object to convert BBCODE in HTML tags
var bbcodeParser={};(function(){var token_match=/{[A-Z_]+[0-9]*}|:\)|:\(|:P|:D|:S|:O|:=\)|:\|H|:X|:\-\*/ig;bbcodeParser.tokens={'URL':'((?:(?:[a-z][a-z\\d+\\-.]*:\\/{2}(?:(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+|[0-9.]+|\\[[a-z0-9.]+:[a-z0-9.]+:[a-z0-9.:]+\\])(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)|(?:www\\.(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)))','LOCAL_URL':'((?:[a-z0-9\-._~\!$&\'()*+,;=:@|]+|%[\dA-F]{2})*(?:\/(?:[a-z0-9\-._~\!$&\'()*+,;=:@|]+|%[\dA-F]{2})*)*(?:\?(?:[a-z0-9\-._~\!$&\'()*+,;=:@\/?|]+|%[\dA-F]{2})*)?(?:#(?:[a-z0-9\-._~\!$&\'()*+,;=:@\/?|]+|%[\dA-F]{2})*)?)','EMAIL':'((?:[\\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*(?:[\\w\!\#$\%\'\*\+\-\/\=\?\^\`{\|\}\~]|&)+@(?:(?:(?:(?:(?:[a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(?:\\d{1,3}\.){3}\\d{1,3}(?:\:\\d{1,5})?))','TEXT':'(.*?)','SIMPLETEXT':'([a-zA-Z0-9-+.,_ ]+)','INTTEXT':'([a-zA-Z0-9-+,_. ]+)','IDENTIFIER':'([a-zA-Z0-9-_]+)','COLOR':'([a-z]+|#[0-9abcdef]+)','NUMBER':'([0-9]+)'};bbcodeParser.bbcode_matches=[];bbcodeParser.html_tpls=[];bbcodeParser._getRegEx=function(str){var matches=str.match(token_match);var i=0;var replacement='';if(matches.length<=0){return new RegExp(preg_quote(str),'g');}
for(;i<matches.length;i+=1){var token=matches[i].replace(/[{}0-9]/g,'');if(bbcodeParser.tokens[token]){replacement+=preg_quote(str.substr(0,str.indexOf(matches[i])))+bbcodeParser.tokens[token];str=str.substr(str.indexOf(matches[i])+matches[i].length);}}
replacement+=preg_quote(str);return new RegExp(replacement,'gi');};bbcodeParser._getTpls=function(str){var matches=str.match(token_match);var i=0;var replacement='';var positions={};var next_position=0;if(matches.length<=0){return str;}
for(;i<matches.length;i+=1){var token=matches[i].replace(/[{}0-9]/g,'');var position;if(positions[matches[i]]){position=positions[matches[i]];}else{next_position+=1;position=next_position;positions[matches[i]]=position;}
if(bbcodeParser.tokens[token]){replacement+=str.substr(0,str.indexOf(matches[i]))+'$'+position;str=str.substr(str.indexOf(matches[i])+matches[i].length);}}
replacement+=str;return replacement;};bbcodeParser.addBBCode=function(bbcode_match,bbcode_tpl){bbcodeParser.bbcode_matches.push(bbcodeParser._getRegEx(bbcode_match));bbcodeParser.html_tpls.push(bbcodeParser._getTpls(bbcode_tpl));};bbcodeParser.bbcodeToHtml=function(str){var i=0;for(;i<bbcodeParser.bbcode_matches.length;i+=1){str=str.replace(bbcodeParser.bbcode_matches[i],bbcodeParser.html_tpls[i]);}
return str;};function preg_quote(str,delimiter){return(str+'').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\'+(delimiter||'')+'-]','g'),'\\$&');}})();
bbcodeParser.addBBCode('[b]{TEXT}[/b]', '<span class="sb">{TEXT}</span>');
bbcodeParser.addBBCode('[u]{TEXT}[/u]', '<span class="su">{TEXT}</span>');
bbcodeParser.addBBCode('[i]{TEXT}[/i]', '<span class="si">{TEXT}</span>');
bbcodeParser.addBBCode('[url]{URL}[/url]', '<a href="{URL}" title="link" target="_blank" rel="nofallow">{URL}</a>');
bbcodeParser.addBBCode('[url={URL}]{TEXT}[/url]', '<a href="{URL}" title="link" target="_blank" rel="nofallow">{TEXT}</a>');
bbcodeParser.addBBCode(':)', '<img src="chatex/0.gif" width="18" height="18" alt=":)" />');
bbcodeParser.addBBCode(':(', '<img src="chatex/1.gif" width="18" height="18" alt=":(" />');
bbcodeParser.addBBCode(':P', '<img src="chatex/2.gif" width="18" height="18" alt=":P" />');
bbcodeParser.addBBCode(':D', '<img src="chatex/3.gif" width="18" height="18" alt=":D" />');
bbcodeParser.addBBCode(':S', '<img src="chatex/4.gif" width="18" height="18" alt=":S" />');
bbcodeParser.addBBCode(':O', '<img src="chatex/5.gif" width="18" height="18" alt=":O" />');
bbcodeParser.addBBCode(':=)', '<img src="chatex/6.gif" width="18" height="18" alt=":=)" />');
bbcodeParser.addBBCode(':|H', '<img src="chatex/7.gif" width="42" height="18" alt=":|H" />');
bbcodeParser.addBBCode(':X', '<img src="chatex/8.gif" width="18" height="18" alt=":X" />');
bbcodeParser.addBBCode(':-*', '<img src="chatex/9.gif" width="18" height="18" alt=":-*" />');

/** Functions for Ajax **/

// Start AJAX 
function ajaxRequest(){
 var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
 if (window.ActiveXObject){      //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
  for (var i=0; i<activexmodes.length; i++){
   try {
    return new ActiveXObject(activexmodes[i])
   }
   catch(e){
    //suppress error
   }
  }
 }
 else if (window.XMLHttpRequest) return new XMLHttpRequest()
 else return false
}

// Variables for positioning scrollbar
var scrol0 = -1;
var i_scrol = 0;

var mypostrequest = new ajaxRequest();    // Create the object for AJAX
function ajaxF(file, parameters) {
  var ajxsend = 1;        // parameter to check sending (Ajax busy)

  parameters += '&chatroom='+chatroom;      // Add the "chatroom"
  // Sends data
  mypostrequest.open("POST", file, true);
  mypostrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  mypostrequest.send(parameters);
  mypostrequest.onreadystatechange = stateChanged;

  // Function to display response
  function stateChanged() {
    var niv_scroll = document.getElementById('chats').scrollTop;    // determine where the scrollbar is positioned

  if (mypostrequest.readyState==4) {
    if (mypostrequest.status==200 && document.getElementById('chats')) {
      // get chat content to be added in page. 
      var objChat = JSON.parse(mypostrequest.responseText);
      setHtmlChat(objChat);        // set and add chat content in page

      // Make auto-scroll to scrollbar position if it was moved, or bottom of DIV #chats
      var div = document.getElementById('chats');
      var scrollHeight = Math.max(div.scrollHeight, div.clientHeight);
      if (niv_scroll!=0 && niv_scroll<scrol0) {
        div.scrollTop = niv_scroll;
      }
      else {
        div.scrollTop = div.scrollHeight;
        i_scrol = 0;
      }
      // Sets scrollbar position
      if (i_scrol==0) {
        scrol0 = document.getElementById('chats').scrollTop;
        i_scrol = 1;
      }

      if(playbeep == 2) playBeep(objChat.time);       // calls to check for play beep if chat added
    }
  }
  ajxsend = 0;      // Set Ajax sent and free
  }
}

// gets the object from Ajax, returns the items in HTML format
function setHtmlChat(objChat) {
  var chatrows = '';       // stores the area with chat lines
  var chatusers = '';       // stores the area with online users
  var nrchats = objChat.chats.length;

  // if last-added-chat changed, define $chatrooms html; else gets content from #chats ttag
  if(objChat.time != lastaddedc) {
    // if chat lines, and first chat line not empty, traverses the array with chat line and sets <p> with each chat line data
    if(nrchats > 0 && objChat.chats[0].chat != '') {
      for(var i=0; i<nrchats; i++) {
        chatrows += '<p><span class="chatusr">&bull; '+ objChat.chats[i].user +' - </span><em>'+ objChat.chats[i].date +'</em><span class="chat">- '+ bbcodeParser.bbcodeToHtml(objChat.chats[i].chat) +'</span></p>';
      }
    }
    else chatrows += '<p><span class="chatusr">'+ texts.notchat +'</p>';

    if(document.getElementById('chats')) document.getElementById('chats').innerHTML = chatrows;       // update tet chat
  }

  // adds the users from object in array, and sorts them alphabetically
  var users = [];
  var user = document.getElementById('chatuser').value;
  if(chatuserset == 1) users.push(user);
  for(var kusr in objChat.users) {
    if(user != objChat.users[kusr]) users.push(objChat.users[kusr]);
  }

  // if the $users has items, add them in UL lists, else, return without UL
  if(users.length > 0) {
    users.sort(function(a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    chatusers += '<ul id="chatusersli"><li>'+ users.join('</li><li>') +'</li></ul>';
  }
  else chatusers = texts.no1online;

  // if "logoutchat" is 1, removes the user from Online list
  if(logoutchat === 1) {
    var linethisuser = new RegExp('\<li\>'+document.getElementById('chatuser').value+'\<span\>([^\<]*)\<\/span\>\<\/li\>', 'i');
    if(chatusers.match(linethisuser)) chatusers = chatusers.replace(linethisuser, '');
  }
  
  if(document.getElementById('chatusers')) document.getElementById('chatusers').innerHTML = '<h4 id="onl">'+ texts.online +'</h4>'+ chatusers;     // update chat users
}

// Calls Ajax function to each 2 seconds (with chatuser) to 
function apelAjax() {
  callphp -= 1.5;              // decrement callphp 1.5 seconds
  // sets file to access according to "sec", if it`s 0, accesses "setchat", else, the TXT file with chatroom name
  if(callphp <= 0) {
    callphp = 2.8 + (getNrChatUsers() * 0.3);            // sets to call "setchat" according to number of online users
    var chatfile = setchat;
  }
  else var chatfile = getchat();
  if(callphp > 10) callphp = 10

  var chatusr = (chatuserset==1) ? (document.getElementById('chatuser').value) : '';

  // if Ajax free, sends data, else, set free for next auto-call
  if(ajxsend === 0) ajaxF(chatfile, 'chatuser='+chatusr);
  else ajxsend = 0;

  setTimeout('apelAjax()', 1900);
}
apelAjax();    // Calls Ajax function