export {
    wait,
    updateTokenSight,
    shuffleArray
}


/*
* @param {number} ms	 	 			 A time in milliseconds.
* @returns {Promise<void>}        		 A promise that resolves to a void.
*/
async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/*
* Function to update the sight of a Token. Function takes both a token placeable and a token document, 
* as well as a config object, which can contain all the options for a Token's sight.
* @param {Token/TokenDocument} token    A token or token document.
* @param {object} config                Configuration changes to the token's sight.
* @param {number} config.angle          degrees of vision, between 1 and 360.
* @param {number} config.attenuation    Attenuation value of sight, between 0 and 1.
* @param {number} config.brightness     Brightness of sight, between -1 and 1.
* @param {string} config.color          Hex value of a color (ie. "#ff0000").
* @param {number} config.contrast       Contrast levels of sight, between -1 and 1.
* @param {boolean} config.enabled       Is sight enabled or disabled (true / false).
* @param {number} config.range          Range of sight in canvas units (feet, meters etc.).
* @param {number} config.saturation     Saturation of sight, between -1 and 1.
* @param {string} config.visionMode     Vision mode, eg. darkvision or monochromatic etc.
* 
* @returns {Promise<document>} token    The updated token document.
* 
* @example Change a token's vision to Darkvision with a range of 60ft
* ```js
* await polo.utils.updateTokenSight(token, {visionMode: "darkvision", range: 60});
* ``` 
*/
async function updateTokenSight(token, config={}){
    if(token instanceof Token) token = token.document;
    config = foundry.utils.mergeObject(token.sight, config);
    if(!(config.visionMode in CONFIG.Canvas.visionModes)) return ui.notifications.error(`Vision mode: ${config.visionMode}, is not a valid vision mode.`)
    await token.update({sight: config});
    await token.updateVisionMode(config.visionMode);
    return token;
}


/*
* Function to shuffle an array and return a new array leaving the original untouched.
* @param {array} original               The original array.
*
* @returns {array} arr                  The shuffled array.
*/
function shuffleArray(original) {
    let arr = JSON.parse(JSON.stringify(orignal))
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}