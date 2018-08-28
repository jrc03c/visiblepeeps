<template>
	<div>
		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<div class="about-page">
				
				<p>Visible Peeps is a site where women, non-binary and trans creators of all skill levels can share their tweets from the popular hashtags #VisibleWomen and #VisibleNB on Twitter. These hashtags offer a great way to discover new and talented creators that are vastly under-represented within the creative industry. The goal of the site is to create a place where people can explore tweets, creators and art with ease.</p>

				<p>Visible Peeps was created by <a href="https://twitter.com/jrc03c">Josh Castle</a> and <a href="https://twitter.com/A_Werchmeister">Andreas Werchmeister</a>, and with the gracious support and help of <a href="https://twitter.com/LetsWoolgather">Toby Brommerich</a>, <a href="https://twitter.com/kylemadkins">Kyle Adkins</a>, as well as <a href="https://twitter.com/tarakeet">Tara Han-Tran Johnson</a>, who created the beautiful title logo.</p>

				<h3>How to use</h3>

				<p>To submit a tweet, all you have to do is click the 'Submit Tweet' button on the home page, or 'Login' in the menu. Once you have logged in using your Twitter account, you'll be able to submit your tweet by simply copy / pasting the direct URL to your tweet, selecting any categories you want your tweet to appear in, and hit 'Save'. That's it! :D</p>

				<p>Once you have logged in the first time and been approved, the submission page will act as your profile. You can update your tweet or any of the categories you have selected at any time, or if you wish, delete your profile and stored information (sadface).</p>

				<p>Note: The reason we have opted for an approval process is solely to prevert malicious misuse of the site.</p>

				<h3>Site issues</h3>

				<p>In case you experience any issues with the site, please contact <a href="https://twitter.com/jrc03c">jrc03c</a> or <a href="https://twitter.com/A_Werchmeister">A_Werchmeister</a> on Twitter.</p>

				<h3>Report mean people</h3>

				<p>If you see a tweet that is either offensive or doesn't belong, you'll be able to flag the tweet for review by clicking the report button on the tweet in question.</p>

				<h3>Legal</h3>

				<p>Copyright: We don't own any artwork contained within the tweets featured on the site. All tweets have been submitted by their respective owners.</p>
					
				<p>Personal Data: We don't store any personal data. The only information we store are the URL's and the category choices you have provided us. You can delete this at any point.</p>

			</div>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	module.exports = Vue.component("about", {});
</script>