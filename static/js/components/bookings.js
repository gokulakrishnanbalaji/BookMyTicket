const bookings = Vue.component("bookings", {
  template: `
    <div>
    
    <div class="row d-flex justify-content-center">
  <div v-if="error" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error]]
</div>
    <h1 class="text-center m-4">My Bookings</h1>
    <div class="col-8">
    <div v-for="booking in bookings">
        <div style="background-color: #E4D0D0;" class="card m-4">
            <div class="card-header" style="background-color: #D5B4B4;">
            <div  class="row">
            <div class="col-8">
                <p>Timing : [[booking.show_timing]] </p>
               
            </div>
        
            <div class="col-4">
                <p>No of tickets : [[booking.tickets]] tickets</p>
            </div>
        </div>
            </div>
            <div class="card-body">
            <div  class="row">
            <div class="col-8">
            <h5 class="card-title">[[booking.show_name]] at [[ booking.theatre_name]]</h5>
               
            </div>
        
            <div class="col-4">
                <div  class="row">
                    <div class="col-4">
                        <p>Rating</p>
                    
                    </div>
            
                    <div class="col-4">
                    <input class="form-control" type="number" v-model="booking.rating">
                    </div>

                    <div class="col-4">
                    <button v-on:click="rate(booking.id,booking.rating)" class="btn btn-primary" style="background-color: #867070; border:none;">Rate</button>
                    </div>
                </div>
        </div>
              
                
              
            </div>
          </div>
    </div>
</div>
</div>
</div>
</div>
    `,
  delimiters: ["[[", "]]"],
  data: function () {
    return {
      bookings: [],
      status: 0,
        rating: 0,
        error:"",
    };
  },
  mounted() {
    if (!localStorage.getItem("isUserLoggedIn")) {
      this.$router.push("/login");
    } 
    if(localStorage.getItem("is_admin") == "true"){
        this.$router.push("/admin_dashboard");
    }
    else{
    localStorage.setItem("current_page", "bookings");

    fetch("/api/bookings", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        this.status = response.status;
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        if (this.status === 200) {
          this.bookings = data.bookings;
        } else {
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }},

    methods: {
        rate: function (booking_id, booking_rating) {
            if(! booking_rating){
                this.error = "Please enter a rating";
                return;
            }
            if(booking_rating < 0 || booking_rating > 5){
                this.error = "Please enter a rating between 0 and 5";
                return;
            }
            fetch("/api/rate_show", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    booking_id: booking_id,
                    rating: booking_rating,
                }),
            })
                .then((response) => {
                    this.status = response.status;
                    return response;
                }
                )
                .then((response) => response.json())
                .then((data) => {
                    console.log("Success:", data);
                    this.error="";
                }
                )
                .catch((error) => {
                    console.error("Error:", error);
                }
                );

        },
    },
});

export default bookings;
