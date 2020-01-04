class force{
    constructor(val,coordFirstPoint,coordF){
        val = val ||null;
        this.coordFirstPoint = coordFirstPoint ;
        this.val = val;
        if(coordF!=undefined){
            this.coordF  = coordF.attrs.x||null;
        }   
    }
    get distanceFrom0(){
        return (this.coordF-this.coordFirstPoint);
    } 
}

class Q extends force{
    constructor(val,coordFirstPoint,coordQ){
        super(val,coordFirstPoint);
        this.qLength = coordQ.attrs.points[1]-coordQ.attrs.points[0];
        this.q1 =coordQ.attrs.points[0];
    }

    get distanceFrom0(){
        return (q1-this.coordFirstPoint);
    }    
}
class R extends force{
    constructor(coordFirstPoint,coordR,index,type){
        super(null,coordFirstPoint,coordR);
        this.type  = type;
        this.index =index;
    }
}
class P extends force{
    constructor(val,coordFirstPoint,coordP){
        super(val,coordFirstPoint,coordP);
    }
}
class M extends force{
    constructor(val,coordFirstPoint,coordM){
        super(val,coordFirstPoint,coordM);
    }
}


class Calc{
    constructor(segments){
     //   showHint(segments);
        let q = [];
        let m = [];
        let p = [];
        let r = [];
        let fstPoint = segments[0].point.attrs.x;
       
        for(let i=0;i<segments.length;i++){  
            let point = segments[i].point;
            if(point.pForce != undefined){
                p.push(new P(point.pForce.val,fstPoint,point));
            }
            if(point.moment != undefined){
              
                m.push(new M(point.moment.val,fstPoint,point));
            }
            if(point.react!=undefined){
                console.log("react was !")
                r.push(new R(fstPoint,point,i,"moveble"));
            }
            if(segments[i].line !=undefined){
                let line =segments[i].line;
                if(line.distLoad !=undefined){
                    let coordQ = [line.attrs.points[0],line.attrs.points[2]]
                    q.push(new Q(line.distLoad.val,fstPoint,coordQ));
                }
            }
        }
        this.q = q;
        this.r = r;
        this.p = p;
        this.m  =m; 
    }

   
    calcR(){
        function calcSumP(p,l){
            let sumP =0;
            for(let i=0;i<p.length;i++){
                sumP += p[i].val*(p[i].distanceFrom0 - l);
            }
            return sumP;
        }
        console.log(this.r);
        let l1 = this.r[0].distanceFrom0;
        let l2 = this.r[1].distanceFrom0;
        let sumM=0;
        let sumP=0;
        let sumQ=0;
        for(let i=0;i<this.m.length;i++){
            sumM += this.m[i].val;
        }
        sumP = calcSumP(this.p,l1);
      
        for(let i=0;i<this.q.length;i++){
            sumQ += q[i].val*(this.q[i].distanceFrom0+(this.q[i].qLength/2)-l1);
        }
        /*
        console.log(sumM);
        console.log(sumP);
        console.log(sumQ);
        */
        this.r[1].val = (-sumM-sumP-sumQ)/(l2-l1);
        sumQ =0;
        for(let i=0;i<this.q.length;i++){
            sumQ += q[i].val*(-this.q[i].distanceFrom0-(this.q[i].qLength/2)+l2);
        }
        sumP = calcSumP(this.p,l2);
        this.r[0].val = (sumM+sumP-sumQ)/(l2-l1);
        console.log("r0 "+this.r[0].val);
        console.log("r1 "+this.r[1].val);
     //   console.log("check"+(this.r[0].val+this.r[1].val+this.p[0].val));
        return this.r;
    }
    
}