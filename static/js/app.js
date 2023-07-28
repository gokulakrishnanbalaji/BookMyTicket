import router from "./routes.js";


new Vue({
    el: '#app',
    router,
    delimiters: ['[[', ']]'],
    data: {
        message: 'Hello Vue!',
        token: null,
        user: null,
        isUserLoggedIn: localStorage.getItem('isUserLoggedIn'),
        status:0,
        username: null,
        email: null,
        is_admin: localStorage.getItem('is_admin'),
        current_page: null,
    },
    updated() {
        this.token = localStorage.getItem('token');
        this.user = localStorage.getItem('user');
        this.isUserLoggedIn = localStorage.getItem('isUserLoggedIn');
        this.username = localStorage.getItem('username');
        this.email = localStorage.getItem('email');
        if(localStorage.getItem('is_admin') == 'true'){
            this.is_admin = true;
        }else{
            this.is_admin = false;
        }
        this.current_page = localStorage.getItem('current_page');
    },
    mounted() {
        
        if(localStorage.getItem('isUserLoggedIn')){
            this.token = localStorage.getItem('token');
            this.user = localStorage.getItem('user');
            this.isUserLoggedIn = localStorage.getItem('isUserLoggedIn');
            this.username = localStorage.getItem('username');
            this.email = localStorage.getItem('email');
            if(localStorage.getItem('is_admin') == 'true'){
                this.is_admin = true;
            }else{
                this.is_admin = false;
            }

            this.current_page = localStorage.getItem('current_page');
        }else{

            this.$router.push('/login');
        }




    },
    methods: {
        logout: function () {
            console.log(localStorage.getItem('token'));
            fetch('/api/logout', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization":`Bearer ${localStorage.getItem('token')}`
                    }
                })
                .then(response => {
                    this.status = response.status;
                    return response
                })
                .then(response => response.json())
                .then(data => {
                    if(this.status == 200){
                    console.log('Success:', data);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('isUserLoggedIn');
                    localStorage.removeItem('username');
                    localStorage.removeItem('email');
                    localStorage.removeItem('is_admin');
                    localStorage.removeItem('current_page');
                    
                    this.$router.push('/login');
                    }
                else{
                    console.log('Error:', data);
                }
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );
        }
    }
});

