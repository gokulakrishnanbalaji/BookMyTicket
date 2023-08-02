const editShow = Vue.component('edit_show', {
    template: `
    <div>
    <div>
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error_message]]
</div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>Edit Show - [[name]] </div>

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
                <label class="col-form-label" for="price">Price</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="text" v-model="price" id="price">
            </div>
        </div>

        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="tags">Tags</label>  
                </div>
            <div class="col-8">
                <textarea ref="textarea" rows="1" @input="resizeTextarea" class="form-control" type="text" v-model="tags" id="tags"></textarea>
            </div>
        </div>
            </div>

                
            <div class="row d-flex">
            <button style="background-color: #867070; border:none;"  class="btn btn-primary col-3 mx-auto m-2" v-on:click="edit" type="submit">Edit Show</button>
            </div>
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
            genre: '',
            duration: '',
            timing: '',
            price: '',
            status:0,
            theatre_id: localStorage.getItem('theatre_id'),
            error_message: '',
            tags:''
        }
        },
    mounted() {
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
            return;
        }
        if(localStorage.getItem('is_admin') != 'true'){
            this.$router.push('/dashboard');
            return;
        }
        else{
            
            localStorage.setItem('current_page', 'edit_show');
            fetch('/api/show/' + localStorage.getItem('show_id'), {
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
                    this.name = data.show.name;
                    this.genre = data.show.genre;
                    this.duration = data.show.duration;
                    this.timing = data.show.timing;
                    this.price = data.show.price;
                    this.tags = data.show.tags;
                    
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );

                
        }
        this.resizeTextarea();
    },

    methods: {
        edit: function () {
            if(this.name == '' || this.genre == '' || this.duration == '' || this.timing == '' || this.price == ''){
                this.error_message = 'Please fill all the fields';
                return;
            }
            fetch('/api/show/' + localStorage.getItem('show_id'), {
                method: 'PUT',
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
                    if(this.status == 200){
                        this.$router.push('/shows');
                    }
                    else{
                        this.error_message = data.message;
                    }
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );
        },
        resizeTextarea() {
            this.$refs.textarea.style.height = "auto";
            this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`;
        }
    },
});

export default editShow;