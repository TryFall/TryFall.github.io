window.onload=function(){
  if (document.cookie == true) {
    
  }
  var sendMessage = document.getElementById("send").addEventListener("click", send);
  function send() {
  var ExistingDiv = document.getElementById("chatbox");
  var content = document.getElementById('content').value;
  const newContent = document.createTextNode(content);
  ExistingDiv.appendChild(newContent);
};}