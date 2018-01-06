const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const WhatthecommitSettings = new GObject.Class({
  Name: "Whatthecommit-Settings",
  Extends: Gtk.Grid,

  _init: function(params) {
    this.parent(params);
    this.set_orientation(Gtk.Orientation.VERTICAL);
    this.set_row_spacing(10);
    this.margin = 20;

    this._settings = Convenience.getSettings();
    this._settings.connect("changed", Lang.bind(this, this._loadSettings));
    
    let showIconLabel = new Gtk.Label({
      label: "Show message on notification: ",
      xalign: 0,
      hexpand: true
    });

    this._showIconCheckbox = new Gtk.Switch();
    this._showIconCheckbox.connect(
      "notify::active",
      Lang.bind(this, function(button) {
        this._settings.set_boolean("show-notification-on-message", button.active);
      })
    );

    this.attach(showIconLabel, 1, 1, 1, 1);
    this.attach_next_to(this._showIconCheckbox, showIconLabel, 1, 1, 1);

    this._loadSettings();
  },
  _loadSettings: function() {
    this._showIconCheckbox.set_active(this._settings.get_boolean("show-notification-on-message"));
  }
});

function init() {}

function buildPrefsWidget() {
  let widget = new WhatthecommitSettings();
  widget.show_all();
  return widget;
}
