const summary_page = Vue.component('summaryPage', {
    template: `
    <div>
    <h1 class="text-center m-4">Summary page</h1>
    <input type="file" ref="fileInput" multiple style="display: none">
    <div v-for="(image, index) in images" :key="index" class="m-4 d-flex">
      <img :src="image" alt="Generated Image" class="text-center m-4 mx-auto" >
    </div>
  </div>
    `,
    data: function () {
        return{
            images: [],
        }
    },

    mounted() {
        if (!localStorage.getItem("isUserLoggedIn")) {
            this.$router.push("/login");
        }
        else{
            if(localStorage.getItem("is_admin") != "true"){
                this.$router.push("/dashboard");
        }else{
            localStorage.setItem("current_page", "Summary Page");

            const fileInput = this.$refs.fileInput;
    const formData = new FormData();

    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];
      formData.append('images', file);
    }

    fetch('http://localhost:5000/api/summary', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem("token")
      }
    })
      .then(response => response.json())
      .then(data => {
        const filenames = data.filenames;
        for (let i = 0; i < filenames.length; i++) {
          this.getImage(filenames[i]);
        }
      })
      .catch(error => {
        console.error('Error generating images:', error);
      });
        }
    }
},
methods: {
    getImage(filename) {
      fetch(`http://localhost:5000/get_image/${filename}`)
        .then(response => response.blob())
        .then(blob => {
          const imageUrl = URL.createObjectURL(blob);
          this.images.push(imageUrl);
        })
        .catch(error => {
          console.error('Error fetching image:', error);
        });
    },
  },

});

export default summary_page;