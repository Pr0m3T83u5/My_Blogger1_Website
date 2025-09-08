
// Handle logout click event
$('#logout-ref').click(function() {
    window.location.href = '/';
});
$('#sign-up-ref').click(function() {
    window.location.href = '/signUp';
});
$('#Home-ref').click(function() {
    window.location.href = '/home';
});
if($('#userBreak').text() === ''){
        $('#WriteBlog').addClass('blocked');
        $('#WriteBlog').text('Login to write a blog');
        $('#yourBlogs p').text('Blogs');
        $('#logout-ref').replaceWith('<button id="login-ref" class="log-items navitems">Login or Sign-up</button>');
} else {
    $('#WriteBlog').removeClass('blocked');
    $('#WriteBlog').text('Write a blog and express yourself');
}
$('#login-ref').click(function() {
    console.log("Login clicked");
    window.location.href = '/login';
});

// Handle blog submission
$('#blogSubmit').click(function() {
    // Get values from the form fields
    const title = $('#blog-title').val();
    const text = $('#blog-text').val();
    if (title==='' || text ==='') {
        alert("Please fill in both the title and the text fields.");
        return; // Exit if fields are empty
    }
    // Create a dictionary for blog data (object)
    const blogData = {
        title: title,
        content: text
    };
    alert("Do you really want to submit your blog?");
    $.post('/submitted-blog', blogData, function() {
        window.location.href = '/home'; // Redirect to home after submission 
    });
});



// Handle when edit or delete button is clicked IF user has access
$('.edit-delete-button').click(function() {
    let blogId = $(this).attr('id').split('-')[2]; // Extract blog ID from button ID
    let action = $(this).attr('id').split('-')[0]; // "edit" or "delete"
    if (action === 'delete') {
        if (confirm("Are you sure you want to delete this blog?")) {
            $.post(`/blog/${blogId}/delete`, function() {
                window.location.href = '/home'; // ✅ Redirect after success
            });
        }
    } else if (action === 'edit') {
        $.post(`/blog/${blogId}/edit`, function(){
            window.location.href = "/blog/"+ blogId +"/edit";
        });
    }
});



// Handle confirm Edit blog event
$('#blogEdit').click(function() {
    // Get values from the form fields
    let title = $('#blog-title').val();
    let text = $('#blog-text').val();
    let id = $('#id').val();
    if (title==='' || text ==='') {
        alert("Please fill in both the title and the text fields.");
        return; // Exit if fields are empty
    }
    // Create a dictionary for blog data (object)
    let blogData = {
        id: id,
        title: title,
        content: text
    };
    if(confirm("Confirm?")){
        $.post('/edit-blog/'+ id, blogData, function() {
        window.location.href = `/blog/${id}`; // Redirect to home after editing
        });
    }
});



