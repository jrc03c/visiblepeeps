let Vue = require("vue/dist/vue");
let VueRouter = require("vue-router");
let Vuex = require("vuex");
Vue.use(VueRouter);
Vue.use(Vuex);

let Firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

// require main wrapper component
require("./components/vp-wrapper.vue");

window.onload = function(){
	// initialize firebase
	Firebase.initializeApp({
		apiKey: "AIzaSyDahkALUP2HDnuLqiXOt-ScOPobhqFoW84",
		authDomain: "visiblewomen-net.firebaseapp.com",
		databaseURL: "https://visiblewomen-net.firebaseio.com",
		projectId: "visiblewomen-net",
		storageBucket: "",
		messagingSenderId: "532732660193"
	});
	
	// get list of admin users from database
	Firebase.database().ref("/admin-users").once("value").then(function(snapshot){
		let adminUsers = snapshot.val();
		if (!adminUsers) return;
		store.commit("setAdminUsers", adminUsers);
	});
	
	// set up spa routes
	let routes = [
		{path: "/", component: require("./components/vp-landing.vue")},
		{path: "/submit", component: require("./components/vp-submit.vue")},
		{path: "/manage", component: require("./components/vp-manage.vue")},
	];
	
	let router = new VueRouter({routes});
	
	// set up store
	let store = new Vuex.Store({
		state: {
			currentUserName: null,
			adminUsers: [],
		},
		
		getters: {},
		
		mutations: {
			setCurrentUserName: function(state, username){
				state.currentUserName = username;
				localStorage.setItem("currentUserName", username);
			},
			
			setAdminUsers: function(state, users){
				state.adminUsers = users;
			},
		},
		
		actions: {},
	});
	
	// create app
	let app = new Vue({
		el: "#app",
		router,
		store,
	});
};