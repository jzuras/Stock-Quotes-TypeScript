// this charting code is from (combine 2 lines below to follow link)
// https://web.archive.org/web/20130407101311/
// http://www.worldwidewhat.net/2011/06/draw-a-line-graph-using-html5-canvas/
const xPadding = 40;
const yPadding = 30;
let minMaxY = { min: 0, max: 0 };
/**
 * Initializes minMaxY object by looping through the data to find
 * the minimum and maximum prices (Y-axis values).
 * @param data - an array of objects with X and Y fields.
 * Only the Y field (stock price) is used here.
 */
function setMinMaxY(data) {
    let max = 0;
    let min = Number.MAX_SAFE_INTEGER;
    let margin = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].Y > max) {
            max = data[i].Y;
        }
        if (data[i].Y < min) {
            min = data[i].Y;
        }
    }
    // allow wiggle room at top and bottom of chart
    // by adding half the range to top and bottom
    margin = (max - min) / 2;
    max += margin;
    min -= margin;
    minMaxY = { min, max };
}
/**
 * Computes and returns the x-pixel position for the provided time value.
 * @param canvasWidth - width of drawing canvas.
 * @param timeValue - time of quote in format 'HH:MM:SS'
 * @returns the x-pixel position for the provided time value.
 */
function getXPixel(canvasWidth, timeValue) {
    // timeValue is this date format - 2023-04-05 09:30:00
    // pull time from date, convert to seconds to compute 
    // x-value across 6.5 hours( 9:30 AM to 4 PM )
    const hourValue = Number(timeValue.slice(11, 13));
    const minuteValue = Number(timeValue.slice(14, 16));
    const secondValue = Number(timeValue.slice(17, 19));
    const timeValueInSeconds = hourValue * 3600 + minuteValue * 60 + secondValue;
    const nineThirtyInSeconds = 9 * 3600 + 30 * 60;
    return (canvasWidth - xPadding) *
        ((timeValueInSeconds - nineThirtyInSeconds) / (6.5 * 3600)) +
        xPadding;
}
/**
 * Computes and returns the y-pixel position for the provided stock price.
 * @param canvasHeight - height of drawing canvas.
 * @param stockPrice - price for the stock being charted.
 * @returns the y-pixel position for the provided stock price.
 */
function getYPixel(canvasHeight, stockPrice) {
    return canvasHeight - (((canvasHeight - yPadding) /
        (minMaxY.max - minMaxY.min)) *
        (stockPrice - minMaxY.min)) - yPadding;
}
/**
 * Draws the x and y axes and labels, then
 * draws the daily stock price data onto the chart.
 * The X-axis is the daily operating hours of the stock market, 9:30 AM to 4 PM.
 * @param chartCanvas - canvas element on which to draw data.
 * @param data - an array of objects with X and Y fields.
 * X is a date string in the format of 'YYYY-MM-DD HH:MM:SS'
 * Y is the price of the stock at 'X' time.
 */
export function drawChart(chartCanvas, data) {
    const ctx = chartCanvas.getContext('2d');
    if (ctx === null)
        return; // nothing to draw on
    // clear canvas first
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    // determine min/max stock prices
    setMinMaxY(data);
    // set context properties for drawing
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.font = '8pt sans-serif';
    ctx.textAlign = 'center';
    // draw x and y axis lines
    ctx.beginPath();
    ctx.moveTo(xPadding, 0);
    ctx.lineTo(xPadding, chartCanvas.height - yPadding);
    ctx.lineTo(chartCanvas.width, chartCanvas.height - yPadding);
    ctx.stroke();
    // draw labels under x axis
    // x-axis length (width - xPadding) represents 6.5 hours
    // draw labels for 10 AM, 12 noon, and 2 PM 
    // (not worrying about perfect centering of label)
    let xValue = (0.5 / 6.5) * (chartCanvas.width - xPadding) + xPadding;
    ctx.fillText('10 AM', xValue - 10, chartCanvas.height - yPadding + 20);
    xValue = (2.5 / 6.5) * (chartCanvas.width - xPadding) + xPadding;
    ctx.fillText('12 Noon', xValue - 20, chartCanvas.height - yPadding + 20);
    xValue = (4.5 / 6.5) * (chartCanvas.width - xPadding) + xPadding;
    ctx.fillText('2 PM', xValue - 20, chartCanvas.height - yPadding + 20);
    // need to display date for which we have data as it may not be today
    xValue = (6.0 / 6.5) * (chartCanvas.width - xPadding) + xPadding;
    const dateOfData = "Prices on " +
        data[0].X.slice(0, 10);
    ctx.fillText(dateOfData, xValue - 20, chartCanvas.height - yPadding + 20);
    // draw 3 labels to left of y axis, and draw a gray dashed line across 
    // for each label
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'gray';
    ctx.setLineDash([1, 1]);
    for (let i = 1; i < 4; i++) {
        const yValue = minMaxY.min + ((minMaxY.max - minMaxY.min) *
            i / 4);
        const yPixel = getYPixel(chartCanvas.height, yValue);
        ctx.fillText(yValue.toFixed(2), xPadding - 10, yPixel, xPadding - 10);
        ctx.beginPath();
        ctx.moveTo(xPadding, yPixel);
        ctx.lineTo(chartCanvas.width, yPixel);
        ctx.stroke();
    }
    // draw line for actual data values
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.setLineDash([]);
    ctx.moveTo(getXPixel(chartCanvas.width, data[0].X), getYPixel(chartCanvas.height, data[0].Y));
    for (let i = 1; i < data.length; i++) {
        ctx.lineTo(getXPixel(chartCanvas.width, data[i].X), getYPixel(chartCanvas.height, data[i].Y));
    }
    ctx.stroke();
}
//# sourceMappingURL=stockChart.js.map