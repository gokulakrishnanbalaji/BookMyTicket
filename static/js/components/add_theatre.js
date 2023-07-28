const add_theatre = Vue.component('add_theatre', {
    template: `
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error_message]]
</div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>Add Theatre</div>

    <div style="background-color: #E4D0D0;" class="card col-4  text-center " >
            <img src="static/img/add_theatre.png" class="card-img-top mx-auto" style="width:70%;" alt="Theatre pic">
              
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
            <button style="background-color: #867070; border:none;"  class="btn btn-primary col-3 mx-auto m-2" v-on:click="add" type="submit">Add theatre</button>
            </div>
    </div>
        
    </div>

    </div>
    `,
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            name: '',
            status:0,
            address: '',
            city: '',
            error_message:'',
            capacity:0
        }
    },
    mounted() {
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') != 'true')
            this.$router.push('/dashboard');
        else{
            localStorage.setItem('current_page', 'add_theatre');
        }
    },

    methods: {
        add: function () {
            if(this.name == '' || this.address == '' || this.city == '' || this.capacity == 0){
                this.error_message = "Please fill all the fields";
            }else{
                fetch('/api/theatres', {
                    method: 'POST',
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
                        console.log('Success:', data);
                        if (this.status === 200) {
                            this.$router.push('/admin_dashboard');
                        } else {
                            this.error_message = data.message;
                        }
                    }
                    )
                    .catch((error) => {
                        console.error('Error:', error);
                    }
                    )

            }
        }
    }

});

export default add_theatre;