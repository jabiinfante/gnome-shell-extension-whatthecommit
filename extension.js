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

    this.reactive = true;
    this.can_focus = true;
    this.x_fill =  true;
    this.y_fill = false;
    this.track_hover = true;

    /**
     * Load whatthecommit scheme settings
     */
    this._settings = Convenience.getSettings();

    /**
     * ui
     */
    let _topBox = new St.BoxLayout();
    
    this.gicon = Gio.icon_new_for_string(Me.path + "/icons/git-commit.svg");
    this.gicon_loading = Gio.icon_new_for_string(Me.path + "/icons/git-commit-loading.svg");

    this.icon = new St.Icon({
      gicon: this.gicon,
      style_class: "system-status-icon"
    });
    _topBox.add_child(this.icon);
    this.actor.add_actor(_topBox);

    this.actor.connect(
      "button-press-event",
      Lang.bind(this, this.copyCommitMessage)
    );
  },
  copyCommitMessage: function(e) {

    const _httpSession = new Soup.Session();
    _httpSession.user_agent =
      "gnome-shell-extension whatthecommit.com using libsoup";

    let message = Soup.form_request_new_from_hash("GET", WTC_URL, {});
    this.icon.gicon = this.gicon_loading;

    _httpSession.queue_message(
      message,
      Lang.bind(this, function(_httpSession, message) {
        if (message.status_code == 200) {
          const json = JSON.parse(message.response_body.data);
          const wtc_message = json['commit_message'];
          Clipboard.set_text(St.ClipboardType.CLIPBOARD, this._prepareMessage(wtc_message));
          this.icon.gicon = this.gicon;
          if (this._settings.get_boolean("show-notification-on-message")) {
            Main.notify(wtc_message); 
          }
        } else {
          Main.notify("Connection error... Try again later."); 
        }
      })
    );
  },
  _prepareMessage: function(msg) {
    const include_m = this._settings.get_boolean('include-m');
    let quote = this._settings.get_string('quotes');
    let prefix = '';
    if (include_m) {
      prefix = ' -m';
      if (quote === '') {
        quote = "'";
      }
    }
    
    if (quote === '') {
      return msg;
    }
    msg = msg.replace(quote,"\\" + quote);
    return prefix + quote + msg + quote;
  }
});

function init() {}

function enable() {
  wtc = new Whatthecommit();
  Main.panel.addToStatusArea("Whatthecommit-control", wtc);
}

function disable() {
  wtc.destroy();
}
