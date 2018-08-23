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
	
	// get data from database
	Firebase.database().ref("/").once("value").then(function(snapshot){
		let data = snapshot.val();
		if (!data) return;
		store.state.data = data;
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
			data: {},
		},
		
		getters: {},
		
		mutations: {
			setCurrentUserName: function(state, username){
				state.currentUserName = username;
				localStorage.setItem("currentUserName", username);
			},
		},
		
		actions: {
			addTweetToApprove: function(context, url){
				if (!context.state.data.tweetsToApprove){
					context.state.data.tweetsToApprove = [];
				}
				
				context.state.data.tweetsToApprove.push(url);
				
				Firebase.database().ref("/tweetsToApprove").set(context.state.data.tweetsToApprove).then(function(){
					//
				}).catch(function(error){
					console.error(error);
				});
			},
			
			removeTweetToApprove: function(context, url){
				if (!context.state.data.tweetsToApprove){
					context.state.data.tweetsToApprove = [];
				}
				
				context.state.data.tweetsToApprove.splice(context.state.data.tweetsToApprove.indexOf(url), 1);
				
				Firebase.database().ref("/tweetsToApprove").set(context.state.data.tweetsToApprove).then(function(){
					//
				}).catch(function(error){
					console.error(error);
				});
			},
			
			approveTweet: function(context, url){
				if (!context.state.data.approvedTweets){
					context.state.data.approvedTweets = [];
				}
				
				context.state.data.approvedTweets.push("https://twitter.com" + url.pathname);
				
				Firebase.database().ref("/approvedTweets").set(context.state.data.approvedTweets).then(function(){
					//
				}).catch(function(error){
					console.error(error);
				});
				
				context.dispatch("removeTweetToApprove", url);
			},
			
			blockTweet: function(context, url){},
		},
	});
	
	// create app
	let app = new Vue({
		el: "#app",
		router,
		store,
	});
};