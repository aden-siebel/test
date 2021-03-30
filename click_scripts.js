function hashString(input) {

  var hash = 0, i, chr;
  if (input.length === 0) return hash;
  for (i = 0; i < input.length; i++) {
    chr   = input.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;

}

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(cookie)
        {
            if(callback) {
                callback(cookie.value);
            }
        } else {
            callback('failure');
        }
    });
}

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
    var baseUrlOriginal = baseUrl;
    baseUrl = hashString(baseUrl).toString();
    
    logEvent("popup-opt",baseUrl);
    logEvent("auto-whitelist", baseUrl);
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
    var baseUrlOriginal = baseUrl;
    baseUrl = hashString(baseUrl).toString();
    
    logEvent("popup-warning-opt",baseUrl);
    logEvent("auto-whitelist", baseUrl);

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

:param eventType: (str) - Type of event to log
:param elementId: (str) Optional element_id, used for URL  */
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

/*   Makes a string with all logged data which server can receive through POST
request.  Values are separated by triple semicolons (;;;).  The following is
included:
  **timestamp - Epoch time of event in seconds.  Rounded to 1/10th of a second.
  **event type - Type of event. 
  **element id - description of what was clicked on for click events
  **navigator.userAgent - User Agent string from browser

:param eventType: (str) - See documentation for logEvent above
:param elementId: (str) See documentation for logEvent above */
function makeData(eventType, elementId="na")
{
  // Get time in ms, round to 1/10th second due to browser imprecision
  timeStamp = Math.floor(Date.now() / 100 );
  timeStamp = timeStamp / 10;
  timeStamp = String(timeStamp);

  var linkType; 
  var cookieId;

  getCookies("http://127.0.0.1:5000/", "id", function(ids) {
      cookieId = ids;
  });

  linkType = 'optout'
  if(eventType == "popup-warning-opt")
      linkType = 'warning'; 


  // Compile parameters into string
  var data = timeStamp + ";;;" + eventType + ";;;" + elementId + ";;;" + linkType + ";;;" + cookieId + ";;;" + navigator.userAgent;
  return data;
}

