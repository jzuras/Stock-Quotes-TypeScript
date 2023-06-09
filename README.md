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

I have chosed to put the generated JS files here under Git. My reason is that
I want to be able to run this code with Pages. As I write this, I don't know if this works.

As with the original JS project, the api key for TwelveData is not included in the code,
and therefore needs to be entered by the user. If this does run under Pages,
I can provide that info for any recruiters that might want to try it out.
