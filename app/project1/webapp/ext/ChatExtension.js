sap.ui.define(["sap/ui/core/Fragment", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  function (Fragment, JSONModel, MessageToast) {
    "use strict";

    let dialog = null;
    let messages = [];
    const DIALOG_ID = "globalChatDialog";

    return {

      onOpenChat: function () {
        if (!dialog) {
          Fragment.load({
            id: DIALOG_ID,
            name: "project1.ext.ChatDialog",
            controller: this
          }).then(function (oDialog) {
            dialog = oDialog;
            dialog.setModel(new JSONModel({ messages: messages }), "chat");
            dialog.open();
          }).catch(function (err) {
            console.error("Failed to load ChatDialog fragment:", err);
            MessageToast.show("Could not open chat: " + err.message);
          });
        } else {
          dialog.open();
        }
      },

      onCloseChat: function () {
        if (dialog) {
          dialog.close();
        }
      },

      onSend: async function () {
        console.log("onSend fired");

        let input;
        try {
          input = Fragment.byId(DIALOG_ID, "chatInput");
        } catch (e) {
          console.error("Fragment.byId failed:", e);
          MessageToast.show("Internal error: chat input not found");
          return;
        }

        if (!input) {
          console.error("chatInput control not found via Fragment.byId");
          MessageToast.show("Internal error: chat input not found");
          return;
        }

        const message = input.getValue();
        if (!message) {
          return;
        }
        input.setValue("");

        messages.push({ role: "user", content: message });
        dialog.getModel("chat").setProperty("/messages", messages.slice());

        try {
          console.log("Sending to /odata/v4/chat/chat:", message);

          const response = await fetch("/odata/v4/chat/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message, history: JSON.stringify(messages) })
          });

          console.log("Response status:", response.status);

          const result = await response.json();
          console.log("Response body:", result);

          if (!response.ok) {
            throw new Error(result.error?.message || "Request failed with status " + response.status);
          }

          messages.push({ role: "assistant", content: result.value || JSON.stringify(result) });
        } catch (e) {
          console.error("Chat request failed:", e);
          MessageToast.show("Chat request failed: " + e.message);
          messages.push({ role: "assistant", content: "Error: " + e.message });
        }

        dialog.getModel("chat").setProperty("/messages", messages.slice());
      }

    };
  });