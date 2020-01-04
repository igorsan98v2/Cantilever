$(document).ready(function() {
    var isMenuOpen = false;
  
    $(".menu-btn").click(function() {
      if (isMenuOpen == false) {
        $("header")
          .clearQueue()
          .animate({
            left: "0px"
          });
        $("#grey_back").fadeIn("fast");
        $(this).fadeOut(200);
        $(".close").fadeIn(300);
  
        isMenuOpen = true;
      }
    });
    $("#grey_back").click(function() {
      if (isMenuOpen == true) {
        $("header")
          .clearQueue()
          .animate({
            left: "-300px"
          });
        $("#page")
          .clearQueue()
          .animate({
            "margin-left": "0px"
          });
        $("#grey_back").fadeOut("fast");
        $(this).fadeOut(200);
        $(".menu-btn").fadeIn(300);
  
        isMenuOpen = false;
      }
    });
  });