document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const options = document.querySelectorAll('.dropdown-content div');
    const select = document.querySelector('.custom-select');

    dropdownBtn.addEventListener('click', () => {
        dropdownBtn.classList.toggle('active');
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            dropdownBtn.innerHTML = option.innerHTML;
            dropdownBtn.classList.remove('active');
            select.value = option.getAttribute('data-value');
        });
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', function(event) {
        if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
            dropdownBtn.classList.remove('active');
        }
    });
});
