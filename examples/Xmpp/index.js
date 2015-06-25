

connector = new Y.XMPP().join("xml-xmpp-example", {syncMode: "syncAll"});
connector.debug = true;

y = new Y(connector);

window.onload = function(){

  connector.whenSynced(function(){
    if(y.val("dom") == null){
      // check if dom was already assigned
      window.shared_div = document.querySelector("#shared_div");
      y.val("dom", new Y.Xml.Element(window.shared_div));
    }

    var p = document.createElement("b")
    shared_div.insertBefore(p,null)
  })
  y.observe(function(events){
    for(i in events){
      if(events[i].type === "add" || events[i].type === "update"){
        // Everytime the "dom" is replaced, remove the old one from the body and but the new one there instead
        document.querySelector("#shared_div").remove();
        window.shared_div = y.val("dom").getDom();
        var body = document.querySelector("body");
        body.insertBefore(window.shared_div, body.firstChild);
      }
    }

  })
};
