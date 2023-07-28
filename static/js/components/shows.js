const shows = Vue.component('shows', {
    template: `
    <div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>List of Shows</div>


    <div v-on:click="book_show(show.id)" style="background-color: #E4D0D0; cursor:pointer;" v-for="show in shows" class="card col-3 m-4 " >
            <img src="static/img/show.png" class="card-img-top" alt="Show pic">
            <div class="card-body">
                <h5 class="card-title">[[show.name]]</h5>
                <p class="card-text">Genre : [[show.genre]]</p>
                <p class="card-text">Duration : [[show.duration]]</p>
                <p class="card-text">Seats Remaining : [[show.remaining_capacity]]</p>
                <p class="card-text">Starting at [[show.timing]]</p>
                <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="book_show(show.id)">Book Show</a>
            </div>
    </div>


</div>
    </div>
    `,
    data: function () {
        return {
            shows: [],
            status:0,
            theatre_id: localStorage.getItem('theatre_id')
        }
        },
    delimiters: ['[[', ']]'],
    mounted() {
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') == 'true')
            this.$router.push('/admin_dashboard');
        
            else{
        localStorage.setItem('current_page', 'shows Page');
        fetch("/api/shows/"+this.theatre_id, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
                })
                .then(response => {
                    this.status = response.status;
                    return response
                }
                )
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    this.shows = data.shows;
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );

    }},
    updated() {
        localStorage.setItem('current_page', 'shows Page');
    },
    methods: {
        book_show: function (show_id) {
            localStorage.setItem('show_id', show_id);
            this.$router.push('/book_show');
        }
    }
});

export default shows;