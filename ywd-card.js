import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class YWDCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static getConfigElement() {
    return document.createElement("ywd-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      name_template: "",
      icon_template: "",
      icon_color_template: "",
      bg_color_template: "",
      state_template: "",
      secondary_template: "",
      badge_icon_template: "",
      badge_color_template: "",
      tap_action: { action: "more-info" },
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Please define an entity");
    this.config = {
      tap_action: { action: "more-info" },
      ...config,
    };
  }

  _evalTemplate(templateStr, stateObj) {
    if (!templateStr || templateStr.trim() === "") return null;
    const t = templateStr.trim();

    if (t.includes("return ")) {
      try {
        const func = new Function("states", "entity", "hass", t);
        return func(this.hass.states, stateObj, this.hass);
      } catch (e) {
        return "Error";
      }
    }

    if (t.includes("${")) {
      try {
        const func = new Function(
          "states",
          "entity",
          "hass",
          `return \`${t}\`;`
        );
        return func(this.hass.states, stateObj, this.hass);
      } catch (e) {
        return "Error";
      }
    }

    return t;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const entityId = this.config.entity;
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html`<ha-card>Entity not found</ha-card>`;

    const nameStr =
      this._evalTemplate(this.config.name_template, stateObj) ||
      stateObj.attributes.friendly_name ||
      entityId.split(".")[1];

    const stateStr =
      this._evalTemplate(this.config.state_template, stateObj) ||
      stateObj.state;

    const secondaryStr =
      this._evalTemplate(this.config.secondary_template, stateObj) || "";

    const customIcon = this._evalTemplate(this.config.icon_template, stateObj);

    const iconColor =
      this._evalTemplate(this.config.icon_color_template, stateObj) ||
      "#9ca3af";

    const bgColor =
      this._evalTemplate(this.config.bg_color_template, stateObj) ||
      "rgba(156, 163, 175, 0.15)";

    const badgeIcon = this._evalTemplate(
      this.config.badge_icon_template,
      stateObj
    );

    const badgeColor =
      this._evalTemplate(this.config.badge_color_template, stateObj) ||
      "#f97316";

    return html`
      <ha-card @click="${this._handleTap}">
        <div class="container">
          <div class="icon-cell" style="background-color: ${bgColor}">
            ${customIcon
              ? html`<ha-icon
                  icon="${customIcon}"
                  style="color: ${iconColor}"
                ></ha-icon>`
              : html`<ha-state-icon
                  .hass=${this.hass}
                  .stateObj=${stateObj}
                  style="color: ${iconColor}"
                ></ha-state-icon>`}
            ${badgeIcon
              ? html`
                  <div class="badge" style="background-color: ${badgeColor}">
                    <ha-icon icon="${badgeIcon}"></ha-icon>
                  </div>
                `
              : ""}
          </div>

          <div class="name" .innerHTML="${nameStr}"></div>

          <div class="state-container">
            <div class="primary-state" .innerHTML="${stateStr}"></div>
            ${secondaryStr
              ? html`
                  <div class="secondary-state" .innerHTML="${secondaryStr}"></div>
                `
              : ""}
          </div>
        </div>
      </ha-card>
    `;
  }

  _handleTap() {
    const config = {
      ...this.config,
      tap_action: this.config.tap_action || { action: "more-info" },
    };

    const event = new CustomEvent("hass-action", {
      bubbles: true,
      composed: true,
      detail: {
        config,
        action: "tap",
      },
    });

    this.dispatchEvent(event);
  }

  static get styles() {
    return css`
      ha-card {
        background-color: var(--ha-card-background, var(--card-background-color));
        border-radius: 20px;
        padding: 16px;
        cursor: pointer;
        min-height: 112px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: visible;
      }

      .container {
        display: grid;
        grid-template-areas: "i n" "i s";
        grid-template-columns: 56px 1fr;
        grid-template-rows: max-content max-content;
        align-content: center;
        column-gap: 12px;
        width: 100%;
      }

      .icon-cell {
        grid-area: i;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        position: relative;
      }

      ha-icon,
      ha-state-icon {
        --mdc-icon-size: 28px;
      }

      .name {
        grid-area: n;
        justify-self: start;
        align-self: end;
        font-size: 10px;
        font-weight: 600;
        color: #9ca3af;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 2px;
        text-align: left;
      }

      .state-container {
        grid-area: s;
        justify-self: start;
        align-self: start;
        text-align: left;
      }

      .primary-state {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        line-height: 1.25;
      }

      .secondary-state {
        font-size: 13px;
        font-weight: 500;
        color: #9ca3af;
        margin-top: 2px;
      }

      .badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 3px var(--ha-card-background, var(--card-background-color));
      }

      .badge ha-icon {
        --mdc-icon-size: 12px;
        color: #ffffff;
      }
    `;
  }
}

class YWDCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      _showAdvancedTapYaml: { type: Boolean },
    };
  }

  setConfig(config) {
    this._config = {
      tap_action: { action: "more-info" },
      ...config,
    };
    this._showAdvancedTapYaml = false;
  }

  configChanged(key, value) {
    const event = new CustomEvent("config-changed", {
      bubbles: true,
      composed: true,
      detail: {
        config: {
          ...this._config,
          [key]: value,
        },
      },
    });
    this.dispatchEvent(event);
  }

  _tapAction() {
    return this._config.tap_action || { action: "more-info" };
  }

  _updateTapAction(key, value) {
    const tapAction = {
      ...this._tapAction(),
      [key]: value,
    };

    if (key === "action") {
      const action = value;

      if (action === "more-info" || action === "toggle" || action === "none") {
        delete tapAction.navigation_path;
        delete tapAction.url_path;
        delete tapAction.service;
        delete tapAction.target;
        delete tapAction.data;
        delete tapAction.confirmation;
      }

      if (action === "navigate") {
        delete tapAction.url_path;
        delete tapAction.service;
        delete tapAction.target;
        delete tapAction.data;
      }

      if (action === "url") {
        delete tapAction.navigation_path;
        delete tapAction.service;
        delete tapAction.target;
        delete tapAction.data;
      }

      if (action === "call-service") {
        delete tapAction.navigation_path;
        delete tapAction.url_path;
      }
    }

    this.configChanged("tap_action", tapAction);
  }

  _updateTapTargetEntity(value) {
    const tapAction = {
      ...this._tapAction(),
      target: {
        ...(this._tapAction().target || {}),
        entity_id: value,
      },
    };
    this.configChanged("tap_action", tapAction);
  }

  _updateTapData(value) {
    let parsed = value;
    try {
      parsed = value ? JSON.parse(value) : {};
    } catch (e) {
      parsed = value;
    }

    const tapAction = {
      ...this._tapAction(),
      data: parsed,
    };
    this.configChanged("tap_action", tapAction);
  }

  _updateTapConfirmation(value) {
    const tapAction = {
      ...this._tapAction(),
      confirmation: value ? { text: value } : undefined,
    };

    if (!value) {
      delete tapAction.confirmation;
    }

    this.configChanged("tap_action", tapAction);
  }

  _renderTemplateField(label, key, placeholder, tip) {
    return html`
      <div class="field-block">
        <ha-textarea
          .label=${label}
          .value=${this._config[key] || ""}
          .placeholder=${placeholder}
          @input=${(ev) => this.configChanged(key, ev.target.value)}
        ></ha-textarea>
        <div class="tip">${tip}</div>
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const tapAction = this._tapAction();
    const actionType = tapAction.action || "more-info";

    return html`
      <div class="schema-editor">
        <div class="section">
          <h3>Entity</h3>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.entity || ""}
            .label=${"Entity"}
            @value-changed=${(ev) =>
              this.configChanged("entity", ev.detail?.value ?? ev.target.value)}
          ></ha-entity-picker>
          <div class="tip">
            Pick the main entity this card represents. Its state and icon can be
            used in your templates.
          </div>
        </div>

        <div class="section">
          <h3>Visual Templates</h3>

          ${this._renderTemplateField(
            "Name Template",
            "name_template",
            "${entity.attributes.friendly_name}",
            "You can enter plain text, JavaScript template strings, or a small JS return statement. Example: ${entity.attributes.friendly_name?.toUpperCase()}"
          )}

          ${this._renderTemplateField(
            "Primary State",
            "state_template",
            "${entity.state === 'on' ? 'On' : 'Off'}",
            "Main large text. Example: ${entity.state === 'home' ? 'At Home' : 'Away'}"
          )}

          ${this._renderTemplateField(
            "Secondary State",
            "secondary_template",
            "${entity.attributes.brightness ? `Brightness ${entity.attributes.brightness}` : ''}",
            "Smaller text under the main state. Good for temperature, battery, room, last updated, etc."
          )}

          ${this._renderTemplateField(
            "Icon Override",
            "icon_template",
            "mdi:lightbulb",
            "Leave blank to use the entity's normal icon. Example: ${entity.state === 'on' ? 'mdi:lightbulb-on' : 'mdi:lightbulb'}"
          )}

          ${this._renderTemplateField(
            "Icon Color",
            "icon_color_template",
            "${entity.state === 'on' ? '#f59e0b' : '#9ca3af'}",
            "Any valid CSS color. Hex, rgb(), rgba(), hsl() all work."
          )}

          ${this._renderTemplateField(
            "Background Color",
            "bg_color_template",
            "${entity.state === 'on' ? 'rgba(245,158,11,0.18)' : 'rgba(156,163,175,0.15)'}",
            "Background behind the round icon area."
          )}

          ${this._renderTemplateField(
            "Badge Icon",
            "badge_icon_template",
            "mdi:power",
            "Optional small badge icon. Good for alerts, battery, mode, charging, lock, etc."
          )}

          ${this._renderTemplateField(
            "Badge Color",
            "badge_color_template",
            "#f97316",
            "Background color of the small badge."
          )}
        </div>

        <div class="section">
          <h3>Tap Action</h3>

          <div class="field-block">
            <label class="select-label" for="tap-action-select">Action</label>
            <select
              id="tap-action-select"
              class="native-select"
              .value=${actionType}
              @change=${(ev) => this._updateTapAction("action", ev.target.value)}
            >
              <option value="more-info">More info</option>
              <option value="toggle">Toggle</option>
              <option value="navigate">Navigate</option>
              <option value="url">Open URL</option>
              <option value="call-service">Call service</option>
              <option value="none">Do nothing</option>
            </select>
            <div class="tip">
              Use this instead of editing YAML by hand for most cases.
            </div>
          </div>

          ${actionType === "navigate"
            ? html`
                <div class="field-block">
                  <ha-textfield
                    label="Navigation Path"
                    .value=${tapAction.navigation_path || ""}
                    .placeholder=${"/dashboard-mobile/lounge"}
                    @input=${(ev) =>
                      this._updateTapAction(
                        "navigation_path",
                        ev.target.value
                      )}
                  ></ha-textfield>
                  <div class="tip">
                    Example: <code>/dashboard-name/room</code> or
                    <code>/lovelace/home</code>
                  </div>
                </div>
              `
            : ""}

          ${actionType === "url"
            ? html`
                <div class="field-block">
                  <ha-textfield
                    label="URL"
                    .value=${tapAction.url_path || ""}
                    .placeholder=${"https://www.home-assistant.io/"}
                    @input=${(ev) =>
                      this._updateTapAction("url_path", ev.target.value)}
                  ></ha-textfield>
                  <div class="tip">
                    External or internal URL. Example:
                    <code>https://...</code>
                  </div>
                </div>
              `
            : ""}

          ${actionType === "call-service"
            ? html`
                <div class="field-block">
                  <ha-textfield
                    label="Service"
                    .value=${tapAction.service || ""}
                    .placeholder=${"light.toggle"}
                    @input=${(ev) =>
                      this._updateTapAction("service", ev.target.value)}
                  ></ha-textfield>
                  <div class="tip">
                    Example: <code>light.toggle</code>,
                    <code>script.turn_on</code>,
                    <code>scene.turn_on</code>
                  </div>
                </div>

                <div class="field-block">
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${tapAction.target?.entity_id || ""}
                    .label=${"Target Entity (optional)"}
                    @value-changed=${(ev) =>
                      this._updateTapTargetEntity(
                        ev.detail?.value ?? ev.target.value
                      )}
                  ></ha-entity-picker>
                  <div class="tip">
                    Optional. Useful when calling a service on a specific entity.
                  </div>
                </div>

                <div class="field-block">
                  <ha-textarea
                    label="Service Data (optional JSON)"
                    .value=${typeof tapAction.data === "string"
                      ? tapAction.data
                      : JSON.stringify(tapAction.data || {}, null, 2)}
                    .placeholder=${'{\n  "brightness_pct": 50\n}'}
                    @input=${(ev) => this._updateTapData(ev.target.value)}
                  ></ha-textarea>
                  <div class="tip">
                    Enter JSON only here. Example:
                    <code>{"brightness_pct": 50}</code>
                  </div>
                </div>

                <div class="field-block">
                  <ha-textfield
                    label="Confirmation Text (optional)"
                    .value=${tapAction.confirmation?.text || ""}
                    .placeholder=${"Are you sure?"}
                    @input=${(ev) =>
                      this._updateTapConfirmation(ev.target.value)}
                  ></ha-textfield>
                  <div class="tip">
                    Adds a confirmation popup before the service runs.
                  </div>
                </div>
              `
            : ""}

          <div class="advanced-toggle">
            <button
              type="button"
              class="toggle-btn"
              @click=${() =>
                (this._showAdvancedTapYaml = !this._showAdvancedTapYaml)}
            >
              ${this._showAdvancedTapYaml
                ? "Hide advanced tap action YAML"
                : "Show advanced tap action YAML"}
            </button>
          </div>

          ${this._showAdvancedTapYaml
            ? html`
                <div class="field-block advanced-box">
                  <ha-yaml-editor
                    .defaultValue=${tapAction}
                    @value-changed=${(ev) =>
                      this.configChanged("tap_action", ev.detail.value)}
                  ></ha-yaml-editor>
                  <div class="tip">
                    Advanced mode. Use this only if you need something the guided
                    editor does not expose.
                  </div>
                </div>
              `
            : ""}
        </div>

        <div class="section help-section">
          <h3>Template Help</h3>
          <div class="help-box">
            <div><strong>Plain text:</strong> Lounge</div>
            <div><strong>Template string:</strong> <code>${"${entity.state}"}</code></div>
            <div><strong>JS return:</strong> <code>return entity.state === 'on' ? 'On' : 'Off';</code></div>
            <div><strong>Available objects:</strong> <code>entity</code>, <code>states</code>, <code>hass</code></div>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .schema-editor {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 30px;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
      }

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .field-block {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .tip {
        font-size: 12px;
        line-height: 1.45;
        color: var(--secondary-text-color);
      }

      .tip code,
      .help-box code {
        font-family: monospace;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.06);
        padding: 1px 5px;
        border-radius: 6px;
      }

      ha-textarea,
      ha-textfield {
        font-family: monospace;
      }

      .native-select {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font: inherit;
      }

      .select-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .advanced-toggle {
        margin-top: 4px;
      }

      .toggle-btn {
        appearance: none;
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--primary-text-color);
        border-radius: 10px;
        padding: 10px 12px;
        cursor: pointer;
        font: inherit;
      }

      .toggle-btn:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .advanced-box {
        padding-top: 4px;
      }

      .help-section .help-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
    `;
  }
}

customElements.define("ywd-card", YWDCard);
customElements.define("ywd-card-editor", YWDCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ywd-card",
  name: "YWD Custom Card",
  preview: true,
  description: "The full, feature-locked YWD card suite.",
});