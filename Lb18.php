<?php
    class Force{
        public function __construct($val ,$coordFirstPoint ,$coordF=NULL){
            $this->val = $val ?? NULL;
            $this->coordFirstPoint = $coordFirstPoint ;
            if($coordF!=NULL){
                $this->coordF = json_decode($coordF)->point->attrs->x ?? NULL ;
            }
            $str = "\nval=".$this->val ."\nfp".$this->coordFirstPoint."\nFcoord".$this->coordF; 
            echo $str; 
        }
        public function getDistanceFrom0(){
            return ($this->coordF-$this->coordFirstPoint);
        }

    }
    class Q extends Force{
        public function __construct($val,$coordFirstPoint,$coordQ){
          
            Force::__construct($val,$coordFirstPoint);
             
            $this->qLength = $coordQ[1]-$coordQ[0];
            $this->q1 =$coordQ[0];
        }
    
        public function getDistanceFrom0(){
            return ($this->q1-$this.coordFirstPoint);
        }
    }
    
    class R extends Force{
        public function __construct($coordFirstPoint,$coordR,$index,$type){
            Force::__construct(NULL,$coordFirstPoint,$coordR);
        $this->type  = $type;
        $this->index = $index;
        }
       
    }
    
    class P extends Force{
        public function __construct($val,$coordFirstPoint,$coordP){
            Force::__construct($val,$coordFirstPoint,$coordP);
        
        }
        
    }
    class M extends Force{
        public function __construct($val,$coordFirstPoint,$coordM){
            Force::__construct($val,$coordFirstPoint,$coordM);
        }
        
    }
    class Calc{
        public function __construct($segments){
            $this->q = array();
            $this->r = array('1','2');
            $this->p = array();
            $this->m = array();
            $fstPoint = $segments[0]->point->attrs->x;
            $i=0;
            echo serialize($segments); 
            foreach($segments as $segment){
                
                $point = $segment->point;
                echo serialize($point); 
                if(property_exists ($point,"pForce") ){
                    $this->p[] = (new P($point->pForce->val,$fstPoint,$point));
                }
                if(property_exists ($point,"moment")){
                  
                    $this->m[] = (new M($point->moment->val,$fstPoint,$point));
                }
                if(property_exists ($point,"react")){
                    
                    $this->r[] = new R($fstPoint,$point,$i,"moveble");
                    if(i==0)
                        $r = new R($fstPoint,$point,$i,"moveble");
                        
                        $this->l1 = $r->getDistanceFrom0();
                    }
                    else{
                        $r = new R($fstPoint,$point,$i,"moveble");
                        
                        $this->l2 = $r->getDistanceFrom0();
                    }
                }    
                $line =$segment->line;
                if(property_exists($segment,"line")){
                   
                    if(property_exists($segment,"distLoad")){
                        $coordQ[]=$line->attrs->points[0];
                        $coordQ[]=$line->attrs->points[2];
                        $this->q[] = new Q($line->distLoad->val,$fstPoint,$coordQ);
                    }
                }

               $i++;
            }
            
        

        private function calcSumP($p,$l){
            $sumP =0;
            for($i=0;$i<count($p);$i++){
                $sumP += $p[$i]->val*($p[$i]->getDistanceFrom0() - l);
            }
            return $sumP;
        }
        public function calcR(){
            $l1 =$this->l1;
            $l2 =$this->l2;
            
            $sumM=0;
            $sumP=0;
            $sumQ=0;
            for($i=0;$i<count($this->m);$i++){
                $sumM += $this->m[$i]->val;
            }
            $sumP = $this->calcSumP($this->p,$l1);
          
            for($i=0;$i<count($this->q);$i++){
                $sumQ += $q[i]->$val*($this->q[$i]->getDistanceFrom0()+($this->q[$i]->qLength/2)-$l1);
            }
         
            if($this->r[1]!=NULL) $this->r[1]->val = (-$sumM-$sumP-$sumQ)/($l2-$l1);
            $sumQ =0;
            for($i=0;$i<count($this->q);$i++){
                $sumQ += $q[$i]->$val*(-$this->q[$i]->getDistanceFrom0()-($this->q[$i]->qLength/2)+$l2);
            }
            $sumP = calcSumP($this->p,$l2);
            if($this->r[0]!=NULL) $this->r[0]->val = ($sumM-$sumP-$sumQ)/($l2-$l1);
         
    
            echo json_encode($this->r);
        }
    }
    
    $val = $_REQUEST["segments"];
    
    $calc = new Calc(json_decode($val));
    $calc->calcR();
?>