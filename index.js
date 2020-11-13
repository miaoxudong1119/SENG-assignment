const { log } = require('console');
const { toNamespacedPath } = require('path');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
let userList=[];
let colors=[];
let history=[];
color="black";
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var aname="";
  var time="";
  var today = new Date();
  
  
  while(aname===""||userList.includes(aname)){
    aname="User"+Math.floor(Math.random() * 10);
  }

  
  name()
  userList.push(aname);
  updateUser();
  console.log(userList)
  changename(aname)

  for(var i=0; i<history.length; i++){
    io.to(socket.id).emit('return message', {
      name:history[i].name,
      msg:history[i].msg,
      time:history[i].time,
      color:history[i].color

  })
  }
  

  

  if(today.getHours()<10){
    time="0"+today.getHours()+" : ";
  }else{
    time+=today.getHours()+" : ";
  }
  if(today.getMinutes()<10){
    time+="0"+today.getMinutes();
  }else{
    time +=  today.getMinutes() ;
  }

  socket.on('login',(name)=>{
    
  })
  socket.on('chat message', function(msg){
    if(msg.includes(":)")){
      msg=msg.replace(":)","&#128513")
    }
    if(msg.includes(":(")){
      msg=msg.replace(":(","&#128577")
    }
    if(msg.includes(":o")){
      msg=msg.replace(":o","&#128562")
    }

    if(msg.startsWith("/name")){
      


      var newname = msg.substring(msg.lastIndexOf("<") + 1, msg.lastIndexOf(">"));
      if(newname!=""&&!userList.includes(newname)){
        changename(newname);
        userList[userList.indexOf(aname)]=newname;
   
        aname=newname;
        
        
        updateUser()
      }
     
    }
    else if(msg.startsWith("/color")){
      var array=msg.split(" ")
      

      if(isHexColor (array[1])){
        if(colors[userList.indexOf(aname)]==undefined){
          var origincolor=colors[userList.indexOf(aname)]="black"
        }
        else{
          var origincolor=colors[userList.indexOf(aname)]
        }
        
        color="#"+array[1]
        colors[userList.indexOf(aname)]=color;
        if(colors[userList.indexOf(aname)]!=undefined){
          var thiscolor=colors[userList.indexOf(aname)]
        }
        else{
          var thiscolor="black";
        }
        
        for(var i=0; i<history.length;i++){
          if(history[i].name=aname){
            history[i].color=thiscolor
          }
        }
       
        io.emit('changecolor' , {
          color:thiscolor,
          name:aname,
          origincolor:origincolor
        })
        
      }

    }
    else{

      
      
      if(colors[userList.indexOf(aname)]!=undefined){
        var thiscolor=colors[userList.indexOf(aname)]
      }
      else{
        var thiscolor="black";
      }

      var mess={time:time, msg:msg, name:aname, color: thiscolor}
      if(history.length<200){
        history.push(mess)
      }
      else{
        history.shift()
        history.push(mess)
      }
      
      console.log(history)
      io.emit('return message', {
        name:aname,
        msg:msg,
        time:time,
        color:thiscolor
  
    })
      

    }
    
  });

 
 

  socket.on('disconnect',()=>{
    colors.splice(userList.indexOf(aname),1);
    userList.splice(userList.indexOf(aname),1);


    updateUser();
  })


  function updateUser(){
    io.emit("updateUser",userList);
  }

  function changename(aname){
    io.to(socket.id).emit('giveName',{
      name:aname
      })
  }

  function isHexColor (hex) {
    return typeof hex === 'string'
        && hex.length === 6
        && !isNaN(Number('0x' + hex))
  }
  function name(){
    socket.on("login",(name)=>{
      if(!userList.includes(name)){
        userList[userList.indexOf(aname)]=name;
        aname=name;
        changename(aname)
        updateUser();
      
      }
      
      
    })
  }
  
  
  

});


http.listen(port, function(){
  console.log('listening on *:' + port);
});
