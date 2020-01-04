/*forces
    {rArr:,qArr:,mArr:,pArr:}
*/
class Diagram{
    constructor(layer,forces,startPoint,endPoint,scale){
        
        this.scale = scale;
        this.rArr =forces.rArr;
        this.qArr = forces.qArr;
        this.mArr = forces.mArr;
        this.pArr = forces.pArr;
        this.beam = {start:startPoint,end:endPoint};
        this.layer=layer;
       
    }
    draw(y){
       
        let line = makeLine([this.beam.start,this.beam.end],y,3);
        
        this.layer.add(line);
        this.z = y;
        //stage ?
        return this.layer;
    }

}

class DiagramQ extends Diagram{
    constructor(layer,forces,startPoint,endPoint,scale){
        super(layer,forces,startPoint,endPoint,scale);
    }
    draw(y){
        super.draw(y);
        console.log(this.pArr[0]+y)
        console.log(this.beam);
        let line = null;
        for(let i =0;i<this.pArr.length;i++){
            if(i==0){
                line = makeLine([this.beam.start,this.pArr[0].pos],(y+this.pArr[0].val*3),3);
            }
            else{
                //если другая сила перед этим ?(
                line = makeLine([this.pArr[i-1].pos,this.pArr[0].pos],(y+this.pArr[0].val*3),3);
            }
           
        }
     
        this.layer.add(line);
     //   line.draw();
     //   this.layer.draw();
        
        return this.layer;
    }
}



class DiagramM extends Diagram{
    constructor(layer,forces,startPoint,endPoint,scale){
        super(layer,forces,startPoint,endPoint,scale);
    }
    draw(y){
        super.draw(y);
        
        console.log(this.pArr[0]+y)
        console.log(this.beam);
        let line ;
        let delta =(this.pArr[0].pos - this.beam.start)/56;
        for(let i =0;i<this.pArr.length;i++){
            if(i==0){
                line = makeLine([this.beam.start,this.pArr[0].pos],[y+(this.pArr[i].val*delta),y],3);
             //  line= makeLine([30,90][10,50],5);
            }
            
        }
        this.layer.add(line);
    }
}

function main(segments,stage,scale){
    
    
    let layer = new Konva.Layer();
    let forces = {rArr:null,qArr:null,mArr:null,
        pArr:[{val:10,pos:segments[segments.length-1].point.attrs.x}]};
    let beam =[] ;
    beam[0] = segments[0].point.attrs.x;
    if( segments[segments.length-1].line){
        beam[1] = segments[segments.length-1].line.attrs.points[3];
    }
    else{
        beam[1] = segments[segments.length-1].point.attrs.x;
    }
    console.log(beam);
    let qDia = new DiagramQ(layer,forces,beam[0],beam[1],scale);
    let mDia = new DiagramM(layer,forces,beam[0],beam[1],scale);
    stage.add(layer);
    qDia.draw(segments[0].point.attrs.y+10*4);
     mDia.draw(segments[0].point.attrs.y+20*4);
    layer.draw();
    console.log(layer);
   
}
