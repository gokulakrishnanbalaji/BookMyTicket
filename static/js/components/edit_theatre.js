const editTheatre = Vue.component('edit_theatre', {
    template: `
    <div>
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error_message]]
</div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>Edit Theatre [[name]] </div>

    <div style="background-color: #E4D0D0;" class="card col-4  text-center " >
            <img src="static/img/edit_theatre.png" class="card-img-top mx-auto my-4" style="width:60%;" alt="Theatre pic">
              
            <div class="card-body">
            <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="name">Name</label>
            </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="name" id="name">
            </div>
        </div>
        
        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="address">Address</label>
            </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="address" id="address">
            </div>
        </div>
        
        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="city">City</label>
            </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="city" id="city">
            </div>
        </div>
        
        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="capacity">Capacity</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="number" v-model="capacity" id="capacity">
            </div>
        </div>
            </div>

                
            <div class="row d-flex">
            <button style="background-color: #867070; border:none;"  class="btn btn-primary col-3 mx-auto m-2" v-on:click="edit" type="submit">Edit theatre</button>
            </div>
    </div>
        
    </div>

    </div>
    </div>
    `,
    delimiters: ['[[', ']]'],

    data: function () {
        return {
            name: '',
            address: '',
            city: '',
            capacity: '',
            error_message: '',
            status: 0,
        }
    },

    mounted() {
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') != 'true')
            this.$router.push('/dashboard');
        else{
            localStorage.setItem('current_page', 'edit_theatre');
            fetch('/api/theatre/' + localStorage.getItem('theatre_id'), {
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
                    this.name = data.theatre.name;
                    this.address = data.theatre.address;
                    this.city = data.theatre.city;
                    this.capacity = data.theatre.capacity;
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );

        }
    },

    methods: {
        edit: function () {

            if(this.name == '' || this.address == '' || this.city == '' || this.capacity == 0){
                this.error_message = "Please fill all the fields";
                return;
            }

            fetch('/api/update_theatre/'+localStorage.getItem('theatre_id'),{
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        name: this.name,
                        address: this.address,
                        city: this.city,
                        capacity: this.capacity
                    })

            })
            .then(response => {
                this.status = response.status;
                return response
            }
            )
            .then(response => response.json())
            .then(data => {
                if(this.status != 200){
                    this.error_message = data.message;
                    return;
                }
                console.log('Success:', data);
                this.$router.push('/admin_dashboard');
            }
            )
            .catch((error) => {
                console.error('Error:', error);
            }
            );

        },
    }
});

export default editTheatre;
    