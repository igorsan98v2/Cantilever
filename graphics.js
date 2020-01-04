
var width = window.innerWidth;
var height = window.innerHeight;
var calcButton = document.querySelector(".calc-button");
calcButton.style.display ="none";
var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height
});
var segments = [];
var segment={points:[],line:Object}
 

var layer = new Konva.Layer();
var textLayer = new Konva.Layer();
var wasCreated =false;
var msDownCount = 0;
var startPoint;
var endPoint ;
var menu;

/*
 * since each line has the same point array, we can
 * adjust the position of each one using the
 * move() method
 */

var posStart;
var posEnd;
document.onclick =function onMouseDown(event){
 // console.log(event.clientX);
  var line ;
  msDownCount++;
  if(menu!=null&&event.which == 1){
    menu.style.display = "none";
   }
  
  if(!wasCreated){
    if(msDownCount==1){
      posStart = [event.clientX,event.clientY];
      startPoint = makePoint(posStart[0],posStart[1]) ;
      layer.add(startPoint);
     
    }
   
    if(msDownCount==2){
      posEnd = [event.clientX,posStart[1]];
      endPoint = makePoint(posEnd[0],posEnd[1]) ;    
      line = makeLine([posStart[0],posEnd[0]],posStart[1]);
        layer.add(endPoint);
        layer.add(line);
        segment.line = line;
        segments[0]={line:segment.line,point:startPoint};
        segments[1]={line:null,point:endPoint};
        wasCreated=true;
        refreshText();
    }
    stage.add(layer);  
    stage.add(textLayer); 
  }
 
}
document.oncontextmenu = function(event){
  var x = event.clientX+"px";
  var y = event.clientY+"px";
  menu  = document.querySelector("#context-menu");
  var mode;
  menu.style.top = y;
  menu.style.left =x;
  if(segments==null){ 
    return false; 
  }

  mode=(whatIJustTouch(event.clientX,event.clientY,15,segments));
  switch(mode.objType){
    case 0:
        menu.innerHTML= "<li>Добавить точку</li>";
        var menuItem = document.querySelector("#context-menu li");
        addPoint(menuItem,x);
    break;

    
    case 1:
        menu.innerHTML = "<li>Добавить распределенную нагрузку</li>";
        menu.innerHTML+= "<li>Добавить точку</li>";
        menu.innerHTML+= "<li>Удалить сегмент балки;</li>";
        var menuItems = document.querySelectorAll("#context-menu li");
        addDistLoad(menuItems[0],mode.segmentIndex); 
        addPoint(menuItems[1], x);
        deleteSegment(menuItems[2], mode.segmentIndex)
        
    break;
    case 2:
    menu.innerHTML = "<li>Добавить момент</li>";
    menu.innerHTML += "<li>Добавить сосредоточиную силу</li>";
    menu.innerHTML += "<li>Добавить подвижную опору</li>";
    menu.innerHTML += "<li>Добавить неподвижную опору</li>";
    menu.innerHTML += "<li>удалить точку</li>";
    var menuItems = document.querySelectorAll("#context-menu li");
    addMoment(menuItems[0],mode.segmentIndex);
    addPForce(menuItems[1], mode.segmentIndex);
    addMovableBearing(menuItems[2],mode.segmentIndex);
    addUnmovableBearing(menuItems[3],mode.segmentIndex);
    deletePoint(menuItems[4],mode.segmentIndex);
    break;
  }
  menu.style.display = "block";

  return false;
  
}


function whatIJustTouch(x,y,acc,segments){
  if(segments == null){
      return { objType: 0, segmentIndex: null };
    }
  if (segments.length == 0) {
      msDownCount = 0;
      wasCreated = false;
      return { objType: 0, segmentIndex: null };
  }
  var point =segments[0].point.attrs.y;
  var line=null;
  var firstPoint=segments[0].point.attrs.x;
  var lastPoint=segments[segments.length-1].point.attrs.x;
  if(x>firstPoint-acc&&x<lastPoint+15){
    if(y>point-acc&&y<point+acc){
      for(var i=0;i<segments.length;i++){
         point = segments[i].point.attrs.x;
          if(point< x+acc&&point>x-acc){
             return {objType:2,segmentIndex:i};
          }
    
        try{
          line = segments[i].line.attrs.points;
        }
        catch(err){}
        if(line!=null){
          if(x>line[0]&&x<line[2]){
            return {objType:1,segmentIndex:i};
          }
        }
      }
    }

  }
  return  {objType:0,segmentIndex:null};//перенести на блок вверх ?
}

function isItLeft(x,nearX){
   
    var isLeft;
    if((x-nearX )<0){
      
      isLeft = true;      
    }
    else{
      //справа
      isLeft = false;
    }
    return isLeft;
}
function findNearnestPoint(x){
  var min= 999999;
  var minPoint = 0;
  var val;
  for(var i=0;i<segments.length;i++){
    if(Math.abs(segments[i].point.attrs.x-x)<=min){
      val=segments[i].point.attrs.x;
      min = Math.abs(val-x);
      minPoint = i;
    }
  }
  return {nearPoint:minPoint,isLeft:isItLeft(x,val)};
}

function addPoint(obj,x){ 
    x = x.replace("px","");//срабатывает ли после 1го раза ?
    obj.onclick = function(){
      var near = findNearnestPoint(x);
      var y = segments[0].point.attrs.y;
      var point = makePoint(x,y);
      var line;
      if(near.isLeft){
        line = makeLine( [x,segments[near.nearPoint].point.attrs.x],y);

       
        segments.splice(near.nearPoint,0,{line:line,point:point});

        
        if(near.nearPoint-1>-1){
            segments[near.nearPoint-1].line.destroy();
            segments[near.nearPoint-1].line = makeLine( [segments[near.nearPoint-1].point.attrs.x,x],y);
          layer.add(segments[near.nearPoint-1].line);
        }
        layer.add(line);
     
      }
      else{          
       //ошибка ?

        segments.splice(near.nearPoint+1,0,{line:null,point:point});
        if(segments[near.nearPoint].line!=null){
          segments[near.nearPoint].line.destroy();
        } 
        
     
        segments[near.nearPoint].line = makeLine( [segments[near.nearPoint].point.attrs.x,x],y);
        layer.add(segments[near.nearPoint].line);
        
        if(near.nearPoint+1<segments.length&&near.nearPoint+2<segments.length){
           segments[near.nearPoint+1].line = makeLine( [x,segments[near.nearPoint+2].point.attrs.x],y);
           layer.add(segments[near.nearPoint+1].line);
        }
      }

      layer.add(point);
      layer.draw();
      
      refreshText();
      stage.add(layer);
    }
}
function deletePoint(menuItem,index){
  menuItem.onclick = function(){
      var y = segments[0].point.attrs.y;
      segments[index].point.destroy();
      if (segments[index].line != null) {
		  if (segments[index].line.distLoad != undefined) {
            segments[index].line.distLoad.destroy();
           }
          segments[index].line.destroy();
		   
      }
     
      if(index-1>-1){
        segments[index-1].line.destroy();
        if(index+1<segments.length){
          segments[index-1].line = makeLine([segments[index-1].point.attrs.x,
          segments[index+1].point.attrs.x],y);
          layer.add(segments[index-1].line);
         
        }
      }
	  deleteAllMoments(segments[index].point);
      segments.splice(index, 1);
      layer.draw();
      refreshText();
  }
}
//все ещё косячит
function deleteSegment(menuItem, index) {
    menuItem.onclick = function () {
    var delta;

      var pointX = segments[index].point.attrs.x;
        if (segments[index].line.distLoad != undefined) {
            
            segments[index].line.distLoad.destroy();
        }
      deleteAllMoments(segments[index].point);
      if(index+1!=segments.length-1){
        delta = segments[index+1].point.attrs.x - pointX;
      }
     	segments[index].line.destroy();
      segments[index].point.destroy();
      segments.splice(index, 1);
      refreshText();
		  refreshSegments(delta)
      layer.draw();
      refreshText();
    }
}
function refreshSegments(delta){
    var point;
    var line;
    var distLoad=null;
    var text;
    for(i=0;i<segments.length-1;i++){
      point = segments[i+1].point.attrs.x;
      line = segments[i].line.attrs.points;
      if(line[2]!=point){
        segments[i+1].point.setX(line[2]);
        if( segments[i+1].point.text){
          segments[i+1].point =moveAllMoments(segments[i+1].point,line[2]);
        }
       
       
        if(segments[i+1].line!=null){
          line = segments[i+1].line.attrs.points;
         
          if( segments[i+1].line.distLoad!=undefined){
            distLoad= segments[i+1].line.distLoad.val;   
            text =segments[i+1].line.distLoad.text;   

            segments[i+1].line.distLoad.destroy();

          //  distLoad =distLoad.line.distLoad;

          }
          segments[i+1].line.destroy();
          segments[i+1].line = makeLine([line[0]-delta,line[2]-delta],[line[1],line[1]]);
          if( distLoad!=undefined){
            
            makeDistLoad(i+1);
            segments[i+1].line.distLoad.val = distLoad;
            segments[i+1].line.distLoad.text = text;
            console.log("ReDist"+segments[i+1].line.distLoad.val);
            layer.add(segments[i+1].line.distLoad);
            distLoad = undefined;
          }
          layer.add(segments[i+1].line);
        }   
      } 
      layer.add(segments[i+1].point);
    }
}

function refreshText(){
  textLayer.destroy();
  var length,text,textQ;
  var  x;
  var y =segments[0].point.attrs.y;
   var pCount=0;
   var rCount=0;
   var mCount=0;
   var qCount=0;
  for(var i =0;i<segments.length;i++){
         x = segments[i].point.attrs.x;
        if(segments[i].line!=null){
       
          length =  segments[i].line.attrs.points[2] - x ;
          let val= Number(getSliderValue())
         
          if(!val){
            val =1;
          }
          text ="l"+(i+1)+": " + (length/val).toFixed(2) +" cм";
          segments[i].line.text = makeText(text,x,y+10);
          textLayer.add( segments[i].line.text);
          addEdditing(segments[i].line.text,segments[i].line,"line",i);
          
        }
        text=null;
        if(segments[i].point.pForce!==undefined){
          if(segments[i].point.text!=undefined){
            let text = segments[i].point.text.text();
            segments[i].point.pForce.val = text.split(": ")[1];
          }
          segments[i].point.pForce.val= segments[i].point.pForce.val||10;
            text = "P"+(++pCount)+": " + segments[i].point.pForce.val;//нужно подсчтать количество P до этого как ?
            segments[i].point.text = makeText(text,x,y-50);
            addEdditing(segments[i].point.text,segments[i].point.pForce,"pForce",i);
        }
        if(segments[i].point.react!==undefined){
          if(segments[i].point.text!=undefined){
            let text = segments[i].point.text.text();
            let value =  text.split(": ")[1];
            if((segments[i].point.react.val>0&&value<0)||
              (segments[i].point.react.val<0&&value>0)){
            //textarea.value>0&&obj.val<0
              chgFR(i,segments[i].point.react);
            }
            segments[i].point.react.val = value;
            
          }
          segments[i].point.react.val= segments[i].point.react.val||10;
            text = "R"+(++rCount)+": " + segments[i].point.react.val;//нужно подсчтать количество P до этого как ?
            let yPos;
            if(rCount>1){
              yPos = y-75;
            }
            else yPos = y-50;
            segments[i].point.text = makeText(text,x,yPos);
            addEdditing(segments[i].point.text,segments[i].point.react,"react",i);
        }
        if(segments[i].point.moment!==undefined){
          if(segments[i].point.text!=undefined){
            let text = segments[i].point.text.text();
            segments[i].point.moment.val = text.split(": ")[1];
          }
          segments[i].point.moment.val= segments[i].point.moment.val||10;
            text = "M"+(++mCount)+": " + segments[i].point.moment.val;//нужно подсчтать количество P до этого как ?
            segments[i].point.text = makeText(text,x,y-50);
            addEdditing(segments[i].point.text,segments[i].point.moment,"M",i);

        }

        if(segments[i].line !=null ){
          if(segments[i].line.distLoad != undefined){
            if(segments[i].line.distLoad.text!=undefined){
            
              let text = segments[i].line.distLoad.text.text();
              var val =Number(text.split(": ")[1]);               
             
            }
            segments[i].line.distLoad.val= val||10;
           
            textQ = "q"+(++qCount)+": " + segments[i].line.distLoad.val;//нужно подсчтать количество P до этого как ?
            segments[i].line.distLoad.text = makeText(textQ,x,y-100);
            textLayer.add(segments[i].line.distLoad.text);
            addEdditing(segments[i].line.distLoad.text);

          }
        }
        if(text!=null) {
         
          textLayer.add( segments[i].point.text);
        }       
  }
  if(rCount>=2){
    calc(calcButton);
  }
  textLayer.draw();
  stage.add(textLayer); 

}

function addEdditing(textNode,obj,type,index){
  textNode.on('dblclick', () => {

    var textPosition = textNode.getAbsolutePosition();
    var stageBox = stage.getContainer().getBoundingClientRect();
    var areaPosition = {
        x: textPosition.x + stageBox.left,
        y: textPosition.y + stageBox.top
    };
    // create textarea and style it
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    var varName  ; 
    textarea.value = textNode.text();
    var varName = textarea.value.split(":")[0];  
    textarea.value = textarea.value.split(":")[1];  
    
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width();
 
    textarea.focus();
    textarea.addEventListener('keydown', function (e) {
        // hide on enter
        if (e.keyCode === 13) {
            textNode.text(varName+":"+textarea.value);//?
            textLayer.draw();
            if(type == "line"&&textarea.value>0){
              let points = obj.attrs.points;
              let delta = points[2]-points[0];
              let val = Number(textarea.value)*getSliderValue();
              let distLoad;
              let text;
              let isQ=false;
              points[0]=Number(points[0])
              delta = delta-val; 
  
              obj.destroy();
              obj = makeLine([points[0],points[2]-delta],[points[1],points[1]]);
              layer.add(obj); 
              if(segments[index].line.distLoad!=undefined){
                distLoad =Number(segments[index].line.distLoad.text.text().split(": ")[1]);
                text= segments[index].line.distLoad.text;
               
                segments[index].line.distLoad.destroy();
              }
              segments[index].line =obj; 
              if(distLoad!=undefined){
                
                 makeDistLoad(index);
                 console.log("second"+distLoad);
                 segments[index].line.distLoad.text = text;
                segments[index].line.distLoad.val = distLoad;
                layer.add(segments[index].line.distLoad);
               
              } 
              refreshSegments(delta); 
            }
            if(type == "react"||type == "pForce"){

              if(textarea.value>0&&obj.val<0){
               chgFR(index,obj);
              }
              if(textarea.value<0&&obj.val>0){
                chgFR(index,obj);
              }
            }
            if(type == "M"){
              if(textarea.value>0&&obj.val<0){
                chgMomentR(index);
               }
               if(textarea.value<0&&obj.val>0){
                chgMomentR(index);
               }
            }
            
            layer.draw();
            document.body.removeChild(textarea);        
            refreshText();
        }
    });
  })
}


function addMoment(obj,index){
    obj.onclick= function(){
      segments[index].point.moment = new  Konva.Group({
        x:segments[index].point.attrs.x,
        y:segments[index].point.attrs.y,//не улетит ли при смене  ?
        rotation:0});
      var arrow = makeArrow([0,0,0,100,50,100]);
      
      segments[index].point.moment.add(arrow);
      arrow = makeArrow([0,0,0,-100,-50,-100]);
      segments[index].point.moment.add(arrow);
      chgMomentR(index);
  
      layer.add(segments[index].point.moment);
      layer.draw();
      refreshText();
    }   
}
function addDistLoad(obj,index){
  obj.onclick = function(){
    makeDistLoad(index);
    r
  }
}
function makeDistLoad(index){
 
  var distLoad = new Konva.Group({   
    x:segments[index].point.attrs.x,
    y:segments[index].point.attrs.y,//не улетит ли при смене  ?
    rotation:0});
  var arrow;
  var line;
  var length = segments[index].line.attrs.points[2]-segments[index].point.attrs.x;
  var step = 30;
  for(var coord = 0;coord<length;coord+=step){
    arrow = makeArrow([coord,0,coord,-50]);
    distLoad.add(arrow);
  }
  line = makeLine([0,length],-60);
  distLoad.add(line);
  layer.add(distLoad);
  layer.draw();
  segments[index].line.distLoad = distLoad;
  refreshText();

    textLayer.draw();
    stage.add(textLayer);   
  
}

function deleteAllMoments(point){
	 if (point.pForce != undefined) {
	 	point.pForce.destroy();
	 }
	 if (point.react != undefined) {
	 	point.react.destroy();
	 }
	 if (point.moment != undefined) {
	 	point.moment.destroy();
	 }
	 if (point.unmovableBearing != undefined) {
	 	point.unmovableBearing.destroy();
	 }
	 if (point.movableBearing != undefined) {
	 	point.movableBearing.destroy();
	 }
}
function moveAllMoments(point,x,index){
	 if (point.pForce != undefined) {
     point.pForce.setX(x);
     
	 }
	 if (point.react != undefined) {
	 	point.react.setX(x);
	 }
	 if (point.moment != undefined) {
	 	point.moment.setX(x);
	 }
	 if (point.unmovableBearing != undefined) {
	 	point.unmovableBearing.setX(x);
	 }
	 if (point.movableBearing != undefined) {
	 	point.movableBearing.setX(x);
   }
   return point;
}
function addPForce(obj,index){
  obj.onclick = function(){
    segments[index].point.pForce =  addForce(segments[index].point.pForce,index);
    refreshText();
  }
}
function addReactionForce(index){   
    segments[index].point.react =  addForce(segments[index].point.react,index);  
}
function addForce(force,index){
    force = makeArrow([0,0,0,-100]);
    force.attrs.x = segments[index].point.attrs.x;
    force.attrs.y = segments[index].point.attrs.y;
    layer.add(force);
    layer.draw();
    chgFR(index,force);
   
    return force;//на всякий случай ; 
}

function addUnmovableBearing(obj,index) {
    obj.onclick = function () {
        segments[index].point.unmovableBearing = addBearing(index);
        addReactionForce(index);
        refreshText();
    }
}
function addMovableBearing(obj,index) {
    obj.onclick = function () {
        segments[index].point.movableBearing = addBearing(index, 10);
        addReactionForce(index);
        refreshText();
    }
}
function addBearing(index, h) {
    h = h || 0;
    
   var bearing =  new Konva.Group({   
    x:segments[index].point.attrs.x,
    y:segments[index].point.attrs.y,//не улетит ли при смене  ?
    rotation:0});
   var triangle = makeTriangle(index);
   var radiusT = triangle.attrs.radius + triangle.attrs.strokeWidth + segments[0].line.attrs.strokeWidth;
   var radiusP = segments[index].point.attrs.radius + segments[0].line.attrs.strokeWidth + 1
   var bearPoint = makePoint(0, radiusP, 5);
   var mark;
   var lineHeight = segments[index].point.attrs.radius + radiusT+ h +10;
   var line = makeLine([-(radiusT), radiusT], lineHeight, 5);
   bearing.add(triangle);
   bearing.add(line);
   for (var i = -radiusT+5; i < (radiusT); i += 10) {
       
       mark = makeLine([i, i - 5], [lineHeight, lineHeight+15],1);
       bearing.add(mark);
   }
  
   bearing.add(bearPoint);
   layer.add(bearing);
   layer.draw();
   return bearing;
}

//меняет знак на противоположный
function chgMomentR(index){
     var scaleX =  segments[index].point.moment.attrs.scaleX;
     if(scaleX!==undefined){
       scaleX*=-1;
     }
     else{
       scaleX = 1;
     }
     segments[index].point.moment.scaleX(scaleX);
     layer.draw();    
     
}
function chgFR(index,force){
  var scaleY =  force.attrs.scaleY;
  let lengthY = -1* force.attrs.points[3];
  

  if(scaleY!==undefined){
    scaleY*=-1; 
  }
  else{
    scaleY = 1;
  }
  force.scaleY(scaleY);
  layer.draw();   
  return scaleY 
}

function makeArrow(arr){
  return  new Konva.Arrow({
    points: arr,
    pointerLength: 20,
    pointerWidth : 20,
    fill: 'black',
    stroke: 'black',
    strokeWidth: 4
  });
}
function makePoint(x, y,radius) {
    radius = radius || 3;
  return new Konva.Circle(
    {x:x,y:y,
      radius: radius,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 0
     });
}
function makeLine(x, y,sWith) {
    var yF = [];
    sWith = sWith || 5;
  
    if( 2 !== y.length) {
        yF[0] = y;
        yF[1] = y;
    }
    else {
        yF = y;    
    }
    
    return new Konva.Line({
        points: [x[0], yF[0],x[1],yF[1]],
  stroke: 'red',
  strokeWidth: sWith,
  lineCap: 'round',
  lineJoin: 'round'});
}
function makeTriangle(index, radius) {
    radius = radius || 20;
return  new Konva.RegularPolygon({
  x: 0,
  y: segments[index].point.attrs.radius + radius + segments[0].line.attrs.strokeWidth,
  sides: 3,
  radius: radius,
  fill:"red",
  stroke: 'black',
  strokeWidth: 3,

});
}

function makeText(text,x,y){
  return new Konva.Text({
      x: x,
      y: y,
      text: text,
      fontSize: 30,
      fontFamily: 'Calibri',
      fill: 'black'
    });
}

function queryInputField(){
    var field = document.querySelector("input");
    //field.style.left = (pos-40 + event.point.x)/2 + "px";
    //field.value  = 
    return field;
}


function calc(obj){
  obj.style.display = "block";
    obj.onclick = function(){
        var calc = new Calc(segments);
        var r = calc.calcR();
     //   main(layer,segments,stage);
    //    segments[r[0].index].point.react.val = r[0].val;
        segments[r[0].index].point.text.text("r0: "+r[0].val.toFixed(2));
    //    segments[r[1].index].point.react.val = r[1].val;  
        segments[r[1].index].point.text.text("r1: "+r[1].val.toFixed(2));
      refreshText();
    }
}