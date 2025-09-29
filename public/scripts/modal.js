const modal = document.querySelector(".modal");
const trigger = document.querySelector(".editdm");
const closeButton = document.querySelector(".close-modal");

trigger.addEventListener("click", () => {
    modal.classList.toggle("showmodal");
});

closeButton.addEventListener("click", () => {
    modal.classList.toggle("showmodal");
});
