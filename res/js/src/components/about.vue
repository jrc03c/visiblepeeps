<template>
	<div>
		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<div class="about-page">
				
				<p>Visible Peeps is a site where women, non-binary and trans creators of all skill levels can share their tweets from the popular hashtags #VisibleWomen and #VisibleNB on Twitter. Started by the folks at <a href="https://milkfed.us/">Milkfed Criminal Masterminds</a> these hashtags are intended to raise the visiblity of women, non-binary and trans creators. The goal of this site is to facilitate the purpose of the hashtag by creating a place where people can explore and discover new creators, their tweets and their work.</p><br>

				<p>Visible Peeps was created by <a href="https://twitter.com/jrc03c">Josh Castle</a> and <a href="https://twitter.com/A_Werchmeister">Andreas Werchmeister</a>, and with the gracious support and help of <a href="https://twitter.com/LetsWoolgather">Toby Brommerich</a>, <a href="https://twitter.com/kylemadkins">Kyle Adkins</a>, as well as <a href="https://twitter.com/tarakeet">Tara Han-Tran Johnson</a>, who created the beautiful title logo.</p>

				<h3>How to use to site</h3>

				<p>To submit a tweet, all you have to do is click the 'Submit Tweet' button on the home page. Once you have logged in using your Twitter account, you'll be able to submit your tweet by simply copy / pasting the direct URL to your tweet, selecting any categories you want your tweet to appear in, and hit 'Save'. That's it! :D</p><br>

				<p>Once you have logged in the first time and been approved. You can return to the submission page to, update your tweet or any of the categories you have selected, or if you wish, delete your tweet together with any information stored in the database.</p><br>

				<p>Note: The reason we ask you to login with your Twitter account is solely to prevent any malicious misuse of the site, and to verify that the tweet you submit is your own. We can't access or control any part your Twitter account.</p>

				<h3>Site issues</h3>

				<p>In case you experience any issues with the site or if you'd like to share your feedback, please feel free to contact either <a href="https://twitter.com/jrc03c">jrc03c</a> or <a href="https://twitter.com/A_Werchmeister">A_Werchmeister</a> on Twitter.</p>

				<h3>Report inappropriate or irrelevant tweets</h3>

				<p>If you see a tweet that is either offensive or doesn't belong, you'll be able to flag the tweet for review by clicking the red flag button in the bottom corner of the tweet in question.</p>

				<h3>Legal</h3>

				<p>Copyright: We don't own any artwork contained within the tweets featured on the site. All tweets have been submitted by their respective owners.</p><br>
					
				<p>Personal Data: We don't store any personal data. The only information we store are the URL's and the category choices you have provided us. You can delete this at any point from the submission page.</p>

			</div>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	module.exports = Vue.component("about", {});
</script>