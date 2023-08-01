# Stock-Quotes-TypeScript

This is the conversion of my original Stock Quotes repo, which was a Learning Project, 
to TypeScript, again for Learning reasons. As with the original JS repo, this is not
expected to be useful to the world at large.

The two biggest hurdles for this conversion were:
1) the TwelveData API returns different JSON objects for the same call,
and for errors, returns yet another JSON object.
2) JSON objects need to be handled in a type-safe way. To do so, I found
a website that generates code for this purpose: 
https://app.quicktype.io/
Unfortunately, the way it handles unexpected data is to throw errors.
Combined with the variation of JSON data from TwelveData, this makes
for some messy code, with lots of try-catch blocks, including nesting them.

I have chosen to put the generated JS files here under Git, to enable the code
to run under [GitHub Pages](https://jzuras.github.io/Stock-Quotes-TypeScript/).

As with the original JS project, the api key for TwelveData is not included in the code,
and therefore needs to be entered by the user. To run under Pages,
I can provide the api key for any recruiters that might want to try it out.
I go into more detail on this in my discussion on [LinkedIn](https://www.linkedin.com/posts/jimzuras_my-learning-journey-part-1-stock-quotes-activity-7058796727692140544-XntD).
There is also a [new TS version](https://github.com/jzuras/Stock-Quotes-TypeScript---Azure-Client) that uses my Azure Function and does not require the api key.
