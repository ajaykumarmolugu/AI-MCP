sap.ui.define(["sap/ui/core/mvc/ControllerExtension", "sap/m/MessageToast", "sap/ui/model/json/JSONModel"],
  function (ControllerExtension, MessageToast, JSONModel) {
    "use strict";
    return ControllerExtension.extend("project1.ext.ChatExtension", {
      onInit: function () {
        this._messages = [];
      },
      onOpenChat: function () {
        if (!this._dialog) {
          this._dialog = sap.ui.xmlfragment("project1.ext.ChatDialog", this);
          this.getView().addDependent(this._dialog);
          this._dialog.setModel(new JSONModel({ messages: this._messages }), "chat");
        }
        this._dialog.open();
      },
      onCloseChat: function () {
        this._dialog.close();
      },
      onSend: async function () {
        const dialog = this._dialog;
        const input = sap.ui.core.Fragment.byId("project1.ext.ChatDialog", "chatInput");
        const message = input.getValue();
        if (!message) return;
        input.setValue("");

        this._messages.push({ role: "user", content: message });
        this._refreshModel();

        try {
          const result = await fetch("/odata/v4/chat/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history: JSON.stringify(this._messages) })
          }).then(r => r.json());

          this._messages.push({ role: "assistant", content: result.value || JSON.stringify(result) });
        } catch (e) {
          MessageToast.show("Chat request failed: " + e.message);
        }
        this._refreshModel();
      },
      _refreshModel: function () {
        this._dialog.getModel("chat").setProperty("/messages", this._messages);
      }
    });
  });