import { ConvertTimeSeries, TwelveDataTimeSeries } from './generatedCode/TwelveDataTimeSeries.js';
import { ConvertError, TwelveDataError } from './generatedCode/TwelveDataError.js';

export type TimeSeriesStockData = Array<{ X: string, Y: number }>;

let apikey = ''; // client needs to get this from user


/**
 * To avoid putting sensitive info into public, get api key from user.
 * NOTE - assumption is that this key has been validated elsewhere.
 * @param apikeyFromUser - need to get this from user input.
 */
 export function setApikey( apikeyFromUser : string )
 {
     apikey = apikeyFromUser;
 }
 

/**
 * Uses JSON to fetch Time Series data from TwelveData. (This is
 * an entire day's worth of price quote.) This will fail if 
 * stock market has not yet opened, or never opened, on date given.
 * This method throws error for that failure - calling method handles it.
 * Note - TwelveData limited to 800 free calls/month.
 * @param symbolToUse - ticker symbol for which to get data.
 * @param dateToUse - date for which to get data.
 * @returns TimeSeriesStockData Promise.
 */
async function getTimeSeriesForDate( symbolToUse: string, dateToUse: Date )
{
    try 
    {
        // get date in format: 1970-01-01T00:00:00.000Z
        let dateInISOFormat = dateToUse.toISOString();
        let dateOnly = dateInISOFormat.slice(0, 10);

        const apiString =
            'https://api.twelvedata.com/time_series?interval=5min&order=ASC' +
            '&date=' + dateOnly + '&apikey=' + encodeURI( apikey ) +
            '&symbol=' + encodeURI( symbolToUse );
        
        const response = await fetch( apiString );

        if ( !response.ok ) 
        {
            throw new Error( `HTTP error: ${response.status}` );
        }

        // JSON Conversion code throws error when JSON data is not as expected
        // Unfortunately this happens with TwelveData for things like market closed
        // so we need to catch the error, then re-parse to get the actual error message
        
        let responseText = "";
        try
        {
            responseText = await response.text();

            const timeSeriesData =
                ConvertTimeSeries.toTwelveDataTimeSeries( responseText );

            return timeSeriesData;
        }
        catch ( error )
        {
            const errorFromTwelveData =
                ConvertError.toTwelveDataError( responseText );
            return errorFromTwelveData;
        }
    }    
    catch ( error )
    {
        throw error;
    }
}


/** 
 * Uses JSON to fetch Time Series data from TwelveData. (This is
 * an entire day's worth of price quote.) This will fail if 
 * stock market has not yet opened, or never opened.
 * This method tries today first, but will go back one day
 * at a time if data is not available for the day. 
 * Max 4 tries, after which we give up and throw error.
 * Note - TwelveData limited to 800 free API calls/month.
 * @param symbolToUse - ticker symbol for which to get data
 * @returns TimeSeriesStockData Promise.
 */
export async function getTimeSeries( symbolToUse : string )
{
    try 
    {
        const dateToTry = new Date(); // today
        let timeSeriesData
            = await getTimeSeriesForDate( symbolToUse, dateToTry );

        // timeSeriesData may fail when market did not open for the day (weekend)
        // or has not yet opened (pre-market)
        // in these cases, we attempt to get yesterday's data
        // if still an issue, keep going back one day, but try a max of 4 times
        // (if the market was closed for more than 4 days, throw error)
        let maxTries = 1;
        let success = false;
        while ( maxTries < 5 && !success )
        {
            if ( timeSeriesData.hasOwnProperty( 'code' ) &&
                (timeSeriesData as TwelveDataError).code === 400 )
            {
                // keep trying by going back a day
                dateToTry.setDate( dateToTry.getDate() - 1 );
                maxTries++;
                timeSeriesData =
                    await getTimeSeriesForDate( symbolToUse, dateToTry );
            }
            else
            {
                success = true;
            }
        }
        if ( success )
        {
            return mergeQuote( timeSeriesData as TwelveDataTimeSeries );
        }
        
        throw new Error( 'Unable to find a day that market was open.' );
    }
    catch ( error )
    {
        throw error;
    }
}
  

/**
 * Merge fetched quote information into TimeSeriesStockData object.
 * @param timeSeriesData - JSON object returned from TwelveData.
 * @returns an array of objects with X and Y fields.
 */
function mergeQuote( timeSeriesData : TwelveDataTimeSeries )
{
    let returnValue: TimeSeriesStockData = new Array();

    // loop through data and populate returnValue
    for ( let i = 0; i < timeSeriesData.values.length; i++ ) 
    {
        returnValue[i] =
        {
            X: timeSeriesData.values[i].datetime, // string
            Y: Number(timeSeriesData.values[i].close)
        }
    }

    return returnValue;
}