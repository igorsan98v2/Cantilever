var slider = document.querySelector("#range-input input");
var sliderText = document.querySelector("#range-input div span:nth-child(2)");
sliderText.innerHTML = slider.value;

slider.onmousemove =function(){
    sliderText.innerHTML = slider.value;
    refreshText();

}
function getSliderValue(){
    return slider.value;
}
console.log(slider);
console.log(sliderText);