const register_component = Vue.component('register-component', {
    template: `
    <div>
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error_message]]
</div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>Register Here</div>

    <div style="background-color: #E4D0D0;" class="card col-4  text-center " >
            <img src="static/img/register.png" class="card-img-top mx-auto my-4" style="width:50%;" alt="Theatre pic">
              
            <div class="card-body">
            <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="name">Usename</label>
            </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="username" id="name">
            </div>
        </div>

            <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="email">Email</label>
            </div>
            <div class="col-8">
                <input class="form-control" type="email" v-model="email" id="email">
            </div>
        </div>
        
        
        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="password">Password</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="password" v-model="password" id="password">
            </div>
        </div>
            
        <div class="row my-2">
            <div class="col-6">
                <label class="col-form-label" for="is_admin">Register as admin</label>  
                </div>
            <div class="col-6 form-check">
                <input class="form-control form-check-input" type="checkbox" v-model="is_admin_check" id="is_admin">
            </div>
        </div>
            

        <div v-if="is_admin_check" class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="admin_key">Admin Key</label>  
                </div>
            <div class="col-8">
                <input class="form-control " type="password" v-model="admin_key" id="admin_key">
            </div>
        </div>

            </div>

                
            <div class="row d-flex">
            <button style="background-color: #867070; border:none;"  class="btn btn-primary col-3 mx-auto m-2" v-on:click="register" type="submit">Register</button>
            </div>
    </div>
        
    </div>

    </div>
    </div>
    `,
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            username: '',
            password: '',
            email: '',
            error_message:'',
            status:0,
            is_admin_check:false,
            admin_key:'',
            is_admin:false,
           
        }
    }
    ,
    methods: {
        register: function () {
            if(this.username == '' || this.password == '' || this.email == ''){
                this.error_message = 'Please fill all the fields';
                return;
            }
            if(this.is_admin_check){
                if(this.admin_key == 'admin'){
                    this.is_admin = true;
                }else{
                    this.error_message = 'Invalid admin key';
                    return;
                }
            }
                
                fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify({
                            "username": this.username,
                            "password": this.password,
                            "email": this.email,
                            "is_admin": this.is_admin
                            })
                    })
                    .then(response => {
                        this.status = response.status;
                        return response
                        })
                    .then(response => response.json())
                    .then(data => {
                        if(this.status != 200){
                            this.error_message = data.message;
                        }else{
                        console.log('Success:', data);
                        this.$router.push('/login');
                        }
                    
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    }
                    );
            }
        }
    }
);

export default register_component;