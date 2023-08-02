const addShow = Vue.component('add_show', {
    template: `
    <div>
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error_message]]
</div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>Add show for [[theatre_name]] theatre</div>

    <div style="background-color: #E4D0D0;" class="card col-4  text-center " >
            <img src="static/img/add_show.png" class="card-img-top mx-auto" style="width:70%;" alt="Theatre pic">
              
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
                <label class="col-form-label" for="genre">Genre</label>
            </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="genre" id="genre">
            </div>
        </div>
        
        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="duration">Duration</label>
            </div>
            <div class="col-8">
                <input class="form-control" type="number" v-model="duration" id="city">
            </div>
        </div>
        
        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="timing">Timing</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="timing" id="timing">
            </div>
        </div>

        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="tags">Tags</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="tags" id="tags">
            </div>
        </div>

        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="price">Price</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="number" v-model="price" id="price">
            </div>
        </div>
            </div>

                
            <div class="row d-flex">
            <button style="background-color: #867070; border:none;"  class="btn btn-primary col-3 mx-auto m-2" v-on:click="add" type="submit">Add Show</button>
            </div>
    </div>
        
    </div>

    </div>
    </div>
    `,
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            theatre_name:'',
            status:0,
            error_message:'',
            name:'',
            price:0,
            timing:'',
            genre:'',
            duration:0,
            theatre_id: localStorage.getItem('theatre_id'),
            tags:''
        }
    }
    ,
    mounted(){
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') != 'true')
        this.$router.push('/dashboard');
        else{
            localStorage.setItem('current_page', 'Add Show')

            fetch("/api/theatre/"+this.theatre_id, {
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
                        this.theatre_name = data.theatre.name;
                    }
                    )
        }
    },
    methods: {
        add: function () {
            if(this.name == '' || this.genre == '' || this.duration == '' || this.timing == '' || this.price == ''){
                this.error_message = 'Please fill all the fields';
                return;
            }
            fetch('/api/shows', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: this.name,
                    genre: this.genre,
                    duration: this.duration,
                    timing: this.timing,
                    price: this.price,
                    theatre_id: this.theatre_id,
                    tags: this.tags
                })
            })
                .then(response => {
                    this.status = response.status;
                    return response
                }
                )
                .then(response => response.json())
                .then(data => {
                    if(this.status !=200){
                        this.error_message = data.message;
                    }
                    else{
                        this.$router.push('/admin_dashboard');
                    }
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );
        }
    },
});

export default addShow;
