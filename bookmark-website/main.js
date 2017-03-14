
jQuery(window).bind('scroll', function (){
  if (jQuery(window).scrollTop() > 900){
    jQuery('#main-nav').addClass('navbar-fixed-top');
  } else {
    jQuery('#main-nav').removeClass('navbar-fixed-top');
  }
});

jQuery(document).ready(function($) {
  "use strict";
  $('#main-nav .nav').onePageNav({
    currentClass: 'active',
    scrollOffset: 69,
  });  
});

$(document).ready(function(){
   
  //.parallax(xPosition, speedFactor, outerHeight) options:
  //xPosition - Horizontal position of the element
  //inertia - speed to move relative to vertical scroll. Example: 0.1 is one tenth the speed of scrolling, 2 is twice the speed of scrolling
  //outerHeight (true/false) - Whether or not jQuery should use it's outerHeight option to determine when a section is in the viewport
  $('#top').parallax("50%", 0.4);
  $('#testimonial').parallax("50%", 0.4);
  $('#download').parallax("50%", 0.4);
})


$(document).ready(function() {
      $(".owl-carousel").owlCarousel({
        autoPlay: 3000,
        items : 4,
        itemsDesktop : [1199,3],
        itemsDesktopSmall : [979,3]
      });

    });

    jQuery(function( $ ){
          $('#download-app1').localScroll({
            duration:1200
          });
           $('#download-app2').localScroll({
            duration:1000
          });
        });

$( "form" ).submit(function( event ) {
   event.preventDefault();
  var name = $("input#name").val();
  var email = $("input#email").val();
  var subject = $("input#subject").val();
  var message = $("textarea#message").val();
  var firstName = name; // For Success/Failure Message
  // Check for white space in name for Success/Fail message

  // console.log('form submit \n'+ 
  //   'name : ' + name + '\n'+
  //   'email : ' + email + '\n'+
  //   'subject : ' + subject + '\n'+
  //   'message : ' + message);

  if (firstName.indexOf(' ') >= 0) {
      firstName = name.split(' ').slice(0, -1).join(' ');
  }
  $.ajax({
    url: "contact_me.php",
    type: "POST",
    data: {
        name: name,
        email: email,
        subject: subject,
        message: message
    },
    cache: false
  })
  .done(function (data) {
    // console.log("php return data ",data)
    if(data.status && data.status == "success"){
      alert('message sent');
      $("form").trigger("reset");
    }
    else{
      alert('failed to send message. \n'+data.content)
    }
  }).fail(function (data) {
    alert('Network error. Please try again later');
  });
});
