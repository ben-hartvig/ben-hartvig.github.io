// Listen for click on marathon buttons in network vis
const marathonButtons = document.querySelectorAll('.marathon-button');
marathonButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Get the selected marathon from the data attribute
        const selectedMarathon = this.getAttribute('data-marathon');

        // Call a method to update the network visualization
        networkVis.filterByMarathon(selectedMarathon);

        // Remove the "selected" class from all buttons
        marathonButtons.forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add the "selected" class to the clicked button
        this.classList.add('selected');
    });
});


// Listen to the slide with the course map and update when necessary
function observeSection2() {
    let section2 = document.getElementById('section2');
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                marathonMapVis.addCityMarkers();
                marathonMapVis.snake();
            } else {
                marathonMapVis.clearCityMarkers();
                marathonMapVis.resetSnake();
            }
        });
    }, { threshold: [0.5] });

    observer.observe(section2);
}