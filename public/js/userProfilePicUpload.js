//For userprofile file upload

$(document).ready(function(){
    
    console.log("Here");
    $('#continuepp').attr("disabled", "disabled");
    $('#closeafterupload').hide();
    
    $('#continuepp').click(function(e){
        if($('#continuepp').attr("disabled") == "disabled"){
            e.preventDefault();
        }
    });
    
    $('.profile-pic-upload-btn').on('click', function(){
        $('#profile-pic-upload-input').click();
        
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    });
    
    $('#profile-pic-upload-input').on('change', function(){
        var uploadInput = $('#profile-pic-upload-input');
        
        if(uploadInput.val() != ''){
           var formData = new FormData();
            
            formData.append('upload', uploadInput[0].files[0]);
            
            console.log(formData);
            
            $.ajax({
                url: '/profilepic/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data){
                    uploadInput.val('');
                },
                
                xhr: function(){
                    var xhr = new XMLHttpRequest();
                    
                    xhr.upload.addEventListener('progress', function(e){
                        if(e.lengthComputable){
                            var uploadPercent = e.loaded / e.total;
                            uploadPercent = (uploadPercent * 100);
                            
                            $('.progress-bar').text(uploadPercent+'%');
                            $('.progress-bar').width(uploadPercent+'%');
                            
                            if(uploadPercent === 100){
                                $('.progress-bar').text('Completed');
                                $('#completed').text('File Uploaded');
                                $('.profile-pic-upload-btn').hide();
                                $('#closeafterupload').show();
                            }
                            
                            $('#continuepp').removeAttr("disabled");
                            
                        }
                    }, false);
                    
                    return xhr;
                }
            })
        }
    }) 
    
     $('#closeafterupload').on('click', function(){
         $('#closeafterupload').hide();
         $('.profile-pic-upload-btn').show();
    });
})