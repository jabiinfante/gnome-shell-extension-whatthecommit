const Lang = imports.lang;
const St = imports.gi.St;
const Clipboard = St.Clipboard.get_default();

const Main = imports.ui.main;
const Soup = imports.gi.Soup;

const Gio = imports.gi.Gio;

const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Convenience = Me.imports.convenience;
const WTC_URL = "https://whatthecommit.com/index.json";
let wtc;

const Whatthecommit = new Lang.Class({
  Name: "Whatthecommit",
  Extends: PanelMenu.Button,

  _init: function() {
    this.parent(0, "Whatthecommit");

    /**
     * Load whatthecommit scheme settings
     */
    this._settings = Convenience.getSettings();
    this._settings.connect(
      "changed",
      Lang.bind(this, this._loadExtensionSettings)
    );

    /**
     * ui
     */
    let _topBox = new St.BoxLayout();
    let gicon = Gio.icon_new_for_string("media-view-subtitles-symbolic");
    this.icon = new St.Icon({
      gicon: gicon,
      style_class: "system-status-icon"
    });
    _topBox.add_child(this.icon);
    this.txt = new St.Label({
      style_class: "badge",
      y_align: Clutter.ActorAlign.CENTER
    });
    _topBox.add_child(this.txt);
    this.actor.add_actor(_topBox);

    this.actor.connect(
      "button-press-event",
      Lang.bind(this, this.copyCommitMessage)
    );
  },
  copyCommitMessage: function() {
    let _httpSession = new Soup.Session();
    _httpSession.user_agent =
      "gnome-shell-extension whatthecommit.com using libsoup";

    let message = Soup.form_request_new_from_hash("GET", WTC_URL, {});

    _httpSession.queue_message(
      message,
      Lang.bind(this, function(_httpSession, message) {
        if (message.status_code == 200) {
          const json = JSON.parse(message.response_body.data);
          const wtc_message = json['commit_message'];
          Clipboard.set_text(St.ClipboardType.CLIPBOARD, wtc_message);
          
        } else {
          state = { temp: "-/-", from: "Connection error..." };
          log(state);
        }
      })
    );
  },
  _loadExtensionSettings: function() {}
});

function init() {}

function enable() {
  wtc = new Whatthecommit();
  Main.panel.addToStatusArea("Whatthecommit-control", wtc);
}

function disable() {
  wtc.destroy();
}
