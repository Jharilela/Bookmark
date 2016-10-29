function log10(value){
	return Math.log(value)/ Math.LN10
}
function logB(value,base){
	return Math.log(value)/Math.log(base)
}
function cleanObj(obj){
	for (var propName in obj) { 
	    if (obj[propName] === null || obj[propName] === undefined) {
	      delete obj[propName];
	    }
	}
	return obj;
}
function addObj(to, obj){
	for(var propName in obj){
		to[propName] = obj[propName]
	}
	return to;
}
function isEmpty(obj){
	if(obj == undefined || obj == null)
		return true;
	else
		return false;
}
function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
	function dynamicSort(property) {
	    var sortOrder = 1;
	    if(property[0] === "-") {
	        sortOrder = -1;
	        property = property.substr(1);
	    }
	    return function (a,b) {
	        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	        return result * sortOrder;
	    }
	}

    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}