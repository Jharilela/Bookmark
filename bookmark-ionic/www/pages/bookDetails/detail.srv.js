'use strict'
angular.module('bookmark.services')
.factory('detailSrv', detailSrv)

function detailSrv($http){
	return {
		getDetails : getDetails,
		getAmazonDetails : getAmazonDetails,
		getGoogleDetails : getGoogleDetails,
		getGoodReadsDetails : getGoodReadsDetails
	}

	function getDetails(book){
		console.log('DETAILS')
		if(book.type.indexOf('amazon')>=0)
			getAmazonDetails();
		if(book.type.indexOf('google')>=0)
			getGoogleDetails();
		if(book.type.indexOf('goodReads')>=0)
			getGoodReadsDetails(book);
	}
	function getAmazonDetails(){
		console.log('getting Amazon Details')
	}
	function getGoogleDetails(){
		console.log('getting Google Details')
	}
	function getGoodReadsDetails(book){
		console.log('getting GoodReads Details')
		var startTime = (new Date()).getTime();
		var apiKey = "guQ6kGMzvAe3tYTYzytr2A";
		var gUrl = "https://www.goodreads.com/book/show.xml?"+
		"id="+book.goodReadsId+"&"+
		"key="+apiKey;
		console.log('gUrl', gUrl)

  		//using a free yahoo YQL api that fetches CORS xml results for us. https://developer.yahoo.com/yql/
  		var yUrl = "http://query.yahooapis.com/v1/public/yql"
		return $http({
			url: yUrl,
			method: "GET",
			params: {
		        q: "select * from xml where url=\""+gUrl+"\"",
		        format: "json"
		    }
		})
		.then(getGoodReadBooksDetailsComplete)
		.catch(getGoodReadBooksDetailsFailed)

		function getGoodReadBooksDetailsComplete(res){
			var bookReceived = res.data.query.results.GoodreadsResponse.book
			console.log('bookReceived', bookReceived)

			var type = "goodReads"
			var goodReadsId = bookReceived.id
			var title = bookReceived.title
			var imageLink = bookReceived.image_url
			var authors = bookReceived.authors.author;
			var publishedDay = bookReceived.publication_day
			var publishedMonth = bookReceived.publication_month
			var publishedYear = bookReceived.publication_year
			var printType = bookReceived.format
			var averageRating = bookReceived.average_rating
			var ratingsCount = bookReceived.ratings_count
			var bookReviewCount = bookReceived.text_reviews_count
			var pageCount = bookReceived.num_pages
			var ISBN = bookReceived.isbn
			var description = bookReceived.description
			var goodReadsReviewsWidget = bookReceived.reviews_widget

			var newBook = {type, goodReadsId, title, imageLink, authors, publishedDay, publishedMonth, publishedYear, printType, averageRating, ratingsCount, bookReviewCount, pageCount, ISBN, description, goodReadsReviewsWidget}
			addData(book, newBook)
			return newBook;

		}
		function getGoodReadBooksDetailsFailed(err){
			console.log('err', err)
			return book;
		}
		function addData(oldBook, newBook){
			console.log('oldBook', oldBook)
			console.log('newBook', newBook)
		}

	}
}	