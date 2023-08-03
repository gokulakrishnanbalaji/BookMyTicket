const search_component = Vue.component('search_component', {
    template: `
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[ error_message ]]
    </div>
    <div class="card m-4 p-4" style="background-color: #E4D0D0 ">
    <h1 class="text-center my-2 ">Search</h1>
<div class="row">
<div class="col-6">
    <h1 class="text-center">Theatre</h1>
    <div class="row">
    <div col-6 >
        <input v-model="search_theatre" class="form-control " type="text" placeholder="Search here">
    </div>
    <div v-on:click="toggle_theatre_name" class="form-check m-3">
  <input  class="form-check-input" type="radio" name="flexRadioDefault" value="true" id="Theatre Name" checked>
  <label class="form-check-label" for="Theatre Name">
    Theatre Name
  </label>
</div>
    

    <div class="form-check m-3" v-on:click="toggle_theatre_location">
  <input class="form-check-input" type="radio" name="flexRadioDefault" value="true" id="Theatre Location">
  <label class="form-check-label" for="Theatre Location">
    Theatre Location
  </label>
</div>
</div>
</div>

<div class="col-6">
    <h1 class="text-center">Show</h1>
    <div class="row">
    <div col-6>
        <input v-model="search_show" class="form-control " type="text" placeholder="Search here">
    </div>
    <div class="form-check m-2" v-on:click="toggle_show_name" >
    <input class="form-check-input" type="radio" name="flexRadioDefault1" value="true" id="Show Name" checked>
    <label class="form-check-label" for="Show Name">
      Show Name
    </label>
  </div>
      
  
      <div class="form-check m-2" v-on:click="toggle_show_tags">
    <input class="form-check-input" type="radio" name="flexRadioDefault1" value="true" id="Show Tags">
    <label class="form-check-label" for="Show Tags">
      Show Tags
    </label>
  </div>

      <div class="form-check m-2" v-on:click="toggle_show_rating">
    <input class="form-check-input" type="radio" name="flexRadioDefault1" value="true" id="Show Rating">
    <label class="form-check-label" for="Show Rating">
      Show Rating
    </label>
  </div>
    </div>
    
</div>
</div>
<div class="row d-flex">
    <button class="btn btn-primary col-1 m-4 mx-auto" style="background-color: #867070; border:none" v-on:click="search">Search</button>
</div>
</div>

<h1  class="text-center"> Result </h1>
<div class="row d-flex justify-content-center">
<div  style="background-color: #E4D0D0; cursor: pointer;" v-for="theatre in theatre_output" class="card col-3 m-4 d-flex" >
                <img v-on:click="theatre_shows(theatre.id)" src="static/img/theatre_search.png" style="width:70%;" class="card-img-top mx-auto m-2" alt="Theatre pic">
                <div class="card-body">
                    <h5 class="card-title">[[theatre.name]]</h5>
                    <p class="card-text">Address : [[theatre.address]]</p>
                    <p class="card-text">City : [[theatre.city]]</p>
                </div>
                </div>
        </div>
  
        

<div class="row d-flex justify-content-center">
<div  style="background-color: #E4D0D0; cursor: pointer;" v-for="show in show_output" class="card col-3 m-4 d-flex" >
                <img v-on:click="book_show(show.id)" src="static/img/theatre_search.png" style="width:70%;" class="card-img-top mx-auto m-2" alt="Theatre pic">
                <div class="card-body">
                    <h5 class="card-title">[[show.name]]</h5>
                    <p class="card-text">Genre : [[show.genre]]</p>
                    <p class="card-text">Seats Available : [[show.remaining_capacity]]</p>
                    <p class="card-text">Price : [[show.price]]</p>
                    <p class="card-text">Tags : [[show.tags]]</p>
                    <p class="card-text">Theatre Name : [[show.theatre_name]]</p>
                    <p class="card-text">City : [[show.city]]</p>
                </div>
                </div>
        </div>
     
      

    

</div>
    `,
    data: function () {
        return{
            search_show:'',
            search_theatre:'',
            error_message:'',
            status:0,
            show_output:[],
            theatre_output:[],
            theatre_name:false,
            theatre_location:false,
            show_name:false,
            show_tags:false,
            show_rating:false,
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
            if(this.show_name== '' && this.show_tags== '' && this.show_rating== ''){
                this.show_name='true';
            }
            if(this.theatre_name== '' && this.theatre_location== ''){
                this.theatre_name='true';
            }
        }
    },
    methods:{
        search(){
            this.show_output = [];
            this.theatre_output = [];
            this.error_message = '';

            if(this.search_theatre == ''){
                this.error_message = 'Please enter a valid search query';
                return;
            }  
            console.log(this.theatre_name, this.theatre_location, this.show_name, this.show_tags, this.show_rating);
            fetch('/api/search',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Accept': 'application/json'
                },
                body:JSON.stringify({
                    'theatre':this.search_theatre,
                    'show':this.search_show,
                    'theatre_name':this.theatre_name,
                    'theatre_location':this.theatre_location,
                    'show_name':this.show_name,
                    'show_tags':this.show_tags,
                    'show_rating':this.show_rating, 
                })
            })
            .then(response => {
                this.status = response.status;
                return response.json();
            })
            .then(data => {
                if(this.status == 200){
                    this.error_message = '';
                    this.show_output = data['shows'];
                    this.theatre_output = data['theatres'];
                }
                else{
                    this.error_message = data['message'];
                }
            }
            )
            .catch(error => {
                console.log(error);
            }
            )


                    
    },

    toggle_theatre_name(){
        if(this.theatre_name == false){
            this.theatre_name = true;
            this.theatre_location = false;
        }
    }
    ,
    toggle_theatre_location(){
        if(this.theatre_location == false){
            this.theatre_location = true;
            this.theatre_name = false;
        }
    }

    ,
    toggle_show_name(){
        if(this.show_name == false){
            this.show_name = true;
            this.show_tags = false;
            this.show_rating = false;
        }
    },
    toggle_show_tags(){
        if(this.show_tags == false){
            this.show_tags = true;
            this.show_name = false;
            this.show_rating = false;
        }
    },
    toggle_show_rating(){
        if(this.show_rating == false){
            this.show_rating = true;
            this.show_name = false;
            this.show_tags = false;
        }
    },

    theatre_shows(id){
        localStorage.setItem('theatre_id', id);
        this.$router.push('/shows');
    },
    book_show(id){
        localStorage.setItem('show_id', id);
        this.$router.push('/book_show');
    }
}



})


export default search_component;