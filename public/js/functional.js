

$('#logout-ref').click(function() {
    alert("Do you really want to Log-out, all your saved blogs will be lost!");
    $.post('/logout')
});

$('#blogSubmit').click(function() {
    alert("Do you really want to submit your blog?");
});


