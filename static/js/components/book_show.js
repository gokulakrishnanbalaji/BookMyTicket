const book_show = Vue.component('book_show', {
    template: `
    <div d-flex justify-content-center>
    <h1 class="text-center">[[show.name]] at [[theatre.name]]</h1>
    <div v-if="error" class="alert alert-warning alert-dismissible fade show" role="alert" >
        [[error]]
    </div>
    

    <div class="row">

    <div class="card mx-auto d-block col-6" style="width: 30rem; background-color: #F5EBEB; border:none">
    <img src="static/img/book.png" class="card-img-top mx-auto d-block m-5" alt="..." style="width:30%;">
    <div class="row mb-3">
        <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm">Number</label>
        <div class="col-sm-10">
          <input v-model="tickets" type="number" class="form-control form-control-sm" id="colFormLabelSm" placeholder="Number of tickets">
        </div>
    </div>
    
    <div class="row mb-3">
        <label for="colFormLabel" class="col-sm-2 col-form-label">Price</label>
        <div class="col-sm-10">
          <input class="form-control" id="colFormLabel" v-model="show.price" disabled>
        </div>
    </div>

    
        <button v-on:click="calculate()" class="btn btn-primary" style="background-color: #867070; border:none;">Calculate</button>
    </div>

    <div class="card mx-auto d-block col-6" style="width: 30rem; background-color: #F5EBEB; border:none">
    <img src="static/img/money.png" class="card-img-top mx-auto d-block m-5" alt="..." style="width:30%;">
    <div class="row mb-3">
        <div class="col-sm-10">
          <h1>Total Price : [[totalprice]]</h1>
        </div>
    </div>
        
    <button v-on:click="bookshow" class="btn btn-primary" style="background-color: #867070; border:none;">Book tickets</button>
    </div>
</div>


</div>
    `,
    data: function () {
        return {
            show:{},
            status:0,
            show_id: localStorage.getItem('show_id'),
            theatre_id: localStorage.getItem('theatre_id'),
            theatre:{},
            error:'',
            tickets:0,
            totalprice: 0
        }
        }
    ,
    delimiters: ['[[', ']]'],
    
    mounted() {
        if(! localStorage.getItem('isUserLoggedIn')){
            this.$router.push('/login');
        }
        if(localStorage.getItem('is_admin') == 'true'){
            this.$router.push('/admin_dashboard');
        }
        else{
        localStorage.setItem('current_page', 'book_show Page');

        fetch("/api/show/"+this.show_id, {
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
                    this.show = data.show;
                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }

                ,
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
                        this.theatre = data.theatre;
                    }
                    )
                    .catch((error) => {
                        console.error('Error:', error);
                    }
                    ),
                
                   


                );


    }},

    methods: {
        bookshow: function () {
            fetch('/api/book_show', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' ,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        "show_id": this.show_id,
                        "tickets": this.tickets
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
                    if(this.status != 200){
                        this.error = data.message;
                    }else{
                       
                        this.$router.push('/dashboard');
                    }

                }
                )
                .catch((error) => {
                    console.error('Error:', error);
                }
                );
        },
        calculate: function(){
            if(this.tickets > this.show.remaining_capacity){
                this.error = "Not enough seats available";
                this.totalprice = 0;
            }else{
            this.totalprice = this.tickets * this.show.price;
            this.error = "";
            }
        }
    }
});

export default book_show;