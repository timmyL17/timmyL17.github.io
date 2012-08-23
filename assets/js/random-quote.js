//============================================================
//Script:     Random Quote
//
//Functions:  This simple script allows you to print random
//            quotations in the page.  Any number of quotes
//            may be used.
//
//Browsers:   All
//
//Author:     etLux
//============================================================
//
//INSTRUCTIONS:
//
//Put the following script in the <body> of your page,
//wherever you want the quotes to appear.  Simply set up the
//quotations in the Quotations[] array, then paste in the
//whole block of code.  To format the text, wrap the usual
//font tags around the script (view source on our demo on this
//page for an example.)
//
//TECH NOTE:
//
//In quotation 8, note the text, \"beauty\" -- if you need
//to use double-quote " marks, you *must* precede each
//double-quote with a backslash \... otherwise the script
//will break.
//
//THE CODE:

// ==============================================
// Copyright 2004 by CodeLifter.com
// Free for all; but please leave in this header.
// ==============================================

var Quotation=new Array() // do not change this!
var Author=new Array()

// Set up the quotations to be shown, below.
// To add more quotations, continue with the
// pattern, adding to the array.  Remember
// to increment the Quotation[x] index!
//
// To get quotes in the string, escape them like \"

Quotation[0] = "Great minds have purposes, others have wishes.";
Author[0] = "Washington Irving";

Quotation[1] = "Try not to become a man of success, \
                but rather try to become a man of value.";
Author[1] = "Albert Einstein";

Quotation[2] = "Lose one friend. Lose all friends. Lose yourself.";
Author[2] = "Plays With Squirrels";

Quotation[3] = "Everyone is a genius. But if you judge a fish on \
                its ability to climb a tree, it will live its whole \
                life believing that it is stupid.";
Author[3] = "Albert Einstein";

Quotation[4] = "THERE ARE FOUR LIGHTS!";
Author[4] = "Captain Jean-Luc Picard";

Quotation[5] = "All those who wander are not lost.";
Author[5] = "J.R.R. Tolkien";

Quotation[6] = "It is not until we are truly lost that we begin \
                to find ourselves.";
Author[6] = "Henry David Thoreau";

Quotation[7] = "Why did they call it a motherboard and not a fatherboard? \
                Because if it was a fatherboard nothing would get done.";
Author[7] = "";

Quotation[8] = "Life is a process of becoming, a combination of states \
                we have to go through. Where people fail is that they wish \
                to elect a state and remain in it. This is a kind of death.";
Author[8] = "An&iuml;as Nin";

Quotation[9] = "Each contact with a human being is so rare, so precious, \
                one should preserve it.";
Author[9] = "An&iuml;as Nin";

Quotation[10] = "To the world you may be one person, but to one person you may \
                 be the world.";
Author[10] = "";


// Write to the document
function showQuotation()
{
  var Q = Quotation.length;
  var whichQuotation=Math.round(Math.random()*(Q-1));
  document.write("<dl>\n");
  document.write("<dt>" + "\"" + Quotation[whichQuotation] + "\"</dt>\n");
  if(Author[whichQuotation] !== "")
  {
    document.write("<dd>" + "--" + Author[whichQuotation] + "</dd>\n");
  }
  document.write("</dl>");
}
showQuotation();


