export {
  wait,
  updateTokenSight,
  shuffleArray,
  sortArray
}


/*
* @param {number} ms                        A time in milliseconds.
* @returns {Promise<void>}                  A promise that resolves to a void.
*/
async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/*
* Function to update the sight of a Token. Function takes both a token placeable and a token document, 
* as well as a config object, which can contain all the options for a Token's sight.
* @param {Token/TokenDocument} token        A token or token document.
* @param {object} config                    Configuration changes to the token's sight.
* @param {number} config.angle              degrees of vision, between 1 and 360.
* @param {number} config.attenuation        Attenuation value of sight, between 0 and 1.
* @param {number} config.brightness         Brightness of sight, between -1 and 1.
* @param {string} config.color              Hex value of a color (ie. "#ff0000").
* @param {number} config.contrast           Contrast levels of sight, between -1 and 1.
* @param {boolean} config.enabled           Is sight enabled or disabled (true / false).
* @param {number} config.range              Range of sight in canvas units (feet, meters etc.).
* @param {number} config.saturation         Saturation of sight, between -1 and 1.
* @param {string} config.visionMode         Vision mode, eg. darkvision or monochromatic etc.
* 
* @returns {null/Promise<document>} token   The updated token document.
* 
* @example Change a token's vision to Darkvision with a range of 60ft
* ```js
* await polo.utils.updateTokenSight(token, {visionMode: "darkvision", range: 60});
* ``` 
*/
async function updateTokenSight(token, config={}){
  if(token instanceof Token) token = token.document;
  config = foundry.utils.mergeObject(token.sight, config);
  if(!(config.visionMode in CONFIG.Canvas.visionModes)) {
    ui.notifications.error(`Vision mode: ${config.visionMode}, is not a valid vision mode.`);
    return null;
  }
  await token.update({sight: config});
  await token.updateVisionMode(config.visionMode);
  return token;
}


/*
* Function to shuffle an array and return a new array leaving the original untouched.
* @param {array} original                   The original array.
*
* @returns {array} arr                      The shuffled array.
*/
function shuffleArray(original) {
  let arr = [...original]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function _sortFunction(a,b, lowToHigh){
  if(typeof(a) === "number") {
    if(a>b) return lowToHigh ?  1 : -1;
    else if(a<b) return lowToHigh ? -1 :  1;
    else return 0;
  }
  if(typeof(a) === "string") {
    return lowToHigh ? a.localeCompare(b) : b.localeCompare(a);
  }   
  console.error(`value to sort is not of type String or type Number`);
  return 0; // keeps element in the same spot.
}


/*
* @params {array} original                The original array
* @params {string} key                    String dot notation of the key pointing to the value you want to sort on, if the original array is an array of objects.
* @params {boolean} lowToHigh             Sort direction low to high is the default sort direction, adding lowToHigh: false sorts high to low.
*
* @example
* ```js
* const test = token.actor.itemTypes.weapon;
* const testObj = [{x:5},{x:3},{x:2},{x:6},{x:1},{x:4}];
* const testNumbers = [3,2,4,6,1,5];
* const testString = ["Aardvark", "Zebra", "Elephant", "Orang Utan"];
* 
* const sortedTest = polo.utils.sortArray(test, {key: "system.price.value"}); // result: varies on the input but should be cheap to expensive in DND5e.
* const sortedTestObj =  polo.utils.sortArray(testObj, {key: "x", lowToHigh: false}); // result: [{x:6},{x:5},{x:4},{x:3},{x:2},{x:1}];
* const sortedTestString =  polo.utils.sortArray(testString); // result: ["Aardvark", "Elephant", "Orang Utan", "Zebra"]
* const sortedTestNumbers =  polo.utils.sortArray(testNumbers, {lowToHigh: false}); // result: [6,5,4,3,2,1]
* console.log(sortedTest, sortedTestObj,sortedTestString, sortedTestNumbers)
* ```
*/
function sortArray(original, {key=null, lowToHigh=true}={}){
  let arr = [...original];
  if(key === null) return arr.sort((a,b) => _sortFunction(a,b,lowToHigh));
  else return arr.sort((a,b)=>{
    const x = foundry.utils.getProperty(a, key);
    const y = foundry.utils.getProperty(b, key);
    return _sortFunction(x,y,lowToHigh)
  });
}