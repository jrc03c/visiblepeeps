let Vue = require("vue/dist/vue");
let VueRouter = require("vue-router");
let Vuex = require("vuex");
Vue.use(VueRouter);
Vue.use(Vuex);

let Firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

window.onload = function(){
	Firebase.initializeApp({
		apiKey: "AIzaSyDahkALUP2HDnuLqiXOt-ScOPobhqFoW84",
		authDomain: "visiblewomen-net.firebaseapp.com",
		databaseURL: "https://visiblewomen-net.firebaseio.com",
		projectId: "visiblewomen-net",
		storageBucket: "",
		messagingSenderId: "532732660193"
	});
	
	Firebase.auth().onAuthStateChanged(function(user){
		if (user){
			if (store.state.adminUsers.indexOf(user.uid) > -1){
				store.commit("setUserIsAdmin", true);
			}
		}
	});
	
	let routes = [
		{path: "/", component: require("./components/vp-landing.vue")},
		{path: "/about", component: require("./components/vp-about.vue")},
		{path: "/submit", component: require("./components/vp-submit.vue")},
		{path: "/manage", component: require("./components/vp-manage.vue")},
	];
	
	let router = new VueRouter({routes});
	
	let store = new Vuex.Store({
		state: {
			userIsAdmin: false,
			adminUsers: [],
			redirect: "/submit",
		},
		getters: {},
		mutations: {
			setUserIsAdmin: function(state, val){
				state.userIsAdmin = val;
			},
			
			setRedirect: function(state, val){
				state.redirect = val;
			},
		},
		actions: {},
	});
	
	let app = new Vue({
		el: "#app",
		router,
		store,
	});
};