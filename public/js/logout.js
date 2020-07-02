//$(document).ready(function(){
    
    $('.logout').on('click', function(){
        
        alert('Here');
        
       function preventBack(){window.history.forward();}
        setTimeout("preventBack()", 0);
        window.onunload=function(){null};

    });
    
//}