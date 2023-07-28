const admin_theatres = Vue.component('admin-theatres', {
    template: `
        <div>
        <div>
    
        <div class="row d-flex justify-content-center">
    
        <div class='h1 text-center'>My Theatres</div>

        
        <div v-on:click="shows(theatre.id)" style="background-color: #E4D0D0; cursor: pointer;" v-for="theatre in theatres" class="card col-3 m-4 " >
                <img src="static/img/theatre.png" class="card-img-top" alt="Theatre pic">
                <div class="card-body">
                    <h5 class="card-title">[[theatre.name]]</h5>
                    <p class="card-text">Address : [[theatre.address]]</p>
                    <p class="card-text">City : [[theatre.city]]</p>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="edit_theatre(theatre.id)">Edit</a>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="delete_theatre(theatre.id)">Delete</a>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="add_shows(theatre.id)">Add shows</a>
                </div>
        </div>

        <div class="col-3 d-flex align-items-center justify-content-center">
    <img src="static/img/plus.png" style="width:20%; cursor: pointer;" v-on:click="add_theatre" alt="Theatre pic">
</div>

    
    
      </div>
    </div>
    </div>
    `,
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            theatres: [],
            status:0,
        }
    },
    mounted() {

        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') != 'true')
        this.$router.push('/dashboard');
        else{
            localStorage.setItem('current_page', 'Admin Dashboard')
        fetch('/api/admin_theatres', {
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
                    this.theatres = data.theatres;
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );
            }
    },

    methods: {
        add_theatre: function(){
            this.$router.push('/add_theatre');
        },
        edit_theatre: function(id){
            localStorage.setItem('theatre_id', id);
            this.$router.push('/edit_theatre');
        },
        delete_theatre: function(id){
            fetch('/api/delete_theatre/'+id,{
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
                        this.theatres = data.theatres;  
                        this.$router.push('/admin_dashboard');
                    }
                    )
                    .catch((error) => {
                        console.error('Error:', error);
                    }
                    );

        },
        add_shows: function(id){
            localStorage.setItem('theatre_id', id);
            this.$router.push('/add_show');
        },

        shows: function(id){
            localStorage.setItem('theatre_id', id);
            this.$router.push('/admin_shows');
        }
    },

});

export default admin_theatres;