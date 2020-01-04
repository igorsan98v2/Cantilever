function fillDropDown(list,pageListNum){
   let dropDownContainer = document.querySelector(".dropdown-content  ul:nth-child("+pageListNum+
")");

   for(let i=0;i<list.length;i++){
       dropDownContainer.innerHTML+="<li>"+list[i]+"</li>";
   }
   fillDropDownInput();
}
function fillDropDownInput(){
    for(let z=1;z<1+document.querySelectorAll(".dropdown").length;z++){
        let dd = document.querySelector(".dropdown:nth-child("+z+") input");
        let dropDownList = document.querySelectorAll(".dropdown-content:nth-child("+z+") ul li");
        for(let i=0;i<dropDownList.length;i++){
            dropDownList[i].onclick = function(){
            dd.value = this.innerHTML;     
            }
        }
    }
}