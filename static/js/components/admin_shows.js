const adminShows = Vue.component('admin_shows', {
    template: `
    <div>
    <div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>List of Shows</div>


    <div style="background-color: #E4D0D0; " v-for="show in shows" class="card col-3 m-4 " >
            <img src="static/img/edit_show.png" class="card-img-top mx-auto" style="width:70%;" alt="Show pic">
            <div class="card-body">
                <h5 class="card-title">[[show.name]]</h5>
                <p class="card-text">Genre : [[show.genre]]</p>
                <p class="card-text">Duration : [[show.duration]]</p>
                <p class="card-text">Seats Remaining : [[show.remaining_capacity]]</p>
                <p class="card-text">Starting at [[show.timing]]</p>
                <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="edit_show(show.id)">Edit Show</a>
                <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="delete_show(show.id)">Delete Show</a>
            </div>
    </div>

    <div class="col-3 d-flex align-items-center justify-content-center">
        <img src="static/img/plus.png" style="width:20%; cursor: pointer;" v-on:click="add_show" alt="Theatre pic">
    </div>


</div>
    </div>
 
    </div>
    `,
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            shows: [],
            status:0,
            theatre_id: localStorage.getItem('theatre_id')
        }
        }
    ,
    mounted() {
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') == 'false')
            this.$router.push('/dashboard');
        
            else{
        localStorage.setItem('current_page', 'shows Page');
        fetch("/api/shows/"+localStorage.getItem('theatre_id'), {
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
            }
    },

    methods: {
        delete_show: function (show_id) {
            fetch("/api/show/"+show_id, {
                method: 'DELETE',
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
                        this.$router.go();
                    }
                    )
                    .catch((error) => {
                        console.error('Error:', error);
                    }
                    );
        },
        add_show: function(){
            localStorage.setItem('theatre_id', this.theatre_id);
            this.$router.push('/add_show');
        },
        edit_show: function(show_id){
            localStorage.setItem('show_id', show_id);
            this.$router.push('/edit_show');
        }


    },

});

export default adminShows;