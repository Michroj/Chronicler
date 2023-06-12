import { Person, persons } from "./test.js";
window.jsPDF = window.jspdf.jsPDF;

fabric.LineArrow = fabric.util.createClass(fabric.Line, {
  type: "lineArrow",

  initialize: function (element, options) {
    options || (options = {});
    this.callSuper("initialize", element, options);
  },

  toObject: function () {
    return fabric.util.object.extend(this.callSuper("toObject"));
  },

  _render: function (ctx) {
    this.callSuper("_render", ctx);

    // do not render if width/height are zeros or object is not visible
    if (this.width === 0 || this.height === 0 || !this.visible) return;

    ctx.save();

    var xDiff = this.x2 - this.x1;
    var yDiff = this.y2 - this.y1;
    var angle = Math.atan2(yDiff, xDiff);
    ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    //move 10px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
    ctx.moveTo(10, 0);
    ctx.lineTo(-20, 15);
    ctx.lineTo(-20, -15);
    ctx.closePath();
    ctx.fillStyle = this.stroke;
    ctx.fill();

    ctx.restore();
  },
});

const initCanvas = (id) => {
  return new fabric.Canvas(id, {
    width: document.body.clientWidth * 0.8,
    height: document.body.clientHeight * 0.8,
    selection: false,
    backgroundColor: "white",
  });
};

const resizeCanvas = () => {
  const outerCanvasContainer = document.querySelector(".fabric-canvas-wrapper");

  const ratio = canvas.getWidth() / canvas.getHeight();
  const containerWidth = outerCanvasContainer.clientWidth * 0.8;

  const scale =
    (containerWidth / canvas.getWidth()) *
    (window.innerWidth / window.innerHeight);
  // const zoom = canvas.getZoom() * scale;
  canvas.setDimensions({
    width: containerWidth,
    height: containerWidth / ratio,
  });
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
};

const togglePan = () => {
  if (currentMode === modes.pan) {
    currentMode = "";

    for (let object of canvas.getObjects()) {
      if (object.get("type") !== "line") {
        object.set({
          selectable: true,
        });
      }
    }
  } else {
    currentMode = modes.pan;
    for (let object of canvas.getObjects()) {
      object.set({
        selectable: false,
      });
    }
  }
};

const makeCanvasInteractive = (canvas) => {
  let mousePressed = false;
  // Zoomable canvas
  canvas.on("mouse:wheel", (opt) => {
    let delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 3) zoom = 3;
    if (zoom < 0.3) zoom = 0.3;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // Moveable canvas
  canvas.on("mouse:move", (event) => {
    if (currentMode === modes.pan) canvas.setCursor("grab");
    if (mousePressed && currentMode === modes.pan) {
      canvas.setCursor("move");
      canvas.renderAll();
      const mEvent = event.e;
      const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
      canvas.relativePan(delta);
    }
  });

  canvas.on("mouse:down", (event) => {
    mousePressed = true;
    if (currentMode === modes.pan) {
      canvas.setCursor("grab");
      canvas.renderAll();
    }
  });

  canvas.on("mouse:up", (event) => {
    mousePressed = false;
    canvas.setCursor("default");
    canvas.renderAll();
  });
};

const createPerson = (canvas, person, i) => {
  const rect = new fabric.Rect({
    left: 0,
    top: 0,
    stroke: "red",
    strokeWidth: 1,
    fill: "white",
    width: 200,
    height: 220,
  });

  const text = new fabric.Text(`${person.first_name} ${person.last_name}`, {
    fontSize: 20,
    top: 181,
    originX: "center",
    left: rect.width * 0.5,
  });

  fabric.Image.fromURL(
    `${
      person.avatar != undefined
        ? "../avatars_directory/" + person.avatar
        : person.sex == 0
        ? "img/avatarM.png"
        : "img/avatarF.png"
    }`,
    (oImg) => {
      oImg.scaleToHeight(180);
      let img = oImg.set({
        width: (150 * oImg.height) / 180,
        left: 25,
        top: 1,
      });
      let group = new fabric.Group([rect, img, text], {
        id: `${person.id}`,
        left: person.position__x != undefined ? person.position__x : 0,
        top: person.position__y != undefined ? person.position__y : 0,
        spouse: `${person.spouse}`,
        children: person.childs,
        hasControls: false,
      });
      canvas.add(group);
      canvas.renderAll();
      group.on("mouseup", () => {
        $.ajax({
          method: "GET",
          url: `../set-position/${group.id}-${parseInt(group.left)}-${parseInt(
            group.top
          )}`,
        });
      });
      group.on("moving", (opt) => {
        let id = canvas.getActiveObject().id;
        // Linie dzieci
        let linesChild = [];
        for (let object of canvas.getObjects()) {
          if (new RegExp(`:${id}`).test(object.id)) {
            linesChild.push(object);
          }
        }
        for (let line of linesChild) {
          line.set({
            x2: line.x2 + opt.e.movementX / canvas.getZoom(),
            y2: line.y2 + opt.e.movementY / canvas.getZoom(),
          });
        }

        // Linie małżeństwa
        let lineSpouse1 = [];
        let lineSpouse2 = [];
        let lineChildren = [];
        for (let object of canvas.getObjects()) {
          if (
            new RegExp(`${id}/`).test(object.id) &&
            !new RegExp(`:`).test(object.id)
          ) {
            lineSpouse1.push(object);
          } else if (
            new RegExp(`/${id}`).test(object.id) &&
            !new RegExp(`:`).test(object.id)
          ) {
            lineSpouse2.push(object);
          } else if (
            (new RegExp(`${id}/`).test(object.id) ||
              new RegExp(`/${id}`).test(object.id)) &&
            new RegExp(`:`).test(object.id)
          ) {
            lineChildren.push(object);
          }
        }
        for (let line of lineSpouse1) {
          line.set({
            x1: line.x1 + opt.e.movementX / canvas.getZoom(),
            y1: line.y1 + opt.e.movementY / canvas.getZoom(),
          });
        }
        for (let line of lineSpouse2) {
          line.set({
            x2: line.x2 + opt.e.movementX / canvas.getZoom(),
            y2: line.y2 + opt.e.movementY / canvas.getZoom(),
          });
        }
        for (let line of lineChildren) {
          let parentsLine = getObject(`${line.id.split(":")[0]}`);
          line.set({
            x1: parentsLine.left + parentsLine.width / 2,
            y1: parentsLine.top + parentsLine.height / 2,
          });
        }
        canvas.renderAll();
      });

      group.on("mousedblclick", () => {
        const modal = document.querySelector(`#dialog_${group.id}`);
        modal.showModal();
      });
    }
  );
};

const makeLineBetweenChildAndParent = (parentsLine, child) => {
  let line = new fabric.LineArrow(
    [
      parentsLine.left + parentsLine.width / 2,
      parentsLine.top + parentsLine.height / 2,
      child.left + child.width / 2,
      child.top,
    ],
    {
      fill: "red",
      stroke: "red",
      strokeWidth: 2,
      id: `${parentsLine.id}:${child.id}`,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
    }
  );
  line.on("mousedblclick", () => {
    editRelation(line.id);
  });
  canvas.add(line);
  line.moveTo(0);
  canvas.renderAll();
};

const makeLineBetweenSpouses = (husband, wife) => {
  let line = new fabric.Line(
    [
      husband.left + husband.width,
      husband.top + husband.height / 2,
      wife.left,
      wife.top + wife.height / 2,
    ],
    {
      fill: "red",
      stroke: "red",
      strokeWidth: 2,
      id: `${husband.id}/${wife.id}`,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
    }
  );
  line.on("mousedblclick", () => {
    editRelation(line.id);
  });
  canvas.add(line);
  line.moveTo(0);
  canvas.renderAll();
};

const createDialog = (person) => {
  const dialog = document.createElement("dialog");
  let innerDiv = document.createElement("div");
  innerDiv.innerHTML += `Imię: ${person.first_name} <br />`;
  innerDiv.innerHTML += `Nazwisko: ${person.last_name} <br />`;
  innerDiv.innerHTML += `Wiek: ${person.age} <br />`;
  innerDiv.innerHTML += `Data urodzenia: ${person.birthday.getDate()}/${
    person.birthday.getMonth() + 1 < 10
      ? "0" + (person.birthday.getMonth() + 1)
      : person.birthday.getMonth() + 1
  }/${person.birthday.getFullYear()} <br />`;
  innerDiv.innerHTML +=
    person.death.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
      ? ``
      : `Data śmierci: ${person.death.getDate()}/${
          person.death.getMonth() + 1 < 10
            ? "0" + (person.death.getMonth() + 1)
            : person.death.getMonth() + 1
        }/${person.death.getFullYear()} <br />`;
  innerDiv.innerHTML += `Miejsce urodzenia: ${person.birthplace} <br />`;
  innerDiv.innerHTML += `Kraj urodzenia: ${person.country_of_birth} <br />`;
  innerDiv.innerHTML += `Płeć: ${person.sex} <br />`;
  innerDiv.innerHTML += `Zawód: ${person.profession} <br />`;
  innerDiv.innerHTML += `${person.additional_information}`;
  dialog.setAttribute("id", `${person.first_name}_${person.last_name}_dialog`);
  dialog.appendChild(innerDiv);
  document.body.appendChild(dialog);
};

const createDialogFromJSON = (user_id) => {
  $.ajax({
    method: "GET",
    url: `../show-user/${user_id}`,
  }).done((data) => {
    const person = JSON.parse(data);

    let personBirthday = new Date(person.birthday);
    let personDeath = new Date(person.death);

    const dialog = document.createElement("dialog");
    const closeBtn = document.createElement("button");
    closeBtn.setAttribute("class", "closeUserForm-btn btn-close float-end");
    closeBtn.addEventListener("click", () => dialog.close());
    dialog.appendChild(closeBtn);
    let innerDiv = document.createElement("div");
    innerDiv.innerHTML += `ID: ${person.id} <br />`;
    innerDiv.innerHTML += `Imię: ${person.first_name} <br />`;
    innerDiv.innerHTML += `Nazwisko: ${person.last_name} <br />`;
    innerDiv.innerHTML += `Wiek: ${
      person.death === undefined
        ? Math.floor(
            (Date.now() - Date.parse(person.birthday)) / 31536000000,
            0
          )
        : Math.floor(
            (Date.parse(person.death) - Date.parse(person.birthday)) /
              31536000000,
            0
          )
    } <br />`;
    innerDiv.innerHTML += `Data urodzenia: ${personBirthday.getDate()}/${
      personBirthday.getMonth() + 1 < 10
        ? "0" + (personBirthday.getMonth() + 1)
        : personBirthday.getMonth() + 1
    }/${personBirthday.getFullYear()} <br />`;
    innerDiv.innerHTML +=
      person.death === undefined
        ? ``
        : `Data śmierci: ${personDeath.getDate()}/${
            personDeath.getMonth() + 1 < 10
              ? "0" + (personDeath.getMonth() + 1)
              : personDeath.getMonth() + 1
          }/${personDeath.getFullYear()} <br />`;
    innerDiv.innerHTML += `Miejsce urodzenia: ${person.birthplace} <br />`;
    innerDiv.innerHTML += `Kraj urodzenia: ${person.country_of_birth} <br />`;
    innerDiv.innerHTML += `Płeć: ${
      Number(person.sex) === 0 ? "Mężczyzna" : "Kobieta"
    } <br />`;
    innerDiv.innerHTML += `${
      person.profession === undefined
        ? ""
        : "Zawód: " + person.profession + " <br />"
    }`;
    innerDiv.innerHTML += `${
      person.additional_information === undefined
        ? ""
        : person.additional_information
    }`;
    dialog.setAttribute("id", `dialog_${person.id}`);
    dialog.appendChild(innerDiv);
    const editPersonBtn = document.createElement("button");
    editPersonBtn.setAttribute("id", "editPersonBtn");
    editPersonBtn.setAttribute("class", "btn btn-primary");
    editPersonBtn.innerHTML += "Edytuj osobę";
    dialog.appendChild(editPersonBtn);
    const deletePersonBtn = document.createElement("button");
    deletePersonBtn.setAttribute("id", "deletePersonBtn");
    deletePersonBtn.setAttribute("class", "btn btn-danger");
    deletePersonBtn.innerHTML += "Usuń osobę";
    dialog.appendChild(deletePersonBtn);
    document.body.appendChild(dialog);
    editPersonBtn.addEventListener("click", () => editPerson(user_id));
    deletePersonBtn.addEventListener("click", () => deletePerson());
  });
};

const createAllPeople = async () => {
  return new Promise((resolve) => {
    $.ajax({
      method: "GET",
      url: `../show-all-users`,
    }).done((data) => {
      const persons = JSON.parse(data);
      for (const [index, personJSON] of persons.entries()) {
        createPerson(canvas, personJSON, index);
        createDialogFromJSON(personJSON.id);
      }
      canvas.renderAll();
    });
    console.log("Ludzie utworzeni");
    resolve();
  });
};

const editDialog = (user_id) => {
  const dialog = document.querySelector(`#dialog_${user_id}`);
  const innerDiv = dialog.querySelector("div");
  innerDiv.innerHTML = "";

  const person = new Person(
    user_id,
    $("#user_firstName").val(),
    $("#user_lastName").val(),
    $("#user_birthday").val(),
    $("#user_death").val(),
    undefined,
    $("#user_birthplace").val(),
    $("#user_country_of_birth").val(),
    $("#user_sex").val(),
    $("#user_profession").val(),
    $("#user_additional_information").val(),
    undefined,
    undefined
  );

  let personBirthday = new Date(person.birthday);
  let personDeath = new Date(person.death);
  innerDiv.innerHTML += `ID: ${person.id} <br />`;
  innerDiv.innerHTML += `Imię: ${person.first_name} <br />`;
  innerDiv.innerHTML += `Nazwisko: ${person.last_name} <br />`;
  innerDiv.innerHTML += `Wiek: ${
    person.death === ``
      ? Math.floor((Date.now() - Date.parse(person.birthday)) / 31536000000, 0)
      : Math.floor(
          (Date.parse(person.death) - Date.parse(person.birthday)) /
            31536000000,
          0
        )
  } <br />`;
  innerDiv.innerHTML += `Data urodzenia: ${personBirthday.getDate()}/${
    personBirthday.getMonth() + 1 < 10
      ? "0" + (personBirthday.getMonth() + 1)
      : personBirthday.getMonth() + 1
  }/${personBirthday.getFullYear()} <br />`;
  innerDiv.innerHTML +=
    person.death === ``
      ? ``
      : `Data śmierci: ${personDeath.getDate()}/${
          personDeath.getMonth() + 1 < 10
            ? "0" + (personDeath.getMonth() + 1)
            : personDeath.getMonth() + 1
        }/${personDeath.getFullYear()} <br />`;
  innerDiv.innerHTML += `Miejsce urodzenia: ${person.birthplace} <br />`;
  innerDiv.innerHTML += `Kraj urodzenia: ${person.country_of_birth} <br />`;
  innerDiv.innerHTML += `Płeć: ${
    Number(person.sex) === 0 ? "Mężczyzna" : "Kobieta"
  } <br />`;
  innerDiv.innerHTML += `${
    person.profession === "" ? "" : "Zawód: " + person.profession + " <br />"
  }`;
  innerDiv.innerHTML += `${person.additional_information}`;
};

const editPerson = (user_id) => {
  document
    .querySelectorAll("dialog")
    [document.querySelectorAll("dialog").length - 1].close();

  $.ajax({
    method: "GET",
    url: `../edit-user/${user_id}`,
  }).done((data) => {
    $("#editUserForm").html(data);
    const modal = document.querySelector("#editUserForm");
    const closeModal = document.querySelector(".closeUserForm-btn");
    closeModal.addEventListener("click", () => modal.close());
    modal.showModal();
    $(() => {
      $("form[name='user']").on("submit", (e) => {
        const formSerialize = $('form[name="user"]').serialize();
        const person = getObject(user_id);
        person._objects[2].set(
          "text",
          `${$("#user_firstName").val()} ${$("#user_lastName").val()}`
        );
        editDialog(user_id);
        canvas.renderAll();
      });
    });
  });
};

const deletePerson = () => {
  const person = canvas.getActiveObject();
  console.log(person.id);
  const objectsToRemove = [];
  for (let object of canvas.getObjects()) {
    if (
      object.id.includes(`${person.id}/`) ||
      object.id.includes(`/${person.id}`) ||
      object.id.includes(`:${person.id}`)
    ) {
      objectsToRemove.push(object);
      // canvas.remove(object);
    }
  }

  if (objectsToRemove.length > 0) {
    const dialog = document.createElement("dialog");
    dialog.innerHTML +=
      "Nie możesz usunąć osoby! Najpierw usuń relacje powiązane z tą osobą (małżeństwo, dzieci, rodzice).";
    document.body.appendChild(dialog);
    dialog.showModal();
  } else {
    $.ajax({
      method: "GET",
      url: `../delete-user/${person.id}`,
    });

    canvas.remove(person);
  }
};

const downloadUserDate = () => {
  $.ajax({
    method: "GET",
    url: `../show-all-data`,
  }).done((data) => {
    var link = document.createElement("a");
    link.download = "data.json";
    var blob = new Blob([data], { type: "text/plain" });
    link.href = window.URL.createObjectURL(blob);
    link.click();
  });
};

const uploadJSONDate = (event) => {
  var reader = new FileReader();
  reader.onload = onReaderLoad;
  reader.readAsText(event.target.files[0]);
};

function onReaderLoad(event) {
  $.ajax({
    method: "POST",
    url: `../upload-all-data`,
    data: event.target.result,
  }).done((data) => {
    alert("Dane załadowane pomyślnie");
  });
}

const useForm = () => {
  const modal = document.querySelector("#userForm");
  $.ajax({
    method: "GET",
    url: "../new-user",
  }).done((data) => {
    $("#userForm").html(data);
    const closeModal = document.querySelector(".closeUserForm-btn");
    closeModal.addEventListener("click", () => modal.close());
    $(() => {
      $("#userForm").on("submit", "form", function (event) {
        if (
          $("#user_death").val() !== "" &&
          $("#user_death").val() < $("#user_birthday").val()
        ) {
          $("form[name='user']")
            .parent()
            .html("Data śmierci nie może być wcześniejsza od daty narodzin.");
          event.preventDefault();
          return false;
        }
        $.ajax({
          url: "../new-user",
          method: "POST",
          dataType: "JSON",
          data: new FormData(this),
          processData: false,
          contentType: false,
          success: function (data) {
            $("form[name='user']").parent().html(data.content);
            $.ajax({
              method: "GET",
              url: `../show-user/${data.user_id}`,
            }).done((data) => {
              const personJSON = JSON.parse(data);
              const person = new Person(
                personJSON.id,
                personJSON.first_name,
                personJSON.last_name,
                personJSON.birthday,
                personJSON.death,
                undefined,
                personJSON.birthplace,
                personJSON.country_of_birth,
                personJSON.sex,
                personJSON.profession,
                personJSON.additional_information,
                undefined,
                undefined,
                undefined,
                undefined,
                personJSON.avatar
              );

              createPerson(canvas, person, 0);
              createDialogFromJSON(person.id);
            });
          },
          error: function (xhr, desc, err) {
            $("form[name='user']").parent().html(data);
          },
        });

        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      });
    });
  });

  modal.showModal();
};

const relationForm = () => {
  const modal = document.querySelector("#relationForm");
  let sendRelation = 0;
  modal.innerHTML = "";
  $.ajax({
    method: "POST",
    url: "../new-relation",
  }).done((data) => {
    $("#relationForm").html(data);
    const closeModal = document.querySelector(".closeRelationForm-btn");
    closeModal.addEventListener("click", () => modal.close());
    $(() => {
      $("form[name='relation']").on("submit", (e) => {
        const formSerialize = $('form[name="relation"]').serialize();

        let relations = [];
        $.ajax({
          method: "GET",
          url: "../show-all-relations",
        })
          .done((data) => {
            relations = JSON.parse(data);
          })
          .done(() => {
            const preventSend = 0;
            if ($("#relation_parent").val() == $("#relation_child").val()) {
              const dialog = document.createElement("dialog");
              dialog.innerHTML +=
                "Nie możesz utworzyć relacji między tą samą osobą.";
              document.body.appendChild(dialog);
              dialog.showModal();
            } else if (relations.length == 0) {
              if ($("#relation_relationship_type").val() == 0) {
                makeLineBetweenSpouses(
                  getObject($("#relation_parent").val()),
                  getObject($("#relation_child").val())
                );
              } else if ($("#relation_relationship_type").val() == 1) {
                for (let object of canvas.getObjects()) {
                  if (
                    (new RegExp(`${$("#relation_parent").val()}/`).test(
                      object.id
                    ) &&
                      !new RegExp(`:`).test(object.id)) ||
                    (new RegExp(`/${$("#relation_parent").val()}`).test(
                      object.id
                    ) &&
                      !new RegExp(`:`).test(object.id))
                  ) {
                    makeLineBetweenChildAndParent(
                      object,
                      getObject($("#relation_child").val())
                    );
                  }
                }
              }
              $.post("../new-relation", formSerialize, function (data) {
                $("form[name='relation']").parent().html(data);
              }).fail(function (data) {
                $("form[name='relation']").parent().html(data.responseText);
              });
            } else {
              for (let relation of relations) {
                if (
                  (relation.parent.id == $("#relation_parent").val() ||
                    relation.child.id == $("#relation_child").val() ||
                    relation.parent.id == $("#relation_child").val() ||
                    relation.child.id == $("#relation_parent").val()) &&
                  relation.relationship_type == 0 &&
                  $("#relation_relationship_type").val() == 0
                ) {
                  const dialog = document.createElement("dialog");
                  dialog.innerHTML +=
                    "Nie możesz utworzyć relacji. Jedna z osób jest już w związku małżeńskim.";
                  document.body.appendChild(dialog);
                  dialog.showModal();
                } else if (
                  $("#relation_relationship_type").val() == 1 &&
                  (relation.parent.id == $("#relation_parent").val() ||
                    relation.child.id == $("#relation_parent").val()) &&
                  (relation.child.id == $("#relation_child").val() ||
                    relation.parent.id == $("#relation_child").val()) &&
                  relation.relationship_type == 0
                ) {
                  const dialog = document.createElement("dialog");
                  dialog.innerHTML +=
                    "Nie możesz utworzyć relacji. Małżonek nie może zostać dzieckiem.";
                  document.body.appendChild(dialog);
                  dialog.showModal();
                } else {
                  sendRelation = 1;
                  if ($("#relation_relationship_type").val() == 0) {
                    makeLineBetweenSpouses(
                      getObject($("#relation_parent").val()),
                      getObject($("#relation_child").val())
                    );
                  } else if ($("#relation_relationship_type").val() == 1) {
                    for (let object of canvas.getObjects()) {
                      if (
                        (new RegExp(`${$("#relation_parent").val()}/`).test(
                          object.id
                        ) &&
                          !new RegExp(`:`).test(object.id)) ||
                        (new RegExp(`/${$("#relation_parent").val()}`).test(
                          object.id
                        ) &&
                          !new RegExp(`:`).test(object.id))
                      ) {
                        makeLineBetweenChildAndParent(
                          object,
                          getObject($("#relation_child").val())
                        );
                      }
                    }
                  }
                }
              }
              console.log(sendRelation);
              if (sendRelation == 1) {
                $.post("../new-relation", formSerialize, function (data) {
                  $("form[name='relation']").parent().html(data);
                }).fail(function (data) {
                  $("form[name='relation']").parent().html(data);
                });
              }
            }
          });
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      });
    });
  });
  modal.showModal();
};

const createAllRelations = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      $.ajax({
        method: "GET",
        url: `../show-all-relations`,
      }).done((data) => {
        const relations = JSON.parse(data);
        for (const [index, relation] of relations.entries()) {
          if (relation.relationship_type == 0) {
            makeLineBetweenSpouses(
              getObject(relation.parent.id),
              getObject(relation.child.id)
            );
          }
        }
        for (const [index, relation] of relations.entries()) {
          if (relation.relationship_type == 1) {
            for (let object of canvas.getObjects()) {
              if (
                (new RegExp(`${relation.parent.id}/`).test(object.id) &&
                  !new RegExp(`:`).test(object.id)) ||
                (new RegExp(`/${relation.parent.id}`).test(object.id) &&
                  !new RegExp(`:`).test(object.id))
              ) {
                makeLineBetweenChildAndParent(
                  object,
                  getObject(relation.child.id)
                );
              }
            }
          }
        }
        canvas.renderAll();
      });
      console.log("Relacje utworzone");
      resolve();
    }, 500);
  });
};

const editRelation = (id) => {
  let relation_id = "";
  $.ajax({
    method: "GET",
    url: `../show-all-relations`,
  })
    .done((data) => {
      for (let relation of JSON.parse(data)) {
        if (!new RegExp(`:`).test(id)) {
          if (
            id.split("/")[0] == relation.parent.id &&
            id.split("/")[1] == relation.child.id &&
            relation.relationship_type == 0
          ) {
            relation_id = relation.id;
          }
        } else {
          if (
            (id.split(":")[0].split("/")[0] == relation.parent.id ||
              id.split(":")[0].split("/")[1] == relation.parent.id) &&
            id.split(":")[1] == relation.child.id &&
            relation.relationship_type == 1
          ) {
            relation_id = relation.id;
          }
        }
      }
    })
    .done(() => {
      $.ajax({
        method: "GET",
        url: `../edit-relation/${relation_id}`,
      }).done((data) => {
        $("#relationForm").html(data);
        const modal = document.querySelector("#relationForm");
        const closeModal = document.querySelector(".closeRelationForm-btn");
        closeModal.addEventListener("click", () => modal.close());
        const deleteRelationBtn = document.createElement("button");
        deleteRelationBtn.setAttribute("id", "deleteRelationBtn");
        deleteRelationBtn.setAttribute("class", "btn btn-danger");
        deleteRelationBtn.innerHTML += "Usuń relację";
        document
          .querySelectorAll("#relation .form-group .col-sm-10")[4]
          .appendChild(deleteRelationBtn);
        deleteRelationBtn.addEventListener("click", () => deleteRelation());
        modal.showModal();
        $(() => {
          $("form[name='relation']").on("submit", (e) => {
            const formSerialize = $('form[name="relation"]').serialize();

            let relations = [];
            $.ajax({
              method: "GET",
              url: "../show-all-relations",
            })
              .done((data) => {
                relations = JSON.parse(data);
              })
              .done(() => {
                // if ($("#relation_parent").val() == $("#relation_child").val()) {
                //   const dialog = document.createElement("dialog");
                //   dialog.innerHTML +=
                //     "Nie możesz utworzyć relacji między tą samą osobą.";
                //   document.body.appendChild(dialog);
                //   dialog.showModal();
                // } else {
                //   for (let relation of relations) {
                //     if (
                //       (relation.parent.id == $("#relation_parent").val() ||
                //         relation.child.id == $("#relation_child").val() ||
                //         relation.parent.id == $("#relation_child").val() ||
                //         relation.child.id == $("#relation_parent").val()) &&
                //       $("#relation_relationship_type") == 0
                //     ) {
                //       const dialog = document.createElement("dialog");
                //       dialog.innerHTML +=
                //         "Nie możesz utworzyć relacji. Jedna z osób jest już w związku małżeńskim.";
                //       document.body.appendChild(dialog);
                //       dialog.showModal();
                //     } else {
                const relation = getObject(id);
                canvas.remove(relation);
                if ($("#relation_relationship_type").val() == 0) {
                  makeLineBetweenSpouses(
                    getObject($("#relation_parent").val()),
                    getObject($("#relation_child").val())
                  );
                } else if ($("#relation_relationship_type").val() == 1) {
                  for (let object of canvas.getObjects()) {
                    if (
                      (new RegExp(`${$("#relation_parent").val()}/`).test(
                        object.id
                      ) &&
                        !new RegExp(`:`).test(object.id)) ||
                      (new RegExp(`/${$("#relation_parent").val()}`).test(
                        object.id
                      ) &&
                        !new RegExp(`:`).test(object.id))
                    ) {
                      makeLineBetweenChildAndParent(
                        object,
                        getObject($("#relation_child").val())
                      );
                    }
                  }
                }
                // }
                //   }
                // }
              });

            canvas.renderAll();
            e.preventDefault();
            return false;
          });
        });
      });
    });
};

const deleteRelation = () => {
  const relation = canvas.getActiveObject();
  console.log(relation.id);
  const objectsToRemove = [];
  for (let object of canvas.getObjects()) {
    if (object.id.includes(`${relation.id}`)) {
      objectsToRemove.push(object);
    }
  }

  console.log(objectsToRemove);

  const idsToRemove = [];

  if (objectsToRemove.length > 1) {
    const dialog = document.createElement("dialog");
    dialog.innerHTML +=
      "Nie możesz usunąć relacji! Najpierw usuń relacje powiązane z tą relacją (dzieci).";
    document.body.appendChild(dialog);
    dialog.showModal();
  } else {
    $.ajax({
      method: "GET",
      url: `../show-all-relations`,
    }).done((data) => {
      for (let object of objectsToRemove) {
        for (let relation of JSON.parse(data)) {
          if (!new RegExp(`:`).test(object.id)) {
            if (
              object.id.split("/")[0] == relation.parent.id &&
              object.id.split("/")[1] == relation.child.id &&
              relation.relationship_type == 0
            ) {
              idsToRemove.push(relation.id);
            }
          } else {
            if (
              (object.id.split(":")[0].split("/")[0] == relation.parent.id ||
                object.id.split(":")[0].split("/")[1] == relation.parent.id) &&
              object.id.split(":")[1] == relation.child.id &&
              relation.relationship_type == 1
            ) {
              idsToRemove.push(relation.id);
            }
          }
        }
      }

      for (let id of idsToRemove) {
        $.ajax({
          method: "GET",
          url: `../delete-relation/${id}`,
        });
      }
    });
    canvas.remove(relation);
  }
};

const getObject = (id) => {
  for (let object of canvas.getObjects()) {
    if (object.id == id) return object;
  }
};

const exportPNG = document.querySelector(".exportPNG-btn");
exportPNG.addEventListener(
  "click",
  function (e) {
    this.href = canvas.toDataURL({
      format: "png",
    });
    this.download = "tree.png";
    // console.log(canvas.toSVG());
  },
  false
);

const createPDF = () => {
  const doc = new jsPDF({
    orientation: "landscape",
  });

  doc.addImage(canvas.toDataURL({ format: "png" }), "png", 0, 0, 0, 0);
  doc.save("tree.pdf");
};

const canvas = initCanvas("canvas");

// Switching pan mode
let currentMode;
const modes = {
  pan: "pan",
};

const togglePanButton = document.querySelector("#togglePan");
togglePanButton.addEventListener("mousedown", togglePan);

const resetZoomButton = document.querySelector("#resetZoom");
resetZoomButton.addEventListener("mousedown", () => {
  canvas.zoomToPoint(new fabric.Point(0, 0), 1);
});

makeCanvasInteractive(canvas);

// for (const [index, person] of persons.entries()) {
//   createPerson(canvas, person, index);
//   createDialog(person);
// }

canvas.renderAll();

const openUserModal = document.querySelector(".openUserForm-btn");

openUserModal.addEventListener("click", useForm);

const openRelationModal = document.querySelector(".openRelationForm-btn");

openRelationModal.addEventListener("click", relationForm);

const downloadJSON = document.querySelector(".downloadJSON-btn");
downloadJSON.addEventListener("click", downloadUserDate);

const exportPDF = document.querySelector(".exportPDF-btn");
exportPDF.addEventListener("click", createPDF);

const uploadJSON = document.querySelector("#file-selector");
uploadJSON.addEventListener("change", uploadJSONDate);

// let cancel = true;
// window.addEventListener("mousemove", () => {
//   if (cancel) {
//     let o1 = getObject("Tomasz_Barnaś");
//     let o2 = getObject("Antoni_Zuber");
//     let o3 = getObject("Rafał_Ochorok");
//     makeLineBetweenSpouses(o2, getObject(o2.spouse));
//     for (let child of o2.children) {
//       makeLineBetweenChildAndParent(
//         getObject(`${o2.id}/${o2.spouse}`),
//         getObject(child)
//       );
//     }
//     canvas.renderAll();
//   }
//   cancel = false;
// });

window.addEventListener("resize", resizeCanvas);

async function makeCanvas() {
  await createAllPeople();
  await createAllRelations();
  console.log("Zrobione");
}

makeCanvas();
