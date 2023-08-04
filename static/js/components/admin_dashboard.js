const admin_theatres = Vue.component('admin-theatres', {
    template: `
        <div>
        <div>
    
        <div class="row d-flex justify-content-center">
    
        <div class='h1 text-center'>My Theatres</div>

        
        <div  style="background-color: #E4D0D0; cursor: pointer;" v-for="theatre in theatres" class="card col-3 m-4 " >
                <img v-on:click="shows(theatre.id)" src="static/img/theatre.png" class="card-img-top" alt="Theatre pic">
                <div class="card-body">
                    <h5 class="card-title">[[theatre.name]]</h5>
                    <p class="card-text">Address : [[theatre.address]]</p>
                    <p class="card-text">City : [[theatre.city]]</p>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="edit_theatre(theatre.id)">Edit</a>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="confirm_delete(theatre.id)">Delete</a>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="add_shows(theatre.id)">Add shows</a>

                    <div class="p-4 m-2 border border-danger rounded" style="background-color: white;" v-if="delete_confirmation && theatre.id == delete_theatre_id">
                    <p>Are you sure you want to delete this Theatre ?</p>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="delete_theatre(theatre.id)">Delete</a>
                    <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="delete_confirmation = false">Cancel</a>
                </div>
                </div>
        </div>

        <div class="col-3 d-flex align-items-center justify-content-center">
    <img src="static/img/plus.png" style="width:20%; cursor: pointer;" v-on:click="add_theatre" alt="Theatre pic">
</div>

    
    
      </div>
    </div>
    <button class="btn btn-primary" @click="generate">
        Generate CSV
    </button>
    </div>
    `,
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            theatres: [],
            status:0,
            delete_confirmation: false,
            delete_theatre_id: -1
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
                        this.$router.go();
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
        
        confirm_delete: function(id){
            console.log("confirm delete");
            this.delete_confirmation = true;
            this.delete_theatre_id = id;
        },

        shows: function(id){
            localStorage.setItem('theatre_id', id);
            this.$router.push('/admin_shows');
        },

        generate: function(){
            fetch('/api/generate_csv',{
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
                    
                    let interval = setInterval(() => {
                        fetch('/status/'+data.task_id)
                        .then(response =>response.json())
                        .then(data => {
                            console.log(data);
                            if(data.Task_State == 'SUCCESS'){
                                window.location.href='/static/theatres.csv'
                                console.log("Task finished")
                                clearInterval(interval);
                            }
                            else{
                                console.log("Task not finished");
                            }
                        })
                    }, 4000);
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );
                
        }
    },

});

export default admin_theatres;