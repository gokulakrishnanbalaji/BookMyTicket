const dashboard_component = Vue.component('dashboard',{
    template:`
    <div>
    
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>List of Theatres</div>

    <div v-on:click="display_shows(theatre.id)" style="background-color: #E4D0D0; cursor:pointer;" v-for="theatre in theatres" class="card col-3 m-4 " >
            <img src="static/img/theatre.png" class="card-img-top" alt="Theatre pic">
            <div class="card-body">
                <h5 class="card-title">[[theatre.name]]</h5>
                <p class="card-text">Address : [[theatre.address]]</p>
                <p class="card-text">City : [[theatre.city]]</p>
                <a style="background-color: #867070; border:none;"  class="btn btn-primary" v-on:click="display_shows(theatre.id)">View Shows</a>
            </div>
    </div>


  </div>
</div>
    `,
    delimiters: ['[[', ']]'],

    data: function () {
        return {
            theatres: [],
            status:0,
        }
    },


    mounted() {
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') == 'true')
            this.$router.push('/admin_dashboard');
        else{
            localStorage.setItem('current_page', 'dashboard');
           

        fetch('/api/theatres', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
            .then(response => {
              this.status = response.status;
              return response;
            }).then(response => response.json())
            .then(data => {
              if (this.status === 200) {
                this.theatres = data.theatres;
              } else {
                console.log(data);
              }
            })
            .catch((error) => {
              console.error('Error:', error);
            });
          
    }
},
methods: {
    display_shows: function (theatre_id) {

      localStorage.setItem('theatre_id', theatre_id);
        this.$router.push('/shows');
    }
  }

  
})

export default dashboard_component