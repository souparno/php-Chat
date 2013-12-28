<?php
// Chat Simple, from: http://coursesweb.net/php-mysq/

class ChatSimple {
  public $maxrows = 30;
  public $chatrooms = array();            // for chat rooms
  public $chatroomcnt = '';               // store chat room content

  protected $lsite = array();              // will contains the texts in the defined language
  protected $chatdir = 'chattxt';         // directory that store TXT files for chat
  protected $fileroom;                    // store the file of current chat room
  protected $chatuser = '';               // store user name
  protected $chatadd = 1;                 // if not 1, the user must be logged in

  // constructor (receives the array with chat rooms)
  public function __construct($chatrooms) {
    // set properties value
    $this->lsite = $GLOBALS['lsite'];
    $this->chatrooms = $chatrooms;
    if(defined('CHATADD')) $this->chatadd = CHATADD;
    if(defined('CHATDIR')) $this->chatdir = (basename(dirname($_SERVER['PHP_SELF'])) == 'chatfiles') ? '../'.CHATDIR : CHATDIR;
    if(defined('MAXROWS')) $this->maxrows = MAXROWS;

    $this->fileusers = $this->chatdir.'/chatusers.txt';
    $this->fileroom = isset($_POST['chatroom']) ? ($this->chatdir.'/'.trim(strip_tags($_POST['chatroom'].'.txt'))) : ($this->chatdir.'/'.$this->chatrooms[0].'.txt');

    // sets current chat user with the name added in form, and calls the method to set $chatroomcnt
    if(isset($_POST['chatuser'])) $this->chatuser = trim(htmlentities($_POST['chatuser'], ENT_NOQUOTES, 'utf-8'));
    $this->chatroomcnt = $this->setChatRoomCnt();

    // if data from the form to add chat, output chat room content
    if(isset($_POST['chatuser'])) echo $this->chatroomcnt;
  }

  // returns the HTML code with chat rooms
  public function chatRooms() {
    $nrooms = count($this->chatrooms);
    $chatrooms = '';
    if($nrooms > 0) {
      for($i=0; $i<$nrooms; $i++) {
        $id = ($i==0) ? 'id="s_room"' : '';
        $chatrooms .= '<span class="chatroom" '.$id.' onclick="setChatRoom(this)">'.$this->chatrooms[$i].'</span>';
      }
    }
    else $chatrooms = '<span><b> &nbsp; &nbsp; - Chat</span>';

    return $chatrooms;
  }


  // include the form to add text in chat room, or messaje to Logg in (if $chatuser false, and $chatadd not 1)
  public function chatForm() {
    if($this->chatadd !== 1) {
      if(defined('CHATUSER')) include('chat_form.php');
      else echo $this->lsite['chatlogged'];
    }
    else include('chat_form.php');
  }

  // returns array with online users in chat, in last 7 sec.
  protected function getChatUsers($users) {
    $regtime = time();  $reusr = array();

    // if users, traverses the arrsy and stores the users in last 7 sec.
    if(count($users) > 0) {
      foreach($users as $t=>$usr) {
        if($usr == $this->chatuser) continue;
        else if(intval($t) > ($regtime - 8)) $reusr[$t] = $usr;
      }
    }

    // adds current user in list
    if($this->chatuser !== '') $reusr[$regtime] = $this->chatuser;

    $reusr = array_unique($reusr);
    return $reusr;
  }

  // adds HTML code with chat text in TXT file
  protected function setChatRoomCnt() {
    $chatrows = array('time'=>'', 'users'=>array(), 'chats'=>array(array('user'=>'', 'date'=>'', 'chat'=>'')));       // stores chat room data

    // if file for current chat room exists, gets its content, else, display 'no chat', and current user
    if(file_exists($this->fileroom)) {
      $getchats = file_get_contents($this->fileroom);
     
      if(strlen($getchats) > 11) $chatrows = json_decode($getchats, true);
      $chatrows['users'] = $this->getChatUsers($chatrows['users']);         // get the list with online users
      
      // if access to add new chat text
      if(isset($_POST['adchat'])) {
        $adchat = trim(htmlentities($_POST['adchat'], ENT_NOQUOTES, 'utf-8'));     // Transform HTML characters, and delete external whitespace
        if(get_magic_quotes_gpc()) $adchat = stripslashes($adchat);     // Removes slashes added by get_magic_quotes_gpc
        
        
        // if text added, keep the last $maxrows rows, add the new chat data
        if(strlen($adchat)<1 || strlen($adchat)<201) {
          $chatrows['chats'] = array_slice($chatrows['chats'], -($this->maxrows));
          $chatrows['chats'][] = array('user'=>$this->chatuser, 'date'=>date('j F H:i'), 'chat'=>$adchat);

          // if chat in 1st line is empty, remove 1st array with chat line data
          if($chatrows['chats'][0]['chat'] == '') array_shift($chatrows['chats']);
        }

        // sets chat room content
        $chatrows['time'] = time();
      }
    }

    // write the chat content in TXT file, returns $chatroomcnt, or message error
    $rechat = json_encode($chatrows);
    if(file_put_contents($this->fileroom, $rechat)) return $rechat;
    else return json_encode(array('error'=>sprintf($this->lsite['err_savechat'], $this->fileroom)));
  }

  // to empty chatrooms, include the form with chatrooms to empty
  // if request to empty room, and "cadmpass" is correct, write 'notchat' in that room
  public function emptyChatRooms() {
    if(isset($_POST['emptyroom'])) {
      if($_POST['cadmpass'] == CADMPASS) {
        $fileroom = $this->chatdir.'/'.trim(strip_tags($_POST['emptyroom'].'.txt'));
        if(file_put_contents($fileroom, ' ')) echo '<center>'. sprintf($this->lsite['emptedroom'], $_POST['emptyroom']). '</center>';
        else echo '<center>'. $this->lsite['err_emptedroom']. $_POST['emptyroom']. '</center>';
      }
      else echo $this->lsite['err_adminpass'];
    }
    include('emptychat_form.php');
  }
}