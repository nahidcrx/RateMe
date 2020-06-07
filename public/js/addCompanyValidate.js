$(document).ready(function(){
    $('#register').on('click', function(){
        var name = $.trim($('#name').val());
        var address = $.trim($('#address').val());
        var city = $.trim($('#city').val());
        var country = $.trim($('#country').val());
        var sector = $.trim($('#sector').val());
        var website = $.trim($('#website').val());
        var img = $.trim($('#upload-input').val());
        
        var isValid = true;
        
         if(name == ''){
            isValid = false;
            $('#errorMessage1').html('<div class="alert alert-danger">Name field is empty</div>');
        }else{
            $('#errorMessage1').html('');
        }
        
        if(address == ''){
            isValid = false;
            $('#errorMessage2').html('<div class="alert alert-danger">Address field is empty</div>');
        }else{
            $('#errorMessage2').html('');
        }
        
        if(city == ''){
            isValid = false;
            $('#errorMessage3').html('<div class="alert alert-danger">City field is empty</div>');
        }else{
            $('#errorMessage3').html('');
        }
        
        if(country == ''){
            isValid = false;
            $('#errorMessage4').html('<div class="alert alert-danger">Country field is empty</div>');
        }else{
            $('#errorMessage4').html('');
        }
        
        if(sector == ''){
            isValid = false;
            $('#errorMessage5').html('<div class="alert alert-danger">Sector field is empty</div>');
        }else{
            $('#errorMessage5').html('');
        }
        
        if(website == ''){
            isValid = false;
            $('#errorMessage6').html('<div class="alert alert-danger">Website field is empty</div>');
        }else{
            $('#errorMessage6').html('');
        }
        
        return isValid;
        
//        if(isValid == true){
//            var companyData = {
//                name: name,
//                address: address,
//                city: city,
//                country: country,
//                sector: sector,
//                website: website,
//                img: img
//            };
//            
//            $.ajax({
//                url: '/company/create',
//                type: 'POST',
//                data: companyData,
//                success: function(data){
//                    $('#name').val('');
//                    $('#address').val('');
//                    $('#city').val('');
//                    $('#country').val('');
//                    $('#sector').val('');
//                    $('#website').val('');
//                }
//            })
//            
//        }else{
//            return false;
//        }
    });
})