

const welcome = Vue.component('welcome', {
    template: `
    <div>
        <h1>Welcome</h1>

        <p>    Welcome to our website for booking tickets to the most exciting shows in town! Whether you're a fan of live music concerts, theater performances, comedy shows, or sporting events, we've got you covered. 
</p>

<p>    Explore our diverse range of shows featuring top artists and performers from around the world. Choose your preferred event, select your seats, and secure your tickets hassle-free, all from the comfort of your home.
</p>

<p>    With our user-friendly interface, you can easily browse upcoming shows, check available dates, and find the perfect tickets that fit your schedule and budget. We offer a seamless booking experience, ensuring you don't miss out on any of the action.
</p>

<p>    Don't let any moment slip away – be it a mind-blowing concert, a captivating play, or a thrilling sports match. Join us and immerse yourself in the magic of live entertainment. Book your tickets now and get ready for an unforgettable experience!
</p>
    </div>
    `,
    mounted() {
        localStorage.setItem('current_page', 'welcome Page');

    }
});

export default welcome;