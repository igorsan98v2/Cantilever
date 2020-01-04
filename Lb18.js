function showHint(segments) {
        var r;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
             //   r=this.responseText;

               // document.querySelector("body").innerHTML=r;
                console.log(r);
            }
        };

        xmlhttp.open("GET", "Lb18.php?segments="+JSON.stringify(segments) , true);
        xmlhttp.send();
    
}
