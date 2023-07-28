const userProfile = Vue.component('user_profile', {
    template: `
    <div>
    <div>
    <div>
    <div v-if="error_message" class="alert alert-warning alert-dismissible fade show" role="alert" >
    [[error_message]]
</div>
    <div class="row d-flex justify-content-center">

    <div class='h1 text-center'>Update User Profile</div>

    <div style="background-color: #E4D0D0;" class="card col-4  text-center " >
            
              
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
                <label class="col-form-label" for="old_password">Old Password</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="password" v-model="old_password" id="old_password">
            </div>
        </div>
        <div class="row my-2">
            <div class="col-4">
                <label class="col-form-label" for="new_password">New Password</label>  
                </div>
            <div class="col-8">
                <input class="form-control" type="password" v-model="new_password" id="new_password">
            </div>
        </div>
            
    
            </div>

                
            <div class="row d-flex">
            <button style="background-color: #867070; border:none;"  class="btn btn-primary col-3 mx-auto m-2" v-on:click="update" type="submit">Update</button>
            </div>
  
    </div>
    <div class="row d-flex">
    <button style="background-color: #867070; border:none;"  class="btn btn-primary col-2 mx-auto m-5" v-on:click="delete_user" type="submit">Delete My Account</button>
    </div>
    </div>

    </div>
    </div>
    </div>
    `,
    delimiters: ["[[", "]]"],
    data: function () {
        return{
            username: "",
            email: "",
            old_password: "",
            new_password:"",
            error_message: "",
            status: 0
        }
    },
    mounted: function () {
        if (!localStorage.getItem("isUserLoggedIn")) {
            this.$router.push("/login");
          } 
          else{
          localStorage.setItem("current_page", "Profile Page");

          fetch("/api/users/" + localStorage.getItem("user"), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        .then((response) => {
            this.status = response.status;
            return response.json();
        }
        )
        .then((data) => {
            if (this.status == 200) {
                console.log(data);
                this.username = data.user.username;
                this.email = data.user.email;
            }else{
                this.error_message = data.message;
            }
        }
        )
        .catch((error) => {
            console.log(error);
        }
        );
    }
    },

    methods: {
        update: function () {
            if((this.old_password != "" && this.new_password == "") || (this.old_password == "" && this.new_password != "")){
                this.error_message = "Please fill out both old and new password fields";
                return;
            }

            fetch("/api/users/" + localStorage.getItem("user"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    username: this.username,
                    email: this.email,
                    old_password: this.old_password,
                    new_password: this.new_password
                })
            })
            .then((response) => {
                this.status = response.status;
                return response.json();
            }
            )
            .then((data) => {
                if (this.status == 200) {
                    console.log(data);
                    this.$router.push("/dashboard");
                }else{
                    this.error_message = data.message;
                }
            }
            )
            .catch((error) => {
                console.log(error);
            }
            );

        },
        delete_user: function () {
            fetch("/api/user/" + localStorage.getItem("user"), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            .then((response) => {
                this.status = response.status;
                return response.json();
            }
            )
            .then((data) => {
                if (this.status == 200) {
                    console.log(data);
                    localStorage.clear();
                    this.$router.push("/login");
                }else{
                    this.error_message = data.message;
                }
            }
            )
            .catch((error) => {
                console.log(error);
            }
            );

        }
    },

});

export default userProfile;