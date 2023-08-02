import login_component from "./components/login.js";
import register_component from "./components/register.js";
import welcome from "./components/welcome.js";
import dashboard_component from "./components/dashboard.js";
import shows from "./components/shows.js";
import book_show from "./components/book_show.js";
import bookings from "./components/bookings.js";
import admin_theatres from "./components/admin_dashboard.js";
import add_theatre from "./components/add_theatre.js";
import editTheatre from "./components/edit_theatre.js";
import addShow from "./components/add_show.js";
import adminShows from "./components/admin_shows.js";
import editShow from "./components/edit_show.js";
import userProfile from "./components/user_profile.js";
import summary_page from "./components/summary.js";
import search_component from "./components/search.js";

const routes = [
    { path: '/login', component: login_component },
    { path: '/register', component: register_component},
    { path: '/', component: welcome },
    { path: '/dashboard', component: dashboard_component },
    { path: '/shows', component: shows },
    { path: '/book_show', component: book_show },
    { path: '/bookings', component: bookings },
    { path: '/admin_dashboard', component: admin_theatres},
    { path: '/add_theatre', component: add_theatre},
    { path: '/edit_theatre', component: editTheatre},
    { path: '/add_show', component: addShow},
    { path: '/admin_shows', component: adminShows},
    { path: '/edit_show', component: editShow},
    { path:'/user_profile', component: userProfile},
    { path:'/summary', component: summary_page},
    { path: '/search', component: search_component}
];

const router = new VueRouter({
    routes 
});

export default router;