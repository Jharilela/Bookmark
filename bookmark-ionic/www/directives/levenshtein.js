var levenshtein = function(a,b, showLog) {
  a = (a+"").toLowerCase();
  b = (b+"").toLowerCase();
  if(a.length == 0) return 0; 
  if(b.length == 0) return 0;
  if(isEmpty(showLog))showLog = false

  //eg: compare Harry potter and harry porter
 //       h,a,r,r,y, ,p,o,t,t,e,r
 //     0,1,2,3,4,5,6,7,8,9,10,11,12
 // 'h' 1,0,1,2,3,4,5,6,7,8,9,10,11
 // 'a' 2,1,0,1,2,3,4,5,6,7,8,9,10
 // 'r' 3,2,1,0,1,2,3,4,5,6,7,8,9
 // 'r' 4,3,2,1,0,1,2,3,4,5,6,7,8
 // 'y' 5,4,3,2,1,0,1,2,3,4,5,6,7
 // ' ' 6,5,4,3,2,1,0,1,2,3,4,5,6
 // 'p' 7,6,5,4,3,2,1,0,1,2,3,4,5
 // 'o' 8,7,6,5,4,3,2,1,0,1,2,3,4
 // 'r' 9,8,7,6,5,4,3,2,1,1,2,3,3
 // 't' 10,9,8,7,6,5,4,3,2,1,1,2,3
 // 'e' 11,10,9,8,7,6,5,4,3,2,2,1,2
 // 'r' 12,11,10,9,8,7,6,5,4,3,3,2,1

  // swap to save some memory O(min(a,b)) instead of O(a)
  if(a.length > b.length) {
    var tmp = a;
    a = b;
    b = tmp;
  }

  var row = [];
  var rowChars = []
  // init the row
  for(var i = 0; i <= a.length; i++){
    row[i] = i;
    if((i)<a.length)
    rowChars[i] = a.charAt(i)
  }
  if(showLog)console.log("      "+rowChars)
  if(showLog)console.log("    "+row)

  // fill in the rest
  for(var i = 1; i <= b.length; i++){
    //the i loop goes through each row, h, a, r, r, y, , p, o, r, t, e, r
    var prev = i;
    for(var j = 1; j <= a.length; j++){
      // the j loop goes through each col, h, a, r, r, y, , p, o, t, t, e, r
      var val;
      //console.log("b.charAt(i-1) : "+b.charAt(i-1))
      // console.log("a.charAt(j-1) : "+a.charAt(j-1))
      if(b.charAt(i-1) == a.charAt(j-1)){
        val = row[j-1]; // match
        //when a match occurs, add the diagonal value 
      } else { //if(b.charAt(i-1) != a.charAt(j-1)) 
        //console.log(a.charAt(j-1)+" -> "+b.charAt(i-1))
        val = Math.min(row[j-1], // substitution
                       prev,     // insertion
                       row[j])  // deletion
        if(/([a,e,i,o,u])/.test(b.charAt(i-1)) && /([a,e,i,o,u])/.test(a.charAt(j-1))){
          val+= 0.25;
        }
        else if(/(\s)/.test(b.charAt(i-1)) && /(\s)/.test(a.charAt(j-1))){
          val+=0.5
        }
        else{
          val+=1;
        }
        //when its different characters, add 1 to the smallest of them all
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
    if(showLog)console.log("'"+b.charAt(i-1)+"' "+row)
  }

  var lein = row[a.length]

  var bigger = a.length>b.length?a.length:b.length
  var pct = Math.round((bigger - lein) / bigger * 10000)/100;
  if(showLog)console.log("pct : "+pct)
  var log = (Math.round(log10(pct*10) *10000)/100);
  var sine = Math.round((0.5+(0.5*(Math.sin((pct*Math.PI)-(Math.PI/2)))))*10000)/100

  return pct;
}