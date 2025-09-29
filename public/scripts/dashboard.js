const bars = document.querySelector(".fa-bars");
const sidebar = document.querySelector(".sidebar");
const closingButton = document.querySelector(".fa-times");
const content = document.querySelector(".content");
const body = document.querySelector(".body");

// js script to toogle sidebar on and off
bars.addEventListener("click", () => {
    sidebar.classList.toggle("show-sidebar");
    sidebar.classList.toggle("media-showsidebar")
    body.classList.toggle("body-margin");
});

closingButton.addEventListener("click", () => {
    sidebar.classList.toggle("media-showsidebar");
    content.classList.toggle("contentpad");
});


function myFunction() {
    /* Get the text field */
    var copyText = document.getElementById("copy");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);

    /* Alert the copied text */
    // alert("Text Copied!: " + copyText.value);
}

