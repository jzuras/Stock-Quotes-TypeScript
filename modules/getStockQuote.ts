import { ConvertQuote, TwelveDataQuote } from './generatedCode/TwelveDataQuote.js';
import { ConvertError, TwelveDataError } from './generatedCode/TwelveDataError.js';
import { ConvertQuoteExtendedHours, TwelveDataQuoteExtendedHours } from './generatedCode/TwelveDataQuoteExtendedHours.js';

// this is the subset of JSON data needed
export interface StockData
{
    companySymbol : string;
    companyName : string;
    quote : number;
    timeOfQuote : string;
}


let apikey = ''; // client needs to get this from user

const twelveDataURL : string = 'https://api.twelvedata.com/quote?apikey=';


/**
 * This method uses JSON to fetch a quote using the apikey
 * for the sole purpose of validating the key. If valid, keeps a copy
 * for future use and returns true, otherwise returns false.
 * (To avoid putting sensitive info into public, user enters this key.)
 * @param apikeyFromUser - need to get this from user input.
 * @return true if valid, false otherwise.
 */
export async function isApikeyValid( apikeyFromUser : string )
{
    try 
    {
        const apiString = twelveDataURL + encodeURI( apikeyFromUser ) +
            '&symbol=MSFT';
        
        const response = await fetch( apiString );

        if ( !response.ok ) 
        {
            return false;
        }

        const responseText = await response.text();

        // throws error if response is anything other than expected quote
        const quote =
            ConvertQuote.toTwelveDataQuote( responseText );
    }
    catch ( error )
    {
        return false;
    }
    
    // if we get here, apikey is valid, so save for future use
    apikey = apikeyFromUser;
    return true;
}

/** 
 * Uses JSON to fetch the current quote from TwelveData.
 * Note - TwelveData limited to 800 free calls/month.
 * @param symbolToUse - ticker symbol for which to get data.
 * @return StockData Promise.
 */
export async function getStockQuote( symbolToUse : string )
{
    try 
    {
        const apiString = twelveDataURL + encodeURI( apikey ) +
            '&symbol=' + encodeURI( symbolToUse );
        
        const response = await fetch( apiString );

        if ( !response.ok ) 
        {
            throw new Error( `HTTP error: ${response.status}` );
        }
      
        // Conversion code throws error when JSON data is not as expected.
        // Unfortunately this happens with TwelveData for things like unknown symbol,
        // so we need to catch the error, then re-parse to get the actual error message.
        // also, market open vs closed returns different JSON from TwelveData,
        // which is also handled by an error from parsing code, so need to check both.
        
        let responseText = "";
        try
        {
            // need to handle market extended and normal-hours response formats
            responseText = await response.text();

            // Extended Hours data is a superset of regular hours data
            // so try first and catch error thrown by conversion code
            try
            {
                const quote =
                    ConvertQuoteExtendedHours.toTwelveDataQuoteExtendedHours( responseText );
                return mergeQuote( quote );
            }
            catch ( error )
            {
                // superset of Extended Hours data was not present,
                // so try regular hours. if we still get an error
                //  during parsing, it could be an error from TwelveData
                const quote =
                    ConvertQuote.toTwelveDataQuote( responseText );
                return mergeQuote( quote );
            }
        }
        catch ( error )
        {
            // to check if this is an error from TwelveData (vs parser code),
            // try to parse TwelveData error info to show to user
            const errorFromTwelveData =
                ConvertError.toTwelveDataError( responseText );
            throw new Error( errorFromTwelveData.message );
        }
    }    
    catch ( error )
    {
        throw error;
    }
}
  
/**
 * Merge fetched quote information into StockData object. 
 * @param quote - JSON object returned from TwelveData.
 * @returns StockData
 */
function mergeQuote( quote: TwelveDataQuote | TwelveDataQuoteExtendedHours ) : StockData
{
    const returnValue : StockData =
    {
        companySymbol: quote.symbol,
        companyName: quote.name,
        quote: Number.parseFloat( quote.close ),
        timeOfQuote: new Date( quote.timestamp * 1000 ).toLocaleString(),
    }

    if ( quote.hasOwnProperty( 'extenedd_price' ) )
    {
        returnValue.quote = Number.parseFloat(
            ( quote as TwelveDataQuoteExtendedHours ).extended_price );
        returnValue.timeOfQuote = new Date(
            ( quote as TwelveDataQuoteExtendedHours ).extended_timestamp * 1000 ).toLocaleString();
    }
    
    return returnValue;
}
