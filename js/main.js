//utile
//var node = myDiagram.model.findNodeDataForKey($var);
//myDiagram.model.set(node,'color','yellow')

function changeTiming() {
  timing = parseInt($("#timing").val());
}

function add() {
  var nomTache = $("#nomTache").val().toUpperCase();
  var dureeTache = $("#dureeTache").val();

  if (chercher(nomTache) == -1) {
    var temp = new Noeud(nomTache, parseInt(dureeTache));
    data.push(temp);

    var TacheZone =
      "<td class='neon-green-text' id='TZ-" +
      nomTache +
      "'>" +
      nomTache +
      " <a onclick=\"supprimer('" +
      nomTache +
      "')\"><i class='mdi mdi-delete neon-red-text-animation'></i></a></td>";
    var DureeZone =
      "<td class='neon-green-text' id='DZ-" +
      nomTache +
      "'><span id='DZ-" +
      nomTache +
      "-real'> " +
      dureeTache +
      "  </span><a onclick=\"clickEditDureeTache('" +
      nomTache +
      "')\"><i class='mdi mdi-pencil neon-green-text-animation'></i></a></td>";
    var TacheAntZone =
      "<td id='TAZ-" +
      nomTache +
      "'><a onclick=\"clickAddAnteriorTache('" +
      nomTache +
      "')\"><i class='mdi mdi-plus neon-green-text-animation'></i></a></td>";
    var TacheSucZone = "<td id='TSZ-" + nomTache + "'></td>";

    myDiagram.model.addNodeData({ key: nomTache });

    $("#TacheZone").append(TacheZone);
    $("#DureeZone").append(DureeZone);
    $("#TacheAntZone").append(TacheAntZone);
    $("#TacheSucZone").append(TacheSucZone);

    $("#errorAlert").hide();
    $("#addModal").modal("hide");

    $("#nomTache").val("");
    $("#dureeTache").val("");
    $("#tacheErrorTextZone").text("");
  } else {
    $("#tacheErrorTextZone").text("Erreur!  Tâche déjà existante.");
  }
}

/*
 *find one by key, retrun index or -1 if not find
 */
function chercher($text) {
  for (var i in data) {
    if (data[i].key == $text) return i;
  }
  return -1;
}

function supprimer($var) {
  var indice = chercher($var);
  if (indice != -1) {
    //suppresion des données dans le tableau générale

    for (var i in data) {
      //suppression dans tous les next
      for (var j in data[i].next) {
        if (data[i].next[j] != undefined) {
          if (data[i].next[j].key == $var) {
            $("#TSZ-" + data[i].key + "-" + data[i].next[j].key).remove();
            data[i].next.splice(j, 1);
          }
        }
      }

      //supprssion dans tous previous
      for (var k in data[i].previous) {
        if (data[i].previous[k] != undefined) {
          if (data[i].previous[k].key == $var) {
            $("#TAZ-" + data[i].previous[k].key + "-" + data[i].key).remove();
            data[i].previous.splice(k, 1);
          }
        }
      }
    }

    data.splice(indice, 1);

    //suppresion des element dans le tableau,
    $("#TZ-" + $var).remove();
    $("#DZ-" + $var).remove();
    $("#TAZ-" + $var).remove();
    $("#TSZ-" + $var).remove();

    //suppresion des données dans la zone de diagramme

    var tempLink = [];
    for (var i in myDiagram.model.linkDataArray) {
      if (
        myDiagram.model.linkDataArray[i].from == $var ||
        myDiagram.model.linkDataArray[i].to == $var
      ) {
        tempLink.push(myDiagram.model.linkDataArray[i]);
      }
    }

    for (var i in tempLink) {
      myDiagram.model.removeLinkData(tempLink[i]);
    }

    var node = myDiagram.model.findNodeDataForKey($var);
    myDiagram.model.removeNodeData(node);
  }
}

function clickEditDureeTache($var) {
  lastAction = $var;
  $("#nomTacheEdit").text($var);
  $("#dureeModal").modal("show");
}

function editDureeTache() {
  $("#dureeModal").modal("hide");

  var keyTache = lastAction;
  var duree = parseInt($("#editDuree").val());

  var tache = data[chercher(keyTache)];
  tache.duree = duree;

  $("#DZ-" + keyTache + "-real").text(duree);
  var temp = null;
  ç;
  for (var i in myDiagram.model.linkDataArray) {
    if (myDiagram.model.linkDataArray[i].from == keyTache) {
      temp = myDiagram.model.linkDataArray[i];
      myDiagram.model.set(temp, "text", duree);
    }
  }
}

function clickAddAnteriorTache($var) {
  lastAction = $var;
  $("#AnteriorTache").text($var);
  $("#LinkModal").modal("show");
}

function addAnteriorTache() {
  //recheche de la tache source
  var keyTacheSource = $("#nomTacheAnt").val().toUpperCase();
  var indiceSource = chercher(keyTacheSource);

  // si source trouvé
  if (indiceSource != -1) {
    // la tache source en question
    var tacheSource = data[indiceSource];
    //recherche de destination
    var keyTacheDestination = lastAction;
    var indiceDestination = chercher(keyTacheDestination);

    //la tache destination
    var tacheDestination = data[indiceDestination];

    if (keyTacheSource != keyTacheDestination) {
      var trouve = false;

      for (var i in myDiagram.model.linkDataArray) {
        if (
          (myDiagram.model.linkDataArray[i].from == keyTacheSource &&
            myDiagram.model.linkDataArray[i].to == keyTacheDestination) ||
          (myDiagram.model.linkDataArray[i].from == keyTacheDestination &&
            myDiagram.model.linkDataArray[i].to == keyTacheSource)
        ) {
          trouve = true;
        }
      }

      if (!trouve) {
        //ajout de la tache destination dans le next de la source
        data[indiceSource].next.push(
          new Petit(tacheDestination.key, tacheDestination.duree)
        );

        //ajout de la tache source dans le previous de la destination
        data[indiceDestination].previous.push(
          new Petit(tacheSource.key, tacheSource.duree)
        );

        //ajout des text dans le tableau
        var TAntText =
          "<span id='TAZ-" +
          keyTacheDestination +
          "-" +
          keyTacheSource +
          "'> , " +
          keyTacheSource +
          " <a onclick='removeAnteriorTache(\"" +
          keyTacheSource +
          '","' +
          keyTacheDestination +
          "\")'> <i class='mdi mdi-delete neon-red-text-animation'></i></a>  </span>";
        var TSucText =
          "<span id='TSZ-" +
          keyTacheSource +
          "-" +
          keyTacheDestination +
          "'  class='neon-green-text'> " +
          keyTacheDestination +
          " - </span>";

        //ajout de la tache anterieur dans le tableau
        $("#TAZ-" + keyTacheDestination).append(TAntText);

        //ajout de la tache successeur dans le tableau
        $("#TSZ-" + keyTacheSource).append(TSucText);

        //ajout de la flèche sur le diagramme , *** a ajouter duree de la source si trouvé
        myDiagram.model.addLinkData({
          from: keyTacheSource,
          to: keyTacheDestination,
          text: tacheSource.duree,
        });

        //fermeture du modal et reninitialisation de l'input
        $("#LinkModal").modal("hide");
        $("#nomTacheAnt").val("");
        $("#linkErrorTextZone").text("");
      } else {
        $("#linkErrorTextZone").text(
          "Erreur!  Liens déjà existant ou contradictoire."
        );
      }
    } else {
      $("#linkErrorTextZone").text(
        "Erreur!  Vous êtes en train de lier la même tâche."
      );
    }
  } else {
    $("#linkErrorTextZone").text("Erreur!  Tâche non existante.");
  }
}

function removeAnteriorTache(keyTacheSource, keyTacheDestination) {
  var indiceSource = chercher(keyTacheSource);
  var indiceDestination = chercher(keyTacheDestination);

  for (var i in data[indiceSource].next) {
    if (data[indiceSource].next[i].key == keyTacheDestination) {
      data[indiceSource].next.splice(i, 1);
    }
  }

  for (var k in data[indiceDestination].previous) {
    if (
      data[indiceDestination].previous[k] != undefined &&
      data[indiceDestination].previous[k] == keyTacheSource
    ) {
      data[indiceDestination].previous.splice(k, 1);
    }
  }

  for (var i in myDiagram.model.linkDataArray) {
    if (
      myDiagram.model.linkDataArray[i].from == keyTacheSource &&
      myDiagram.model.linkDataArray[i].to == keyTacheDestination
    ) {
      var temp = myDiagram.model.linkDataArray[i];
      myDiagram.model.removeLinkData(temp);
    }
  }

  $("#TSZ-" + keyTacheSource + "-" + keyTacheDestination).remove();
  $("#TAZ-" + keyTacheDestination + "-" + keyTacheSource).remove();
}

function play() {
  console.log(data);
  $("#infoTextZone").text("Calcul en cours");
  $("#errorTextZone").text("");

  if (data.length >= 3) {
    //chercher les debuts
    findDEB();
  } else {
    $("#errorTextZone").text("Pas de calcul à faire");
    $("#infoTextZone").text("");
  }
}

function findDEB() {
  var aVerifier = [];
  var indiceDebut = chercher("DEB");
  //mettre debut = true pour tout les debuts
  for (var i in data) {
    if (
      data[i].previous.length == 0 &&
      data[i].key != "DEB" &&
      data[i].key != "FIN"
    ) {
      aVerifier.push(i);
    }
  }

  var compteur = 0;
  var interval = setInterval(function () {
    if (aVerifier.length > 0 && compteur < aVerifier.length) {
      if (linkExist("DEB", data[aVerifier[compteur]].key) == false) {
        //mise a jour dans le tableau générale
        data[aVerifier[compteur]].previous.push(new Petit("DEB", 0));
        data[indiceDebut].next.push(
          new Petit(
            data[aVerifier[compteur]].key,
            data[aVerifier[compteur]].duree
          )
        );

        //ajout du lien sur le Graph
        myDiagram.model.addLinkData({
          from: "DEB",
          to: data[aVerifier[compteur]].key,
          text: "0",
        });

        //ajout des text dans le tableau
        $("#TAZ-" + data[aVerifier[compteur]].key).append(
          '<span class="DEB neon-blue-text">, DEB</span>'
        );
      }
      compteur++;
    } else {
      window.clearInterval(interval);

      //chercher les fin
      findFIN();
    }
  }, timing);
}

function findFIN() {
  var aVerifier = [];
  var indiceFin = chercher("FIN");
  //mettre fin = true pour tout les fins
  for (var i in data) {
    if (
      data[i].next.length == 0 &&
      data[i].key != "DEB" &&
      data[i].key != "FIN"
    ) {
      aVerifier.push(i);
    }
  }

  var compteur = 0;
  var interval = setInterval(function () {
    if (aVerifier.length > 0 && compteur < aVerifier.length) {
      if (linkExist(data[aVerifier[compteur]].key, "FIN") == false) {
        //mise a jour dans le tableau générale
        data[aVerifier[compteur]].next.push(new Petit("FIN", 0));
        data[indiceFin].previous.push(
          new Petit(
            data[aVerifier[compteur]].key,
            data[aVerifier[compteur]].duree
          )
        );

        //ajout du lien sur le Graph
        myDiagram.model.addLinkData({
          from: data[aVerifier[compteur]].key,
          to: "FIN",
          text: data[aVerifier[compteur]].duree,
        });

        //ajout des text dans le tableau
        $("#TSZ-" + data[aVerifier[compteur]].key).append(
          '<span class="FIN neon-blue-text">FIN</span>'
        );
      }
      compteur++;
    } else {
      window.clearInterval(interval);

      dateAuPlusTot();
    }
  }, timing);
}

function linkExist(keyTacheSource, keyTacheDestination) {
  var trouve = false;

  for (var i in myDiagram.model.linkDataArray) {
    if (
      (myDiagram.model.linkDataArray[i].from == keyTacheSource &&
        myDiagram.model.linkDataArray[i].to == keyTacheDestination) ||
      (myDiagram.model.linkDataArray[i].from == keyTacheDestination &&
        myDiagram.model.linkDataArray[i].to == keyTacheSource)
    ) {
      trouve = true;
    }
  }

  return trouve;
}

function refresh() {
  //suppresion des données dans la zone de diagramme

  var tempLink = [];
  var temp = null;
  for (var i in myDiagram.model.linkDataArray) {
    if (
      myDiagram.model.linkDataArray[i].from == "DEB" ||
      myDiagram.model.linkDataArray[i].to == "FIN"
    ) {
      tempLink.push(myDiagram.model.linkDataArray[i]);
    }
    temp = myDiagram.model.linkDataArray[i];
    myDiagram.model.set(temp, "FColor", "black");
  }

  for (var i in tempLink) {
    myDiagram.model.removeLinkData(tempLink[i]);
  }

  var tempNode = null;

  for (var i in myDiagram.model.nodeDataArray) {
    if (
      myDiagram.model.nodeDataArray[i].key != "DEB" &&
      myDiagram.model.nodeDataArray[i].key != "FIN"
    ) {
      tempNode = myDiagram.model.nodeDataArray[i];
      myDiagram.model.set(tempNode, "RNB", "");
      myDiagram.model.set(tempNode, "LNB", "");
      myDiagram.model.set(tempNode, "marge", "");
      myDiagram.model.set(tempNode, "color", "white");
      myDiagram.model.set(tempNode, "RColor", null);
    }
  }

  tempNode = myDiagram.model.findNodeDataForKey("DEB");
  myDiagram.model.set(tempNode, "marge", "");

  tempNode = myDiagram.model.findNodeDataForKey("FIN");
  myDiagram.model.set(tempNode, "marge", "");

  while (data[chercher("DEB")].next.length) {
    data[chercher("DEB")].next.pop();
  }

  while (data[chercher("FIN")].previous.length) {
    data[chercher("FIN")].previous.pop();
  }

  for (var i in data) {
    //suppression dans tous les next
    for (var j in data[i].next) {
      if (data[i].next[j].key === "FIN") {
        data[i].next.splice(j, 1);
      }
    }

    //supprssion dans tous previous
    for (var k in data[i].previous) {
      if (data[i].previous[k].key == "DEB") {
        data[i].previous.splice(k, 1);
      }
    }

    data[i].debut = false;
    data[i].fin = false;
    data[i].RNB = null;
    data[i].LNB = 0;
    data[i].marge = 0;
  }

  $("#errorTextZone").text("");
  $("#infoTextZone").text("Données reinitialiser avec succès");
  $(".DEB").remove();
  $(".FIN").remove();
}

function marge() {
  $("#errorTextZone").text("");
  $("#infoTextZone").text("Calcul marge");

  reinitialiserCalculer();

  var indiceActuel = chercher("DEB");

  var nextCompteur = 0;

  //objet de type nodeData
  var tempNode = null;
  //objet de type Noeud
  var temp = null;
  //indice de l'objet de type Noeud
  var indiceTemp;
  //nouvelle valeur calculer
  var value = null;

  var aVerifier = [0];

  var interval = setInterval(function () {
    // si déjà calculer
    if (data[indiceActuel].calculer) {
      //s'il y a encore des next
      if (
        data[indiceActuel].next.length > 0 &&
        nextCompteur < data[indiceActuel].next.length
      ) {
        indiceTemp = chercher(data[indiceActuel].next[nextCompteur].key);
        temp = data[indiceTemp];
        //calcul de la nouvelle date au plus tot
        value = temp.RNB - temp.LNB;

        temp.marge = value;

        console.log(
          temp.key + " : " + temp.RNB + " - " + temp.LNB + " = " + temp.marge
        );

        tempNode = myDiagram.model.findNodeDataForKey(temp.key);
        if (temp.key != "FIN") {
          myDiagram.model.set(tempNode, "marge", temp.marge);
          myDiagram.model.set(tempNode, "RColor", "green");
        }

        temp.calculer = true;
        if (temp.key != "FIN") aVerifier.push(indiceTemp);

        nextCompteur++;
      } else if (
        data[indiceActuel].next.length > 0 &&
        nextCompteur == data[indiceActuel].next.length
      ) {
        nextCompteur = 0;
        aVerifier.shift();
        if (aVerifier.length > 0) indiceActuel = aVerifier[0];
        else {
          window.clearInterval(interval);
          $("#infoTextZone").text("Calcul Terminer");
        }
      } else if (aVerifier.length > 0) indiceActuel = aVerifier[0];
      else {
        window.clearInterval(interval);
        $("#infoTextZone").text("Calcul Terminer");
      }
    } // si non calculer
    else {
      //si debut
      if (data[indiceActuel].key == "DEB") {
        data[indiceActuel].calculer = true;
        data[indiceActuel].RNB = 0;
        data[indiceActuel].marge = 0;
        tempNode = myDiagram.model.findNodeDataForKey(data[indiceActuel].key);
        myDiagram.model.set(tempNode, "marge", "0");
        myDiagram.model.set(tempNode, "margeC", "red");
      }
    }
  }, timing);
}

function dateAuPlusTot() {
  $("#errorTextZone").text("");
  $("#infoTextZone").text("Calcul date au plus Tôt");
  var indiceActuel = chercher("DEB");

  var nextCompteur = 0;

  //objet de type nodeData
  var tempNode = null;
  //objet de type Noeud
  var temp = null;
  //indice de l'objet de type Noeud
  var indiceTemp;
  //nouvelle valeur calculer
  var value = null;

  var aVerifier = [indiceActuel];

  var interval = setInterval(function () {
    // si déjà calculer
    if (data[indiceActuel].calculer) {
      //s'il y a encore des next
      if (
        data[indiceActuel].next.length > 0 &&
        nextCompteur < data[indiceActuel].next.length
      ) {
        indiceTemp = chercher(data[indiceActuel].next[nextCompteur].key);
        temp = data[indiceTemp];
        //calcul de la nouvelle date au plus tot
        value = data[indiceActuel].LNB + data[indiceActuel].duree;
        //verification si nouvelle date superieur
        if (temp.LNB < value) temp.LNB = value;

        tempNode = myDiagram.model.findNodeDataForKey(temp.key);
        if (temp.key != "FIN") myDiagram.model.set(tempNode, "LNB", temp.LNB);
        else {
          myDiagram.model.set(tempNode, "marge", temp.LNB);
          myDiagram.model.set(tempNode, "margeC", "red");
        }

        //test de boucle
        if (temp.boucle > 10) {
          $("#errorTextZone").text("Calcul en Cours");
          $("#infoTextZone").text("");
        }

        temp.boucle++;

        temp.calculer = true;

        if (temp.key != "FIN") aVerifier.push(indiceTemp);

        nextCompteur++;
      } else if (
        data[indiceActuel].next.length > 0 &&
        nextCompteur == data[indiceActuel].next.length
      ) {
        nextCompteur = 0;
        aVerifier.shift();
        if (aVerifier.length > 0) indiceActuel = aVerifier[0];
        else {
          window.clearInterval(interval);
          chemin();
        }
      } else if (aVerifier.length > 0) indiceActuel = aVerifier[0];
      else {
        window.clearInterval(interval);
        chemin();
      }
    } // si non calculer
    else {
      //si debut
      if (data[indiceActuel].key == "DEB") {
        data[indiceActuel].calculer = true;
        tempNode = myDiagram.model.findNodeDataForKey(data[indiceActuel].key);
        myDiagram.model.set(tempNode, "marge", "0");
        myDiagram.model.set(tempNode, "margeC", "red");
      }
    }
  }, timing);
}

function dateAuPlusTard() {
  $("#errorTextZone").text("");
  $("#infoTextZone").text("Calcul date au plus tard");

  reinitialiserCalculer();

  var indiceActuel = chercher("FIN");

  var aVerifier = [indiceActuel];

  var compteurPrevious = 0;

  var value = null;

  var interval = setInterval(function () {
    if (data[indiceActuel].calculer) {
      if (
        data[indiceActuel].previous.length > 0 &&
        compteurPrevious < data[indiceActuel].previous.length
      ) {
        indiceTemp = chercher(
          data[indiceActuel].previous[compteurPrevious].key
        );
        temp = data[indiceTemp];
        //verificaiton de la différence

        value = data[indiceActuel].RNB - temp.duree;

        if (temp.RNB == null || temp.RNB > value) temp.RNB = value;

        tempNode = myDiagram.model.findNodeDataForKey(temp.key);

        if (temp.key != "DEB") {
          myDiagram.model.set(tempNode, "RNB", temp.RNB);
          aVerifier.push(indiceTemp);
        }

        //test de boucle
        if (temp.boucle > 10) {
          $("#errorTextZone").text("");
          $("#infoTextZone").text("");
        }

        temp.boucle++;

        temp.calculer = true;
        compteurPrevious++;
      } else if (
        data[indiceActuel].previous.length > 0 &&
        compteurPrevious == data[indiceActuel].previous.length
      ) {
        compteurPrevious = 0;
        aVerifier.shift();
        if (aVerifier.length > 0) indiceActuel = aVerifier[0];
        else {
          window.clearInterval(interval);
          marge();
        }
      } else if (aVerifier.length > 0) indiceActuel = aVerifier[0];
      else {
        window.clearInterval(interval);
        marge();
      }
    } else {
      if (data[indiceActuel].key == "FIN") {
        data[indiceActuel].calculer = true;
        data[indiceActuel].RNB = data[indiceActuel].LNB;
      }
    }
  }, timing);
}

function chemin() {
  $("#errorTextZone").text("");
  $("#infoTextZone").text("Chemin Critique");

  reinitialiserCalculer();

  var indiceActuel = chercher("FIN");

  var aVerifier = [indiceActuel];

  var compteurPrevious = 0;

  var value = null;

  var interval = setInterval(function () {
    if (data[indiceActuel].calculer) {
      if (
        data[indiceActuel].previous.length > 0 &&
        compteurPrevious < data[indiceActuel].previous.length
      ) {
        indiceTemp = chercher(
          data[indiceActuel].previous[compteurPrevious].key
        );
        temp = data[indiceTemp];
        //verificaiton de la différence
        value = temp.LNB + temp.duree;

        //verification si nouvelle date superieur
        if (value == data[indiceActuel].LNB) {
          tempNode = myDiagram.model.findNodeDataForKey(temp.key);

          if (temp.key != "DEB") {
            myDiagram.model.set(tempNode, "color", "orange");
            aVerifier.push(indiceTemp);
          }

          var tempLink = null;
          for (var i in myDiagram.model.linkDataArray) {
            if (
              myDiagram.model.linkDataArray[i].from == temp.key &&
              myDiagram.model.linkDataArray[i].to == data[indiceActuel].key
            ) {
              tempLink = myDiagram.model.linkDataArray[i];
            }
          }

          if (tempLink != null) {
            myDiagram.model.set(tempLink, "FColor", "red");
          }
        }
        temp.calculer = true;
        compteurPrevious++;
      } else if (
        data[indiceActuel].previous.length > 0 &&
        compteurPrevious == data[indiceActuel].previous.length
      ) {
        compteurPrevious = 0;
        aVerifier.shift();
        if (aVerifier.length > 0) indiceActuel = aVerifier[0];
        else {
          window.clearInterval(interval);
          dateAuPlusTard();
        }
      } else if (aVerifier.length > 0) indiceActuel = aVerifier[0];
      else {
        window.clearInterval(interval);
        dateAuPlusTard();
      }
    } else {
      if (data[indiceActuel].key == "FIN") data[indiceActuel].calculer = true;
    }
  }, timing);
}

function reinitialiserCalculer() {
  for (var i in data) {
    data[i].calculer = false;
  }
}
