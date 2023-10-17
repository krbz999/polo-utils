/**
 * A utility application to pick a sequence of targets.
 */
class SequencePickerModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      links: new fields.NumberField({min: 0, integer: true}),
      sequence: new fields.SetField(new fields.SchemaField({
        x: new fields.NumberField(),
        y: new fields.NumberField()
      }))
    };
  }
}

export class SequencePicker extends Application {
  /**
   * @constructor
   * @param {number} [links=10]           The maximum number of links in the chain.
   * @param {object} [origin]             An originating point of the chain.
   * @param {object[]} [sequence=[]]      An array of points.
   */
  constructor(config = {}) {
    super({});
    this.callback = config.callback ?? (() => {});
    config = foundry.utils.mergeObject({links: 10, sequence: []}, config);
    if ("origin" in config) config.sequence.unshift(config.origin);
    this.model = new SequencePickerModel(config);
  }

  static PLACED_IMG = "icons/sundries/flags/banner-flag-blue.webp";
  static UNPLACED_IMG = "icons/sundries/flags/banner-flag-white-mountain.webp";

  get title() {
    return game.i18n.localize("POLO.SequencePicker");
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      resizeable: false,
      minimizable: false,
      template: "modules/polo-utils/templates/applications/sequence-picker.hbs",
      classes: ["polo-utils-sequence-picker"],
      width: 200
    });
  }

  /** @override */
  async getData() {
    const sequence = new Array(this.model.links).fill({img: this.constructor.UNPLACED_IMG});
    this.model.sequence.map((point, idx) => sequence[idx] = {point: point, img: this.constructor.PLACED_IMG});
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
    html[0].querySelectorAll("[data-idx].active").forEach(n => n.addEventListener("click", this._onClickIdx.bind(this)));
  }

  /**
   * Handle clicking a saved position to remove it.
   * @param {PointerEvent} event      The initiating click event.
   */
  _onClickIdx(event) {
    const sequence = [...this.model.sequence];
    const idx = event.currentTarget.dataset.idx;
    sequence.splice(idx, 1);
    this.model.updateSource({sequence});
    this.render();
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
    const img = this.constructor.PLACED_IMG;
    this.sprites = new Set();
    for (const point of points) {
      const spr = PIXI.Sprite.from(img);
      Object.assign(spr, point);
      spr.anchor.set(0.5);
      spr.height = spr.width = canvas.grid.size;
      const sprite = canvas.effects.addChildAt(spr, point);
      const mask = new PIXI.Graphics()
        .beginFill("WHITE", 1)
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

  /** @override */
  setPosition(pos = {}) {
    pos.height = "auto";
    return super.setPosition(pos);
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
