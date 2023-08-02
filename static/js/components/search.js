const search_component = Vue.component('search_component', {
    template: `
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[ error_message ]]
</div>
    <h1 class="text-center">Search Page</h1>
    <div class="row d-flex">
    <div class="col-4 mx-auto text-center m-4">
        <input v-model="search_string" class="form-control" type="text" placeholder="Search here">
    </div>
    </div>

    <div class="row d-flex">
        <button v-on:click="search" class="btn btn-primary col-1 mx-auto">Search</button>
    </div>
    
</div>
    `,
    data: function () {
        return{
            search_string:'',
            error_message:'',
            status:0,
            show_output:[],
            theatre_output:[],
        }
    }
    ,
    delimiters: ['[[', ']]']
    ,

    mounted(){
        if(!localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
            return;
        }
        if( localStorage.getItem('is_admin') == true){
            this.$router.push('/admin_dashboard')
            return;
        }
        else{
            localStorage.setItem('current_page', 'search page');
        }
    },



})


export default search_component;