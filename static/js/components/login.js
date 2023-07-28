


const login_component = Vue.component('login-component', {
    template: `
    <div>
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error_message]]
</div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>Login Here</div>

    <div style="background-color: #E4D0D0;" class="card col-4  text-center " >
            <img src="static/img/login.png" class="card-img-top mx-auto my-4" style="width:50%;" alt="Theatre pic">
              
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
                <label class="col-form-label" for="password">Password</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="password" v-model="password" id="password">
            </div>
        </div>
            </div>

                
            <div class="row d-flex">
            <button style="background-color: #867070; border:none;"  class="btn btn-primary col-3 mx-auto m-2" v-on:click="login" type="submit">Login</button>
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
            error_message:'',
            status:0
        }
    },
    methods: {
        
        login: function () {

            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        "username": this.username,
                        "password": this.password
                        })
                })
                .then(response => {
                    this.status = response.status;
                    return response
                })
                .then(response => 
                    response.json()
                    
                )
                .then(data => {
                    console.log('Success:', data);
                    if(this.status != 200){
                        this.error_message = data.message;
                    }else{
                        
                        localStorage.setItem('token', data.access_token);
                        localStorage.setItem('user', data.user);
                        localStorage.setItem('isUserLoggedIn', true);
                        localStorage.setItem('username', data.username);
                        localStorage.setItem('email', data.email);
                        localStorage.setItem('is_admin', data.is_admin);
                        localStorage.setItem('current_page', 'dashboard');
                        
                        if (localStorage.getItem('is_admin') == 'true')
                            this.$router.push('/admin_dashboard');
                        if(localStorage.getItem('is_admin') == 'false')
                            this.$router.push('/dashboard');
                    }
                   
                })
                .catch((error) => {
                    console.error('Error:', error);
                }
                );

        }
    },
    mounted() {
        if (localStorage.getItem('isUserLoggedIn')) {
            if(localStorage.getItem('is_admin') == 'true')
                this.$router.push('/admin_dashboard');
            else
                this.$router.push('/dashboard');
        }
    }
});

export default login_component;