/**
 * Contains functions triggered by clicks, to be inserted into page.
 */


/**
 * Close notification when 'X' button is clicked.
*/

function ccpaClose(){
    var popup = document.getElementById('CCPAPopup');
    var close = document.getElementById('CCPAClose');
    var moreInfo = document.getElementById('CCPAMoreInfo');
    var button = document.getElementById('CCPAButton');
    popup.style.display = 'none';
    close.style.display = 'none';
    moreInfo.style.display = 'none';
    button.style.display = 'none';
}

/**
 * Find and click CCPA opt-out link
 */
function ccpaButtonClick(){
    var pageElements = document.getElementsByTagName('*');
    for(var i = 0; i < pageElements.length; i++) {

        // If opt-out link is found, click it.
        if(pageElements[i].innerHTML.toLowerCase().search('do not sell') != -1
            || pageElements[i].innerHTML.toLowerCase().search('don\'t sell') != -1) {
            pageElements[i].click();
        }
    }
    var getUrl = window.location;
    var baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    
    logEvent("extension-opt",baseUrl);

}

/**
 * Find and click CCPA opt-out link
 */
function ccpaWarningClick(){
    var pageElements = document.getElementsByTagName('*');
    for(var i = 0; i < pageElements.length; i++) {

        // If opt-out link is found, click it.
        if(pageElements[i].innerHTML.toLowerCase().search('ca privacy') != -1) {
            pageElements[i].click();
        }
    }
    
    var getUrl = window.location;
    var baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    
    logEvent("extension-opt",baseUrl);
}

/**
 * Find and click CCPA opt-out link
 */
function ccpaDontShow(){
    ccpaClose();

    visitedSites.push(window.location.href);
}

/* Use to log page events by sending a POST request to server. Can't
log page unload due to asynchronous running - page finishes closing
before the request can receive a response. Use "logBeacon" for these events
instead.

:param eventType: (str) - Type of event to log, currently used values are
"page_load", "page_unload", "page_blur", "page_focus", "survey_id" and "click."
:param elementId: (str) Optional element_id, currently used for "click"
events to identify what was clicked on. Default value "na"  */
function logEvent(eventType, elementId="na") {

  // Send POST request to backend
  fetch(`http://127.0.0.1:5000/`, {
    method: "POST",
    body: makeData(eventType, elementId),
    cache: 'no-cache',
    crossDomain: true,
    headers: new Headers({
      'content-type': 'application/json'})
    });
}

/* Use if logging an event that will trigger the page unloading, such as
clicking on a link or closing the page.  Logs event using navigator.sendBeacon,
which will send without waiting for a response and thus complete even if the
page unloads.  Avoid using when not necessary due to possible unreliability
of the beacon API.

:param eventType: (str) - See documentation for logEvent above
:param elementId: (str) See documentation for logEvent above  */
function logBeacon(eventType, elementId="na") {
  navigator.sendBeacon(`http://127.0.0.1:5000/`, makeData(eventType, elementId));
}

/*   Makes a string with all logged data which server can receive through POST
request.  Values are separated by triple semicolons (;;;).  The following is
included:
  **timestamp - Epoch time of event in seconds.  Rounded to 1/10th of a second.
  **event type - Type of event.  Currently used values are "page_load",
  "page_unload", "page_blur", "page_focus", "survey_id" and "click."
  **element id - description of what was clicked on for click events
  **bannerStyle - Number describing style of CCPA banner displayed, if any.
  **navigator.userAgent - User Agent string from browser
  **mobile - true or false denoting whether user has a mobile device.

:param eventType: (str) - See documentation for logEvent above
:param elementId: (str) See documentation for logEvent above */
function makeData(eventType, elementId="na")
{
  // Get time in ms, round to 1/10th second due to browser imprecision
  timeStamp = Math.floor(Date.now() / 100 );
  timeStamp = timeStamp / 10;
  timeStamp = String(timeStamp);

  // Compile parameters into string
  var data = timeStamp + ";;;" + eventType + ";;;" + elementId + ";;;" + navigator.userAgent;
  return data;
}


