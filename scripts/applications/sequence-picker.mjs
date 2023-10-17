/**
 * A utility application to pick a sequence of targets.
 */

class SequencePickerModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      linkDistance: new fields.NumberField({min: 0}),
      links: new fields.NumberField({min: 0, integer: true}),
      maxDistance: new fields.NumberField({min: 0}),
      sequence: new fields.SetField(new fields.SchemaField({
        x: new fields.NumberField(),
        y: new fields.NumberField()
      }))
    };
  }
}

export class SequencePicker extends Dialog {
  /**
   * @constructor
   * @param {number} [linkDistance=60]      The maximum distance between each link in the chain.
   * @param {number} [links=10]             The maximum number of links in the chain.
   * @param {object} [origin]               An originating point of the chain.
   * @param {number} [maxDistance=60]       The maximum distance that any link in the chain is allowed from the origin.
   * @param {object[]} [sequence=[]]        An array of points.
   */
  constructor(config = {}) {
    super({});
    this.callback = config.callback ?? (() => {});
    config = foundry.utils.mergeObject({
      linkDistance: 60,
      links: 10,
      maxDistance: 60,
      sequence: []
    }, config);
    if ("origin" in config) config.sequence.unshift(config.origin);
    this.model = new SequencePickerModel(config);
  }

  get title() {
    return game.i18n.localize("POLO.SequencePicker");
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      resizeable: false,
      minimizable: false,
      template: "modules/polo-utils/templates/applications/sequence-picker.hbs",
      classes: ["sequence-picker"],
      width: 200
    });
  }

  /** @override */
  async getData() {
    const unplaced = "icons/sundries/flags/banner-flag-white-mountain.webp";
    const placed = "icons/sundries/flags/banner-flag-blue.webp";

    const sequence = new Array(this.model.links).fill({img: unplaced});
    this.model.sequence.map((point, idx) => sequence[idx] = {point: point, img: placed});

    const links = [...this.model.sequence];
    const canAdd = links.length < this.model.links;

    return {sequence, canAdd};
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.listener) {
      const listener = this._onClickCanvas.bind(this);
      canvas.app.stage.addEventListener("click", listener);
      this.listener = listener;
    }
    html[0].querySelector("[data-action='submit']").addEventListener("click", this.submit.bind(this));
  }

  /** Handle click events on the canvas. */
  _onClickCanvas() {
    let {x, y} = canvas.mousePosition;
    x = x.toNearest(0.5);
    y = y.toNearest(0.5);
    const sequence = [...this.model.sequence, {x, y}].slice(0, this.model.links);
    this.model.updateSource({sequence: sequence});
    this.render();
  }

  /**
   * Handle clicking the finalize button.
   * @param {PointerEvent} event      The initiating click event.
   */
  submit(event) {
    this.callback(this.model.sequence);
    this.close();
  }

  /** Destroy sprites. */
  _destroySprites() {
    const sprites = this.sprites ?? new Set();
    for (const sprite of sprites) {
      sprite.destroy();
      sprites.delete(sprite);
    }
  }

  /** @override */
  async render(...args) {
    this._destroySprites();
    const points = this.model.sequence;
    const img = "icons/sundries/flags/banner-flag-blue.webp";
    this.sprites = new Set();
    for (const point of points) {
      const spr = PIXI.Sprite.from(img, {scale: 0.5});
      Object.assign(spr, point);
      spr.anchor.set(0.5);
      spr.height = spr.width = canvas.grid.size;
      const sprite = canvas.effects.addChildAt(spr, point);
      const mask = new PIXI.Graphics()
        .beginFill("WHITE",1)
        .drawCircle(0, 0, 0.5 * sprite.texture.baseTexture.width)
        .endFill();
      sprite.addChild(mask);
      sprite.mask = mask;
      this.sprites.add(sprite);
    }
    return super.render(...args);
  }

  /** @override */
  async close(...args) {
    canvas.app.stage.removeEventListener("click", this.listener);
    this._destroySprites();
    this.callback(null);
    return super.close(...args);
  }

  /**
   * Create an instance of this application and wait for the callback.
   * @returns {Promise<object|null>}      An object of points, or null if closed.
   */
  static async create(config) {
    return new Promise(resolve => {
      new SequencePicker({...config, callback: resolve}).render(true);
    });
  }
}
