let Vue = require("vue/dist/vue");
let VueRouter = require("vue-router");
let Vuex = require("vuex");
Vue.use(VueRouter);
Vue.use(Vuex);

let Firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

let URL = require("url-parse");

// require main wrapper component
require("./components/vp-wrapper.vue");

// add set functionality to arrays
Array.prototype.toSet = function(){
	let out = [];
	
	this.forEach(function(item){
		if (out.indexOf(item) < 0) out.push(item);
	});
	
	return out;
};

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
	let dataHasBeenInitialized = false;
	let authHasBeenInitialized = false;
	
	Firebase.database().ref("/").once("value").then(function(snapshot){
		dataHasBeenInitialized = true;
		
		let data = snapshot.val();
		if (!data) return;
		store.state.data = data;
	});
	
	Firebase.auth().onAuthStateChanged(function(user){
		authHasBeenInitialized = true;
		
		if (user){
			store.state.isLoggedIn = true;
		}
	});
	
	// set up spa routes
	let routes = [
		{path: "/", component: require("./components/vp-landing.vue")},
		{path: "/submit", component: require("./components/vp-submit.vue")},
		{path: "/manage", component: require("./components/vp-manage.vue"), beforeEnter: function(to, from, next){
			let t = setInterval(function(){
				if (!authHasBeenInitialized || !dataHasBeenInitialized) return;
				clearInterval(t);
				
				if (!store.state.data.adminUsers){
					store.state.data.adminUsers = [];
				}
								
				if (store.state.data.adminUsers[Firebase.auth().currentUser.uid]){
					return next();
				}
				
				return next("/");
			}, 10);
		}},
	];
	
	let router = new VueRouter({routes});
	
	// set up store
	let store = new Vuex.Store({
		state: {
			isLoggedIn: false,
			
			data: {
				tweetsToApprove: [],
				approvedTweets: [],
				blockedUsers: [],
				adminUsers: {},
				allUsers: [],
			},
		},
		
		getters: {},
		
		mutations: {},
		
		actions: {
			addTweetToApprove: function(context, url){
				if (!context.state.data.tweetsToApprove){
					context.state.data.tweetsToApprove = [];
				}
				
				context.state.data.tweetsToApprove.push(JSON.stringify(url));
				
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
				context.state.data.approvedTweets = context.state.data.approvedTweets.toSet();
				
				Firebase.database().ref("/approvedTweets").set(context.state.data.approvedTweets).then(function(){
					//
				}).catch(function(error){
					console.error(error);
				});
				
				context.dispatch("removeTweetToApprove", url);
			},
			
			denyTweet: function(context, url){
				context.dispatch("removeTweetToApprove", url);
			},
			
			blockUser: function(context, username){
				if (!context.state.data.blockedUsers){
					context.state.data.blockedUsers = [];
				}
				
				context.state.data.blockedUsers.push(username);
				
				Firebase.database().ref("/blockedUsers").set(context.state.data.blockedUsers).then(function(){
					// 
				}).catch(function(error){
					console.error(error);
				});
			},
			
			unblockUser: function(context, username){
				if (!context.state.data.blockedUsers){
					context.state.data.blockedUsers = [];
				}
				
				context.state.data.blockedUsers.splice(context.state.data.blockedUsers.indexOf(username), 1);
				
				Firebase.database().ref("/blockedUsers").set(context.state.data.blockedUsers).then(function(){
					// 
				}).catch(function(error){
					console.error(error);
				});
			},
			
			addAdminUser: function(context, uid){
				if (!context.state.data.adminUsers){
					context.state.data.adminUsers = {};
				}
				
				context.state.data.adminUsers[uid] = true;
				
				Firebase.database().ref("/adminUsers/" + uid).set(true).then(function(){
					//
				}).catch(function(error){
					console.error(error);
				});
			},
			
			removeAdminUser: function(context, uid){
				if (!context.state.data.adminUsers){
					context.state.data.adminUsers = {};
				}
				
				delete context.state.data.adminUsers[uid];
				
				Firebase.database().ref("/adminUsers/" + uid).set(null).then(function(){
					//
				}).catch(function(error){
					console.error(error);
				});
			},
		},
	});
	
	// create app
	let app = new Vue({
		el: "#app",
		router,
		store,
	});
};