// this is index.ejs liked javascript below

const likess = document.querySelectorAll('.title-cL')
    for(let lik of likess){
     
      const liked = lik.getAttribute('data-likes')
      lik.innerText = abbrNum(liked, 1)
    }


// this is show.ejs liked javascript below


    const n =document.querySelectorAll('.nLikes')

for(let nl of n){
    const likeValue= nl.getAttribute('data-like')
  
    nl.innerText = abbrNum(likeValue,1)
    //  abbrNum(star,1)
  }



    // This is profile.esj liked javascript below
    const like =document.querySelectorAll('.count')
    const likeAdd =document.querySelector('.count')

    let counts = 0;

    for(let likes of like){
      let count = likes.getAttribute('data-count')
      // counts += count.likes.length
       counts += parseInt(count);
    }
    // likes.innerText = counts;
    likeAdd.innerText =abbrNum(counts, 1);



function abbrNum(number, decPlaces) {
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}