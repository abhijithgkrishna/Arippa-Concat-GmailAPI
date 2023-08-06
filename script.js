
const CLIENT_ID = '' ;
const API_KEY = '';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.modify";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("authorize_button").style.visibility = "hidden";
document.getElementById("sign-out").style.visibility = "hidden";

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("authorize_button").style.visibility = "visible";
  }
}

/**
 *  Sign in the user upon button click.
 */
var loggedIn = false;

async function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById('sign-out').style.display = 'visible';
    document.getElementById('sign-in').innerText = 'Refresh';
    loggedIn = true;
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" }).then(console.log('succsee'));
    
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    await tokenClient.requestAccessToken({ prompt: "" });
  
  }
  if(flag == 1)
    window.location.href = "main.html";
  
       
    
}

function hasToken(){
  if(tokenClient.getAccessToken != null)
    window.location.href = 'main.html';
}


/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    document.getElementById("content").innerText = "";
    document.getElementById("authorize_button").innerText = "Authorize";
    document.getElementById("signout_button").style.visibility = "hidden";
  }
}

//*****************************************************************************************************************************************************

document.getElementById('sign-in-button').addEventListener('click', function() {
    // Start the loader animation
    document.getElementById('loading-bar').style.left = '0%';

    // Call your function here
    categorize();

    // Hide the loader after 2 seconds
    setTimeout(function() {
        document.getElementById('loading-bar').style.left = '100%';
    }, 2000);
});

async function createLabel(labelName){
  let response;
  try {
    response = await gapi.client.gmail.users.labels.create({
      "userId":"me",
      "labelListVisibility": "labelShow",
      "messageListVisibility": "show",
      "name": labelName
});
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return response;
  }
}

async function getLabels(){
  let response;
  try {
    response = await gapi.client.gmail.users.labels.list({
      "userId":"me",
});
    const respObj = JSON.parse(response.body);
    const labels = respObj.labels;
    return labels;
    
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }
}

async function getLabelId(labelname){
  const labels = await getLabels();
  var ob = labels.find(obj => obj.name === labelname );
  if(ob==null){
    ob = await createLabel(labelname);
  }
  console.log(ob);
  const labelId = ob.id;
  return labelId;
}


async function fetchMails(q, newlabel){
  let response;
  try {
    response = await gapi.client.gmail.users.messages.list({
      "userId":"me",
      "q":q
});

    var respObj = JSON.parse(response.body);
    
    var msgIds = respObj.messages.map(msg => msg.id);
    
    await msgIds.forEach((id)=>changeMailLabel(id,newlabel));
    
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }
}

async function changeMailLabel(msgId, labelName){
  const labelId = await getLabelId(labelName);
  let response;
  try {
    response = await gapi.client.gmail.users.messages.modify({
      "userId":"me",
      "id": msgId,
      "addLabelIds": [
    labelId
  ]
});
    
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }
}

async function categorize()
{
  if(loggedIn == true)
    {
      var option = document.getElementById("option").value;
      console.log(option);
      var label = document.getElementById("labelName").value;
      var q = document.getElementById("criteriaInput").value;

      if(option.includes("sender")){
        q = "from:" + q;
      }
      await fetchMails(q,label);
    }
  else
    alert('Log In to continue');
    

  
}
