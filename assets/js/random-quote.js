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

Quotation[3] = "Everyone is a genius. But if you judge a fish by \
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

Quotation[11] = "You know you're in love when you can't fall asleep because reality \
                 is finally better than your dreams.";
Author[11] = "Dr. Seuss";

Quotation[12] = "Be yourself; everyone else is already taken.";
Author[12] = "Oscar Wilde";

Quotation[13] = "Live as if you were to die tomorrow. Learn as if you \
                 were to live forever.";
Author[13] = "Mahatma Gandhi";

Quotation[14] = "I've learned that people will forget what you said, people will \
                 forget what you did, but people will never forget how you made \
                 them feel.";
Author[14] = "Maya Angelou";

Quotation[15] = "Here's to the crazy ones. The misfits. The rebels. The troublemakers. \
                 The round pegs in the square holes. The ones who see things differently. \
                 They're not fond of rules. And they have no respect for the status quo. \
                 You can quote them, disagree with them, glorify or vilify them. \
                 About the only thing you can't do is ignore them. Because they change things. \
                 They push the human race forward. While some may see them as the crazy ones, \
                 we see genius. Because the people who are crazy enough to think they can \
                 change the world, are the ones who do.";
Author[15] = "Apple Inc.";

Quotation[16] = "We are all in the gutter, but some of us are looking at the start.";
Author[16] = "Oscar Wilde";

Quotation[17] = "Life is what happens to you while you're busy making other plans.";
Author[17] = "John Lennon";

Quotation[18] = "I have not failed. I've just found 10,000 ways that won't work.";
Author[18] = "Thomas A. Edison";

Quotation[19] = "You don't have a soul. You are a soul. You have a body.";
Author[19] = "C.S. Lewis";

Quotation[20] = "For every minute you are angry you lose sixty seconds of happiness.";
Author[20] = "Ralph Waldo Emerson";

Quotation[21] = "Love is that condition in which the happiness of another person is \
                 essential to your own.";
Author[21] = "Robert A. Heinlein";

Quotation[22] = "Not all of us can do great things. But we can do small things \
                 with great love.";
Author[22] = "Mother Theresa";

Quotation[23] = "Be nice to nerds. You may end up working for them. We all could.";
Author[23] = "Charles J. Sykes";

Quotation[24] = "I'm not afraid of death; I just don't want to be there when it happens.";
Author[24] = "Woody Allen";

Quotation[25] = "Listen to the mustn'ts, child. Listen to the don'ts. Listen to the \
                 shouldn'ts, the impossibles, the won'ts. Listen to the never haves, then \
                 listen close to me... Anything can happen, child. Anything can be.";
Author[25] = "Shel Silverstein";

Quotation[26] = "Piglet sidled up to Pooh from behind. \"Pooh?\" he whispered. <br> \
                 \"Yes, Piglet?\"<br> \
                 \"Nothing,\" said Piglet, taking Pooh's hand. \"I just wanted to be \
                 sure of you.";
Author[26] = "A. A. Milne";

Quotation[27] = "The question isn't who is going to let me; it's who is going \
                 to stop me.";
Author[27] = "Ayn Rand";

Quotation[28] = "It is what you read when you don't have to that determines \
                 what you will be when you can't help it.";
Author[28] = "Oscar Wilde";

Quotation[29] = "I have never let my schooling interfere with my education.";
Author[29] = "Mark Twain";

Quotation[30] = "Go to heaven for the climate and hell for the company.";
Author[30] = "Mark Twain";

Quotation[31] = "If you don't like something, change it. If you can't change it, change \
                 your attitude. Don't complain.";
Author[31] = "Maya Angelou";

Quotation[32] = "Keep away from people who try to belittle your ambitions. Small \
                 people always do that, but the really great make you feel that you, too, \
                 can become great.";
Author[32] = "Mark Twain";

Quotation[33] = "The truth is, everyone is going to hurt you. You just got to \
                 find the ones worth suffering for.";
Author[33] = "Bob Marley";

Quotation[34] = "An eye for an eye will only make the whole world blind.";
Author[34] = "Mahatma Gandhi";

Quotation[35] = "Life isn't about finding yourself. Life is about creating yourself.";
Author[35] = "George Bernard Shaw";

Quotation[36] = "If you only read the books that everyone else is reading, \
                 you can only think what everyone else is thinking.";
Author[36] = "Haruki Murakami";

Quotation[37] = "And above all, watch will glittering eyes the whole world around \
                 you because the greatest secrets are always hidden in the most unlikely \
                 places. Those who don't believe in magic will never find it.";
Author[37] = "Roald Dahl";

Quotation[38] = "How wonderful it is that nobody need wait a single moment before \
                 starting to improve the world.";
Author[38] = "Anne Frank";

Quotation[39] = "We should all start to live before we get too old. Fear is stupid. So are \
                 regrets.";
Author[39] = "Marilyn Monroe";

Quotation[40] = "When you're in jail, a good friend will be trying to bail you out. A \
                 best friend will be in the cell next to you saying, 'Damn, that was fun'.";
Author[40] = "Groucho Marx";

Quotation[41] = "I would rather walk with a friend in the dark, than alone in the light.";
Author[41] = "Helen Keller";

Quotation[42] = "Whatever you are, be a good one.";
Author[42] = "Abraham Lincoln";

Quotation[43] = "If we knew what it was we were doing, it would not be called research, \
                 would it?";
Author[43] = "Albert Einstein";

Quotation[44] = "When I was 5 yeard old, my mother always told me that happiness was the \
                 key to life. When I went to school, they asked me what I wanted to be when I \
                 grew up. I wrote down 'happy'. They told me I didn't understand the \
                 assignment, and I told them they didn't understand life.";
Author[44] = "John Lennon";

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


