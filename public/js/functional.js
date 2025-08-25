

$('#logout-ref').click(function() {
    alert("Do you really want to Log-out, all your saved blogs will be lost!");
    $.post('/logout')
});


$('#blogSubmit').click(function() {
    // Get values from the form fields
    const title = $('#blog-title').val();
    const text = $('#blog-text').val();
    if (title==='' || text ==='') {
        alert("Please fill in both the title and the text fields.");
        return; // Exit if fields are empty
    }

    // Create a dictionary (object)
    const blogData = {
        title: title,
        text: text
    };

    alert("Do you really want to submit your blog?");
    // console.log(blogData); // For testing: see the object in the console

    $.post('/submitted-blog', blogData, function(response) {
    // handle server response
    });
});

$('.blog-entry').click(function() {
    alert("Feature coming soon: View full blog in a new window!");
    // const blogId = $(this).attr('id').replace('blog', ''); // Extract ID from button ID
    // const blogElement = $('#blog' + blogId);
    // const title = blogElement.find('.blog-content-title').text();
    // const author = blogElement.find('.blog-content-author').text();
    // const text = blogElement.find('.blog-content-text').text();

    // // Create a new window and write the blog content into it
    // const blogWindow = window.open('', '_blank', 'width=600,height=400');
    // blogWindow.document.write(`
    //     <html>
    //     <head>
    //         <title>${title}</title>
    //         <style>
    //             body { font-family: Arial, sans-serif; padding: 20px; }
    //             h1 { font-size: 24px; }
    //             h3 { font-size: 18px; color: gray; }
    //             p { font-size: 16px; line-height: 1.5; }
    //         </style>
    //     </head>
    //     <body>
    //         <h1>${title}</h1>
    //         <h3>${author}</h3>
    //         <p>${text}</p>
    //     </body>
    //     </html>
    // `);
    // blogWindow.document.close(); // Close the document to finish loading
});


