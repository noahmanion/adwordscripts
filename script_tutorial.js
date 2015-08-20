/*********************************
* Intro to Javascript For AdWords Scripts
* Version 1.0
* Created By: Russ Savage
* FreeAdWordsScripts.com
*********************************/
function main() {
  // This is a comment. AdWords Scripts ignores this
  /* Here is another way to comment
     that can be used when you need
     to comment multiple lines */
   
  // The main function tells AdWords where to start. You always need
  // at least a main function in your script.
   
  // Let's start with some variables (or primatives)
  // More info on Javascript variables can be found:
  // http://www.tutorialspoint.com/javascript/javascript_variables.htm
  var clubName = 'Fight Club'; // declared with single quotes
  var rule1 = "Don't talk about fight club."; // or double quotes if needed
  var members = 12; // a number, no quotes
  var dues = 3.50; // also a number
  var isAcceptingNewMembers = true; // a boolean, for yes or no answers
   
  // When you need to store multiple values, consider an Array
  // More detailed intro to Arrays can be found here:
  // http://www.w3schools.com/js/js_obj_array.asp
  var memberNames = ['brad','edward','robert'];
  // Which you can access the values with an index
  var coolestMember = memberNames[0]; // pronounced member names sub zero
  // 0 is the index of the first element of the array, 1 for the second, etc.
  // We can use the length property of an array to find out how big it is.
  var numberOfMembers = memberNames.length; // this will be 3
  var dailyFights = numberOfMembers*2; // star ( * ) is an operator for multiply
  // so the total number of fights is 6.
  // More on operators can be found here:
  // http://web.eecs.umich.edu/~bartlett/jsops.html
   
  // If you want to group multiple variables together, you can using an Object.
  // An Object is simply a grouping of common variables (and other stuff we'll see later)
  var FightClub = { // The curly brace says group these things together. there is another one at the end.
    clubName : 'The Fight Club', // a string variable. In an Object, we use : instead of = for assignment
    rules : ["Don't talk about fight club.",  // each variable is separated by a comma, instead of a semi-colon
             'Do not talk about fight club.'],
    memberNames : ['brad','eddy','robert','phil','dave'],
    dues : 3.50, 
    foundedYear : 1999
  };
  // Now to access the variables inside the object, we use the dot
  Logger.log(FightClub.clubName); // prints The Fight Club
  Logger.log(FightClub.memberNames[0]); // prints brad
   
  // Objects are one of the most important concepts of Javascript and they will come back
  // again and again a little later. More details can be found here:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects
   
  // Sidebar: Why do I use camelCase for variable names? Technically
  // I could 
  var UsEWhaTevERIwanteD = 'but camelCase is easier to read';
  // and conforms to the style guide that Google recommends:
  // https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml#Naming
  // Follow the style guide. It helps others read your code.
   
  // If statements (or control statements) allow you to split your code path if needed
  if(numberOfMembers > 10) { // if we have more than 10 members
    dues += 1.00; // increase the dues, 
    // plus equals (+=) says "add the value on the right to the value on the left"
  } else { // otherwise
    dues -= 1.00; // decrease the dues
    // there are also -=, *= (multiply), /= (divide by), and %= (modulo equals)
  }
  // Comparison operators like >, <, ==, ===, <=, >= allow you to compare values
  // They return true or false, always
  // Notice the double and triple equal signs. That's not a typo. More info can be found at:
  // http://www.impressivewebs.com/why-use-triple-equals-javascipt/
   
  // You can also have multiple if statements and multiple things to test
  if(dues > 5) { // if dues are over $5
    dailyFights++; // increase the fights
  } else if(dues > 2 && dues <= 5) { // if dues are greater than $2, but less than $5
    dailyFights--; // decrease the fights
  } else { // otherwise
    dailyFights = numberOfMembers*2; // reset the fights
  }
  // You'll probably notice none of this makes sense. it is only for example.
  // Double Ampersand && just means AND, || means OR. So in the statement above,
  // both statements with operators must be true in order for the fights to be decreased.
  // Oh, and ++, -- is shortcut for +=1 and -=1 respectively.
   
  // Ok, now lets talk about loops. 
  // Here are a few different ways to loop through the members
  // This is called a While Loop and while it might be easy to understand,
  // You won't use it nearly as often as the other two.
  var i = 0; // the variable i is what we will use for each indice
  while(i < memberNames.length) { // while i is less than the length of names
    Logger.log(memberNames[i]); // print out the name
    i++; // and increment the index by 1
  }
  // i is a variable that controls the loop. A common issue with While loops
  // is that you will forget to increment the loop control and you get an infinate loop
   
  // This is the classic For loop
  // The declaration, checking, and incrementing are all done 
  // in the first line so it is harder to miss them
  for(var index = 0; index < memberNames.length; index++) {
    Logger.log(memberNames[index]);
  }
   
  // And finally, the easiest loop but hardest to explain, the ForEach loop
  // This is just a variation of the For loop that handles incrementing index
  // behind the scenes so you don't have to.
  for(var index in memberNames) { // declare index, which will be assigned each indice
    Logger.log(memberNames[index]); // Use the indice to print each name
  }
   
  // You can jump out of a loop before it reaches the end by combining the if statement
  for(var index in memberNames) { 
    if(memberNames[index] === 'edward') {
      break; // break is a keyword you can use to break out of the loop.
    }
    Logger.log(memberNames[index]); 
  }
  // In this case, only the first name is printed because we broke out once we had the 
  // second name. More on break and its partner, continue, check out:
  // http://www.tutorialspoint.com/javascript/javascript_loop_control.htm
   
  // Now let's talk about functions. We have already seen a function in action: main()
  // Functions are groupings of useful code that you can call over and over again easily
  function fight(player1, player2) {
    if(Math.random() < .5) {
      return player1;
    } else {
      return player2; // return means we are going to send player2 back 
                      // to the code that called the function
    }
  }
  // This code can be called over and over again using a loop
  for(var player1 in memberNames) { // Loop through each member
    for(var player2 in memberNames) { // Then loop through again 
      if(player1 !== player2) { // Players can't fight themselves so check for that
        Logger.log(fight(player1,player2)); // Then call the function we defined earlier
      }
    }
  }
  // This code calls fight() for:
  //    brad vs. edward, brad vs. robert
  //    edward vs. brad, edward vs. robert
  //    robert vs. brad, robert vs. edward
  // Some other functions we have been calling are Logger.log() and Math.random()
  // The cool thing is that as callers of the function, we only need to know how
  // to call the function, we don't need to know how it works behind the scenes
  // For example:
  //   var answer = LargeHadronColider.simulateEleventhDimensionalQuantumThingy(47);
  // Who knows how this works. All we need to know is to send it a number and expect a
  // number back.
   
  // I hope you've been noticing all of the Objects we have been using here. Logger is one,
  // Math is another one (and LargeHadronColider is a fake one). Along with variables, we 
  // can also put functions in there as well:
  var FightClub = { 
    // ... all that other stuff
    chant : function() { 
      Logger.log('His name is Robert Paulson.'); 
    },
    totalMembers : 5
  };
  // Whoa trippy. So what happens when I call 
  FightClub.chant();
  // It's going to print His name is Robert Paulson
   
  // The thing that makes Google AdWords Scripts different from writing just regular Javascript
  // is all of the pre-defined Objects that use functions to interact with AdWords.
  AdWordsApp.currentAccount();
  Utilities.jsonParse('{}');
  AdWordsApp.keywords().withLimit(10).get();
  // How does the above statement work?
  AdWordsApp  // this is a predefined object in AdWords Scripts
    .keywords() // which has a function called keywords() that returns a KeywordSelector object
    .withLimit(10) // which has a function withLimit() that returns the same KeywordSelector object
    .get(); // which has a function get() that returns a KeywordIterator object.
  // Check out the AdWords Scripts documentation to find the objects and classes that make up these calls
  // https://developers.google.com/adwords/scripts/docs/reference/adwordsapp/adwordsapp
  // https://developers.google.com/adwords/scripts/docs/reference/adwordsapp/adwordsapp#keywords_0
  // https://developers.google.com/adwords/scripts/docs/reference/adwordsapp/adwordsapp_keywordselector
  // https://developers.google.com/adwords/scripts/docs/reference/adwordsapp/adwordsapp_keywordselector#withLimit_1
  // https://developers.google.com/adwords/scripts/docs/reference/adwordsapp/adwordsapp_keywordselector#get_0
   
  // So I think that just about does it for this tutorial.  If you made it this far, awesome! Post a comment to ask
  // any questions you might have.
   
  // Thanks,
  // Russ
}