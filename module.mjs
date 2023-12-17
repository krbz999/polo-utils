import * as utils from "./scripts/utils.mjs";
export const MODULE_ID = "polo-utils";


Hooks.once("ready", () => {
  game.modules.get(MODULE_ID).utils = utils;
  globalThis.polo = game.modules.get(MODULE_ID);
});
