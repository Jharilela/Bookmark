'use strict'
angular.module('bookmark.services')
.factory('searchSrv', searchSrv)

function searchSrv ($http, $q, ngProgressFactory, searchAPI){
	var vm = this;
	if(vm.progressbar == undefined){
		vm.progressbar = ngProgressFactory.createInstance();
		vm.progressbar.setHeight('2px');
	}
	return {
		searchGoogleBooks : searchGoogleBooks,
		searchAmazonBooks : searchAmazonBooks,
		searchGoodReadsBooks : searchGoodReadsBooks,
		searchBookList : searchBookList,
		progressbar: vm.progressbar,
		findSimilarName : findSimilarName
	}

	function searchGoogleBooks(searchItem, noOfItems, type){
		console.log('loading-status', vm.progressbar.status())
		var startTime = (new Date()).getTime();
		var apiKey = searchAPI.googleKey;
		searchItem = searchItem.trim().split(/[^a-zA-Z 0-9]+/g).join("").split(" ").join("+")
		if(type!=null && type !=undefined && type!="")
			type = type+':'
		else
			type = ""

		vm.progressbar.add(3);

		return $http.get('https://www.googleapis.com/books/v1/volumes?q='+type+searchItem+'&maxResults='+noOfItems+'&key='+apiKey)
		.then(getGoogleBooksComplete)
		.catch(getGoogleBooksFailed)


		function getGoogleBooksComplete(res){
			if(res.data.items==undefined)
				vm.progressbar.setColor('#00ff00');
			vm.progressbar.add(20);
			console.log('getGoogleBooksComplete ', res)
			var googleBooks = [];
			for (var i in res.data.items){
				var type ="google"
				var book = res.data.items[i]
				var googleId = book.id
				var primeTitle = book.volumeInfo.title
				var subTitle = book.volumeInfo.subtitle
				var title = subTitle!=undefined?primeTitle+" : "+subTitle:primeTitle
				var description = book.volumeInfo.description
				if(book.volumeInfo.imageLinks!=undefined)
				var imageLink = book.volumeInfo.imageLinks.thumbnail
				var authors = []
				if(book.volumeInfo.authors != undefined)
					authors = book.volumeInfo.authors
				if(book.volumeInfo.industryIdentifiers != undefined && book.volumeInfo.industryIdentifiers.length>1 && book.volumeInfo.industryIdentifiers[1].type=="ISBN_10")
					var ISBN = book.volumeInfo.industryIdentifiers[1].identifier;
				var pageCount = book.volumeInfo.pageCount
				var publishedYear = book.volumeInfo.publishedDate
				var categories = book.volumeInfo.categories
				var printType = book.volumeInfo.printType
				var publisher = book.volumeInfo.publisher
				var language = book.volumeInfo.language
				var averageRating = book.volumeInfo.averageRating
				var ratingsCount = book.volumeInfo.ratingsCount
				var countryAccessed = book.accessInfo.country
				var ebookIsAvailable = book.accessInfo.epub.isAvailable
				var pdfIsAvailable = book.accessInfo.pdf.isAvailable
				googleBooks.push({type, googleId, primeTitle, subTitle, title, description, imageLink, authors, ISBN, pageCount, publishedYear, categories, printType, publisher, language, averageRating, ratingsCount, countryAccessed, ebookIsAvailable, pdfIsAvailable})
			}
			var endTime = (new Date()).getTime();
			var time = endTime - startTime ; 
			console.log('time '+time/1000+'s')

			vm.progressbar.add(3);
			var emptyBookArray = [];

			return (googleBooks!=undefined?googleBooks:emptyBookArray)
		}
		function getGoogleBooksFailed(err){
			console.log('getGoogleBooksFailed ', err)
			vm.progressbar.setColor('#00ff00');
			var emptyBookArray = [];
			return emptyBookArray
			if (err.status==-1)
				return "No internet connection"
		}
	}

	function searchAmazonBooks(searchItem){
		var startTime = (new Date()).getTime();
		//For signature guidance : http://docs.aws.amazon.com/AWSECommerceService/latest/DG/rest-signature.html
		//To test the api : http://webservices.amazon.com/scratchpad/index.html
		searchItem = searchItem.trim().split(/[^a-zA-Z 0-9]+/g).join("").split(" ").join("%20")
		var today = new Date();
		var date = today.toISOString().substring(0,19)+".000Z";

		var requestMethod = "GET"
		var requestURI = "/onca/xml"
		var endpoint = "webservices.amazon.com"
		//the access key is obtained from the aws console , https://console.aws.amazon.com/console/home
		var awsAccessKeyId = searchAPI.awsAccessKeyId
		var awsSecretKey = searchAPI.awsSecretKey
		// the associate id is obtained from the aws affilites program, https://affiliate-program.amazon.com
		var awsAssociateId = searchAPI.awsAssociateId

		var req = 
		"AWSAccessKeyId="+awsAccessKeyId+"&"+
		"AssociateTag="+awsAssociateId+"&"+
		"Keywords="+searchItem+"&"+
		"Operation=ItemSearch&"+
		"ResponseGroup=Images%2CItemAttributes%2CItemIds%2CReviews%2CEditorialReview&"+
		"SearchIndex=Books&"+
		"Service=AWSECommerceService&"+
		"Timestamp="+date.split(":").join("%3A")

		var toSign = requestMethod + "\n" + endpoint + "\n" +requestURI + "\n" + req 

		var hash = CryptoJS.HmacSHA256(toSign, awsSecretKey);
	  	var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
	  	//the length of hashInBase64 should be 44
	  	var signature = hashInBase64.split("+").join("%2B").split("=").join("%3D").split("/").join("%2F")
	  	
		var url = "http://" + endpoint + requestURI+ "?" + req + "&Signature=" + signature;

		var yUrl = "http://query.yahooapis.com/v1/public/yql"

		vm.progressbar.add(3);
		return $http({
			url: yUrl,
			method: "GET",
			params: {
		        q: "select * from xml where url=\""+url+"\"",
		        format: "json"
		    }
		})
		// ^ above is very bad practise and should be changed in the future using node proxy
		// return $http.get(url)
		.then(getAmazonBooksComplete)
		.catch(getAmazonBooksFailed)

		function getAmazonBooksComplete(res){

			var amazonResponse = res.data.query.results.ItemSearchResponse.OperationRequest
			var amazonBooks = res.data.query.results.ItemSearchResponse.Items.Item
			console.log('getAmazonBooksComplete ', amazonBooks)

			if(amazonBooks==undefined)
				vm.progressbar.setColor('#ff9933');
			vm.progressbar.add(20);

			var formatedAmazonBooks = [];
			for(var i in amazonBooks){
				var type = "amazon"
				var book = amazonBooks[i];
				//Amazon Standard Identification Number (ASIN), for books ASIN = ISBN
				var ASIN = amazonBooks[i].ASIN;
				if(amazonBooks[i].ItemAttributes.Title!=undefined)
				var title = amazonBooks[i].ItemAttributes.Title;
				var authors = [];
				if(amazonBooks[i].ItemAttributes.Author!=undefined){
					if(typeof amazonBooks[i].ItemAttributes.Author=="object")
						authors = amazonBooks[i].ItemAttributes.Author
					else
						authors.push(amazonBooks[i].ItemAttributes.Author);
				}
				//The International Standard Book Number (ISBN)
				var ISBN = amazonBooks[i].ItemAttributes.ISBN;
				//The European Article Number (EAN)
				var EAN = amazonBooks[i].ItemAttributes.EAN;
				//Universal Product Code (UPC) is a 12-digit bar code used extensively for retail packaging in United States.
				var UPC = amazonBooks[i].ItemAttributes.UPC;
				var pageCount = amazonBooks[i].ItemAttributes.NumberOfPages
				if(amazonBooks[i].EditorialReviews!=undefined && amazonBooks[i].EditorialReviews.EditorialReview!=undefined && amazonBooks[i].EditorialReviews.EditorialReview.Source=="Product Description"){
					var description = amazonBooks[i].EditorialReviews.EditorialReview.Content
				}
				if(amazonBooks[i].ItemAttributes.PublicationDate!=undefined)
				{
					var publishedYear = amazonBooks[i].ItemAttributes.PublicationDate.substring(0,4);
					var publishedMonth = amazonBooks[i].ItemAttributes.PublicationDate.substring(5,7);
					var publishedDay = amazonBooks[i].ItemAttributes.PublicationDate.substring(8,10);
				}
				var dimensions = {}
				if(amazonBooks[i].ItemAttributes.PackageDimensions!= undefined)
				{
					if(amazonBooks[i].ItemAttributes.PackageDimensions.Height!= undefined)
					{
						var heightQuantity = amazonBooks[i].ItemAttributes.PackageDimensions.Height.content
						var heightUnit = amazonBooks[i].ItemAttributes.PackageDimensions.Height.Units
						var vals = {'quantity': heightQuantity, 'unit' : heightUnit}
						dimensions.height = vals
					}
					if(amazonBooks[i].ItemAttributes.PackageDimensions.Length!= undefined)
					{
						var LengthQuantity = amazonBooks[i].ItemAttributes.PackageDimensions.Length.content
						var LengthUnit = amazonBooks[i].ItemAttributes.PackageDimensions.Length.Units
						var vals = {'quantity': LengthQuantity, 'unit' : LengthUnit}
						dimensions.length = vals
					}
					if(amazonBooks[i].ItemAttributes.PackageDimensions.Width!= undefined)
					{
						var widthQuantity = amazonBooks[i].ItemAttributes.PackageDimensions.Width.content
						var widthUnit = amazonBooks[i].ItemAttributes.PackageDimensions.Width.Units
						var vals = {'quantity': widthQuantity, 'unit' : widthUnit}
						dimensions.width = vals
					}
					if(amazonBooks[i].ItemAttributes.PackageDimensions.Weight!= undefined)
					{
						var weightQuantity = amazonBooks[i].ItemAttributes.PackageDimensions.Weight.content
						var weightUnit = amazonBooks[i].ItemAttributes.PackageDimensions.Weight.Units
						var vals = {'quantity': weightQuantity, 'unit' : weightUnit}
						dimensions.weight = vals
					}
				}
				var printType = amazonBooks[i].ItemAttributes.ProductGroup
				var binding = amazonBooks[i].ItemAttributes.Binding
				var publisher = amazonBooks[i].ItemAttributes.Publisher
				var manufacturer = amazonBooks[i].ItemAttributes.Manufacturer
				var price = amazonBooks[i].ItemAttributes.ListPrice
				if(amazonBooks[i].MediumImage!=undefined)
				var imageLink = amazonBooks[i].MediumImage.URL
				if(amazonBooks[i].LargeImage!=undefined)
				var largeImageLink = amazonBooks[i].LargeImage.URL
				var amazonItemLinks = [];
				if(amazonBooks[i].ItemLinks!=undefined)
				amazonItemLinks.push(amazonBooks[i].ItemLinks.ItemLink[0])
				if(amazonBooks[i].DetailPageURL!=undefined)
				amazonItemLinks.push({'Description' : 'Detail Page URL', 'URL' : amazonBooks[i].DetailPageURL})
				if(amazonBooks[i].CustomerReviews!=undefined && amazonBooks[i].CustomerReviews.HasReviews == "true")
				amazonItemLinks.push({'Description' : 'Customer Reviews URL', 'URL' : amazonBooks[i].CustomerReviews.IFrameURL})
				if(amazonBooks[i].ImageSets!=undefined)
				var otherImages = amazonBooks[i].ImageSets.ImageSet
				formatedAmazonBooks.push({type, book, ASIN, title, authors, ISBN, EAN, UPC, pageCount, description, publishedYear, publishedMonth, publishedDay, dimensions, printType, binding, publisher, manufacturer, price, imageLink, largeImageLink, amazonItemLinks, otherImages})
			}
			var endTime = (new Date()).getTime();
			var time = endTime - startTime ; 
			console.log('time '+time/1000+'s')

			vm.progressbar.add(3);

			var emptyBookArray = [];
			return (formatedAmazonBooks!=undefined?formatedAmazonBooks:emptyBookArray)
		}
		function getAmazonBooksFailed(err){
			console.log('err',err)
			vm.progressbar.setColor('#ff9933');
			var emptyBookArray = [];
			return emptyBookArray
		}
	}

	function searchGoodReadsBooks(searchItem){
		var startTime = (new Date()).getTime();
		searchItem = searchItem.trim().split(/[^a-zA-Z 0-9]+/g).join("").split(" ").join("+")
		var apiKey = searchAPI.goodReadsKey;
		var gUrl = "https://www.goodreads.com/search/index.xml?"+
		"q="+searchItem+"&"+
		// "format=json&"+
		"key="+apiKey;

		vm.progressbar.add(3);

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
		.then(getGoodReadBooksComplete)
		.catch(getGoodReadBooksFailed)

		function getGoodReadBooksComplete(res){
			vm.progressbar.add(20);
			console.log('getGoodReadBooksComplete', res)
			var goodReadResponse = res.data.query.results.GoodreadsResponse.search
			if(goodReadResponse.results.work!=undefined && goodReadResponse.results.work[0] != undefined){
				var goodReadBooks = goodReadResponse.results.work
			}
			else{
				var goodReadBooks = []
				goodReadBooks[0] = goodReadResponse.results.work
			}

			var formatedGoodReadBooks = [];
			for(var i in goodReadBooks){
				var type = "goodReads"
				var book = goodReadBooks[i]
				var goodReadsId = goodReadBooks[i].best_book.id.content
				var title = goodReadBooks[i].best_book.title
				var imageLink = goodReadBooks[i].best_book.image_url
				var authors =[];
				authors.push(goodReadBooks[i].best_book.author.name)
				var publishedDay = goodReadBooks[i].original_publication_day.content
				var publishedMonth = goodReadBooks[i].original_publication_month.content
				var publishedYear = goodReadBooks[i].original_publication_year.content
				var printType = goodReadBooks[i].best_book.type
				var similarBookCount = goodReadBooks[i].books_count.content
				var averageRating = (typeof goodReadBooks[i].average_rating == "object"?goodReadBooks[i].average_rating.content: goodReadBooks[i].average_rating)
				var ratingsCount = goodReadBooks[i].ratings_count.content
				var bookReviewCount = goodReadBooks[i].text_reviews_count.content
				formatedGoodReadBooks.push({type, book, goodReadsId, title, imageLink, authors, publishedDay, publishedMonth, publishedYear, printType, similarBookCount, averageRating, ratingsCount, bookReviewCount})
			}
			var endTime = (new Date()).getTime();
			var time = endTime - startTime ; 
			console.log('time '+time/1000+'s')

			vm.progressbar.add(3);

			var emptyBookArray = [];
			if(formatedGoodReadBooks==undefined)
				vm.progressbar.setColor('#9933ff');
			return (formatedGoodReadBooks!=undefined?formatedGoodReadBooks:emptyBookArray)
		}
		function getGoodReadBooksFailed(err){
			console.log('error getching goodReads books', err)
			vm.progressbar.setColor('#9933ff');
			var emptyBookArray = [];
			return emptyBookArray
			if (err.status==-1)
				return "No internet connection"
		}
	}

	function searchBookList(searchItem, selectedService){
		console.log('searching '+ searchItem);
		vm.progressbar.setParent(document.getElementById('search-container'));
	  	var startTime = (new Date()).getTime();

	  	vm.progressbar.setColor('#1784F4');
		vm.progressbar.add(3);
		console.log('loading-status after', this.progressbar.status())

		return $q.all([searchGoogleBooks(searchItem, 10),searchAmazonBooks(searchItem),searchGoodReadsBooks(searchItem)])
		.then(function(data){
			vm.progressbar.add(2);
			console.log('data', data)
			var endTime = (new Date()).getTime();
			var time = endTime - startTime;

			var values={};
			values.google = data[0];
			values.amazon = data[1];
			values.goodReads = data[2];

			console.log('total time '+ time/1000+"s")
		    console.log('google',values.google); // value alpha
		    console.log('amazon',values.amazon); // value beta
		    console.log('goodReads',values.goodReads); // value gamma

		    
		    var books = [];
		    var sTime = (new Date()).getTime();
		    books = addToBookList("amazon", books, values.amazon, searchItem);
		    books = addToBookList("google", books, values.google, searchItem);
		    books = addToBookList("goodReads", books, values.goodReads, searchItem);

		    vm.progressbar.add(8);

		    var eTime = (new Date()).getTime();
		    console.log('timeToCompute : '+(eTime-sTime))
		    console.log('books', books)

		    //priority variables comes first
		    books.sort(dynamicSortMultiple("-noOfOccurrence","-rating", "-sameWords", "-wordSequence"));
		    books = books.map(function(elem, index, arr){
		    	return elem.obj
		    })

		    vm.progressbar.add(2);

		    var emptyBookArray = [];
		    return (books!=undefined?books:emptyBookArray);
		});
	}

	function calculateWordSequence(searchRef, searchItem){
    	searchItem = searchItem.split(/[^a-zA-Z 0-9]+/g).join("").split(" ");
    	searchRef = searchRef.split(/[^a-zA-Z 0-9]+/g).join("").split(" ");
    	// console.log('searchItem', searchItem)
    	// console.log('searchRef', searchRef)
    	var globalSimilarWords = 0;
    	for(var i=0; i<searchItem.length; i++){
    		for(var j=0; j<searchRef.length; j++){
    			// console.log('i = '+i+' j = '+j)
    			if(searchItem[i].toUpperCase() === searchRef[j].toUpperCase()){
    				var localSimilarWords = 0
    				// console.log('is searchItem.length:'+searchItem.length+' <= searchRef.length:'+searchRef.length+' - j:'+j+" = "+(searchItem.length<=(searchRef.length-j))+" then limit="+(searchItem.length<=(searchRef.length-j)?searchItem.length:searchRef.length-j))
    				for(var k=0;k < (searchItem.length-i<=(searchRef.length-j)?searchItem.length-i:searchRef.length-j); k++){
    					// console.log('i:'+i+" j:"+j+" k:"+k)
    					// console.log('searchItem[i+k].toUpperCase()', searchItem[i+k]);
    					// console.log('searchRef[j+k].toUpperCase()', searchRef[j+k]);

    					if(searchItem[i+k].toUpperCase() === searchRef[j+k].toUpperCase())
    						localSimilarWords++;
    				}
    				if(localSimilarWords>globalSimilarWords)
    					globalSimilarWords = localSimilarWords
    			}
    		}
    	}
    	return parseFloat(globalSimilarWords/searchItem.length*100)
    }

    function calculateSameWords(searchRef, searchItem){
    	searchItem = searchItem.split(/[^a-zA-Z 0-9]+/g).join("").split(" ");
    	searchRef = searchRef.split(/[^a-zA-Z 0-9]+/g).join("").split(" ");
    	var sameWords = 0;
    	for(var i=0; i<searchItem.length; i++){
    		for(var j=0; j<searchRef.length; j++){
    			if(searchItem[i].toUpperCase() === searchRef[j].toUpperCase()){
					sameWords++;
					break;
    			}
    		}
    	}
    	return parseFloat(sameWords/searchItem.length*100)
    }

    function findSimilarName(searchRef, searchItem){
    	//the prefix s stands for item in searchItem
    	// console.log('searchItem author', searchItem.authors, typeof searchItem.authors)
    	var iTitle = searchItem.title;
    	var iAuthor = (searchItem.authors!=undefined && typeof searchItem.authors == "object"?searchItem.authors.join(','):"-")
    	var iDay = (searchItem.publishedDay!=undefined?searchItem.publishedDay:"-")
    	var iMonth = (searchItem.publishedMonth!=undefined?searchItem.publishedMonth:"-")
    	var iYear = (searchItem.publishedYear!=undefined?searchItem.publishedYear:"-")
    	iTitle = iTitle.toUpperCase().split(/[^a-zA-Z 0-9]+/g).join("").split(" ");
    	iAuthor = iAuthor.split(',').join(' ').toUpperCase().split(" ").filter(function(n){ return n != "" })

    	// console.log('iAuthor: ',iAuthor, typeof iAuthor)
    	// console.log('date: '+iDay+"-"+iMonth+"-"+iYear)
    	
    	// console.log('before iTitle', iTitle);
    	iTitle = removePaculiars(iTitle, iAuthor, iDay, iMonth, iYear)
    	// console.log('after iTitle', iTitle);
    	
    	var similarity = 0;

    	for(var r =0;r<searchRef.length;r++){
    		// console.log('r: '+r)
    		var globalSimilarWords = 0;
	    	//the prefix r stands for reference in searchRefence
	    	var ref = searchRef[r].obj==undefined?searchRef[r]:searchRef[r].obj
	    	var rTitle = ref.title;
	    	console.log('ref.authors ', ref.authors);
	    	try{
		    	var rAuthor = ref.authors!=undefined && typeof searchItem.authors == "object"?ref.authors.join(" , "):"-"
		    }
		    catch(err){
		    	var rAuthor = ref.authors!=undefined && typeof searchItem.authors == "object"?ref.authors:"-"
		    }
	    	var rDay = (ref.publishedDay!=undefined?ref.publishedDay:"-")
	    	var rMonth = (ref.publishedMonth!=undefined?ref.publishedMonth:"-")
	    	var rYear = (ref.publishedYear!=undefined?ref.publishedYear:"-")
	    	rTitle = rTitle.split(/[^a-zA-Z 0-9]+/g).join("").split(" ").filter(function(n){ return n != "" });
	    	rAuthor = rAuthor.split(',').join(' ').toUpperCase().split(" ").filter(function(n){ return n != "" })
	    	var authorExist = false

	    	// console.log('rAuthor: ',rAuthor, typeof rAuthor)
	    	// console.log('iTitle before change : ',iTitle)
	    	var localiTitle = removePaculiars(iTitle, rAuthor, rDay, rMonth, rYear )
	    	// console.log('localiTitle after change : ',localiTitle);

	    	
	    	for(var i=0; i<localiTitle.length; i++){
	    		for(var j=0; j<rTitle.length; j++){
	    			if(localiTitle[i].toUpperCase() === rTitle[j].toUpperCase()){
	    				var localSimilarWords = 0
						for(var k=0;k < (localiTitle.length-i<=(rTitle.length-j)?localiTitle.length-i:rTitle.length-j); k++){
	    					if(localiTitle[i+k].toUpperCase() === rTitle[j+k].toUpperCase())
	    						localSimilarWords++;
	    				}
	    				if(localSimilarWords>globalSimilarWords){
	    					globalSimilarWords = localSimilarWords
	    					var index = r;
	    				}
	    			}
	    		}
	    	}


	    	if(ref.authors!=undefined && searchItem.authors!=undefined){
		    	for(var x = 0; x< ref.authors.length; x++){
		    		for(var y=0; y<searchItem.authors.length; y++){
		    			// console.log('searchRef[x]: '+x, ref.authors[x], typeof ref.authors[x])
		    			// console.log('searchItem[y]: '+y, searchItem.authors[y], typeof searchItem.authors[y])
		    			if(ref.authors[x].toUpperCase() == searchItem.authors[y].toUpperCase()){
		    				authorExist = true;
		    			}
		    		}
		    	}
		    }

	    	similarity = globalSimilarWords/(rTitle.length>localiTitle.length?rTitle.length:localiTitle.length)*100;
	    	
	    	if(similarity>=80 || (authorExist==true && similarity>=75)){
	    	console.log('similarity', similarity, localiTitle, rTitle)
	    	var obj = { 'bool':true,
	    				'index': index,
	    				'similarity': similarity}
	    	return obj;  
		    }
    	}

    	var obj = { 'bool': false,
    				'index': index,
    				'similarity': similarity}
    	return obj;
    }

    function removePaculiars(title, author, day, month, year){
    	// console.log('date: '+day+month+year)
    	for(var i =0;i<title.length;i++){
    		if(author!=null && author!=undefined)
    		for(var j=0;j<author.length;j++){
    			if(title[i].indexOf(author[j]) !== -1){ //check if the title contains the authors name
    				// console.log('author is found and removed: '+title[i])
    				title[i] = "" // if yes, it removes the authors name from the title
    				if(title[i-1]!=undefined && title[i-1].indexOf("BY")!== -1)
    					title[i-1]="";
    				} 
    		}
    		if(title[i].indexOf("UNABRIDGED")!== -1 ){
    			title[i] = "";
    			if(title[i+1]!=undefined && title[i+1].indexOf("EDITION")!== -1){
    				title[i+1]="";
    			}
    		}
    		if(title[i].indexOf("REVISED")!== -1 && title[i+1]!== undefined && title[i+1].indexOf("EDITION")!== -1 ){
    			title[i] = "";
    			title[i+1]="";
    		}
    		if(year!="" && title[i].indexOf(year)!=-1)
    			var yearIsPresent = true;
    		if(month!="" && title[i].indexOf(month)!=-1)
    			var monthIsPresent = true;
    		if(day!="" && title[i].indexOf(day)!=-1)
    			var dayIsPresent = true;
    		if((yearIsPresent!=undefined && yearIsPresent==true && monthIsPresent!=undefined && monthIsPresent==true) 
    			|| (dayIsPresent!=undefined && dayIsPresent==true && monthIsPresent!=undefined && monthIsPresent==true)
    			|| (yearIsPresent!=undefined && yearIsPresent==true && dayIsPresent!=undefined && dayIsPresent==true))
    			title[i]=""
    	}
    	title = title.filter(function(n){ return n != "" });
    	return title
    }

    function addToBookList(bookSource, bookList, additionalBooks, searchItem){
    	console.log('%c'+bookSource+" books", 'background: #222; color: #bada55')

    	for(var i=0; i<additionalBooks.length; i++){
	    	var bookExists = findSimilarName(bookList, additionalBooks[i])
	    	// console.log('bookExists', bookExists)
	    	if(bookExists.bool){
	    		bookList[bookExists.index].noOfOccurrence ++;
	    		for(var l=0;l<additionalBooks[i].authors.length;l++){
    				var authorExist = false
    				for(var k =0; k<bookList[bookExists.index].obj.authors.length; k++){
    					// console.log('additionalBooks[i].authors[l]', additionalBooks[i].authors[l], additionalBooks[i].authors[l].length, typeof additionalBooks[i].authors[l])
    					// console.log('bookList[bookExists.index].obj.authors[k]', bookList[bookExists.index].obj.authors[k], bookList[bookExists.index].obj.authors[k].length, typeof bookList[bookExists.index].obj.authors[k])
    					if(bookList[bookExists.index].obj.authors[k].toUpperCase() == additionalBooks[i].authors[l].toUpperCase()){
    						authorExist = true
    					}
    					if((k == bookList[bookExists.index].obj.authors.length-1) && authorExist == false){
    					bookList[bookExists.index].obj.authors.push(additionalBooks[i].authors[l])
	    				}
    				}
    			}

    			for (var key in additionalBooks[i]) {
				    // skip loop if the property is from prototype
				    
				    if (!additionalBooks[i].hasOwnProperty(key)) continue;
				    var obj = additionalBooks[i][key];

				    if(key in bookList[bookExists.index].obj){
				    	// console.log('existing key:'+key+" obj:"+obj)
				    	if(key == "averageRating" ){
				    		additionalBooks[i].averageRating = additionalBooks[i].averageRating!=undefined?additionalBooks[i].averageRating:0;
				    		additionalBooks[i].ratingsCount = additionalBooks[i].ratingsCount!=undefined?additionalBooks[i].ratingsCount:0;
				    		additionalBooks[i].averageRating = (typeof additionalBooks[i].averageRating == "object"?additionalBooks[i].averageRating.content : additionalBooks[i].averageRating)
				    		var refSum = parseFloat(bookList[bookExists.index].obj.averageRating * bookList[bookExists.index].obj.ratingsCount)
				    		var itemSum = parseFloat(additionalBooks[i].averageRating * additionalBooks[i].ratingsCount)
				    		var totalCount = parseInt(bookList[bookExists.index].obj.ratingsCount) + parseInt(additionalBooks[i].ratingsCount)
				    		var rating = parseFloat((refSum + itemSum)/totalCount)
				    		// console.log('fixing averageRating from:'+bookList[bookExists.index].obj.averageRating+"*"+bookList[bookExists.index].obj.ratingsCount+" & "+additionalBooks[i].averageRating+"*"+additionalBooks[i].ratingsCount+" -> "+rating)
				    		
				    		rating = (Math.round(rating * 100) / 100)
				    		bookList[bookExists.index].obj.averageRating = ""+(typeof rating == "object"?rating.content : rating);
				    		bookList[bookExists.index].obj.ratingsCount = ""+totalCount;
				    		bookList[bookExists.index].rating = refSum+itemSum
				    	}
				    	if(key="imageLink"){
				    		console.log('imageLink', bookList[bookExists.index].obj.imageLink)
				    		if(bookList[bookExists.index].obj.imageLink.indexOf('nophoto')!=-1){
				    			console.log('empty picture', bookList[bookExists.index])
				    			bookList[bookExists.index].noOfOccurrence = 0;
				    		}
				    	}
				    	if(key="type"){
				    		if(bookList[bookExists.index].obj.type.indexOf(additionalBooks[i].type)==-1)
				    			bookList[bookExists.index].obj.type+= ", "+additionalBooks[i].type
				    	}
				    }
				    else if(!(key in bookList[bookExists.index].obj) || ((key in bookList[bookExists.index].obj) && bookList[bookExists.index].obj[key]==undefined)){
				    	bookList[bookExists.index].obj[key]=obj;
				    	// console.log('to be added key:'+key+" obj:"+obj)
				    }
				}
	    	}
	    	else{
	    	bookList.push({'name': additionalBooks[i].title,
	    				'wordSequence': calculateWordSequence(additionalBooks[i].title, searchItem), 
	    				'sameWords' : calculateSameWords(additionalBooks[i].title, searchItem),
	    				'rating' : additionalBooks[i].averageRating!=undefined?additionalBooks[i].averageRating * additionalBooks[i].ratingsCount:0,
	    				'noOfOccurrence': (additionalBooks[i].imageLink!=undefined && additionalBooks[i].imageLink.indexOf("nophoto"))==-1?1:0, 
	    				'obj': additionalBooks[i]})
	    	}
	    }
		return bookList;
    }
}