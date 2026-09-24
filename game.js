(function () {
  "use strict";
  var SAVE_KEY = "mansion_escape_case_013";
  var ITEM_DATA = {
    studyKey: { name: "작은 황동 열쇠", detail: "서재 문에 맞을 것 같다.", seal: "K" },
    cellarKey: { name: "지하실 열쇠", detail: "낡은 철제 열쇠.", seal: "Ⅱ" },
    fuse: { name: "여분의 퓨즈", detail: "보일러실 차단기에 필요하다.", seal: "F" }
  };
  var ROOM_DATA = {
    foyer: {
      name: "현관 홀", kicker: "1층 · 동쪽", description: "젖은 발자국이 현관문 앞에서 끊겼다. 문에는 숫자 자물쇠가 달려 있다.",
      hint: "초상화와 현관문을 조사해 보세요.",
      art: '<div class="prop prop-door"></div><div class="prop prop-frame a"></div><div class="prop prop-frame b"></div><div class="prop prop-frame c"></div><div class="prop prop-console-table"></div><div class="prop prop-runner"></div>',
      spots: [
        { id: "frontDoor", label: "현관문", x: 51, y: 63, door: true },
        { id: "portraits", label: "초상화", x: 23, y: 40 },
        { id: "entryTable", label: "탁자", x: 17, y: 72 },
        { id: "toLounge", label: "거실", x: 76, y: 81, door: true },
        { id: "toStudy", label: "서재 문", x: 81, y: 44, door: true }
      ]
    },
    lounge: {
      name: "거실", kicker: "1층 · 서쪽", description: "커튼은 안쪽에서 젖어 있다. 누군가 창문을 열어 둔 모양이다.",
      hint: "소파와 오래된 축음기를 살펴보세요.",
      art: '<div class="prop prop-window"></div><div class="prop prop-curtain"></div><div class="prop prop-sofa"></div><div class="prop prop-table"></div><div class="prop prop-gramophone"></div>',
      spots: [
        { id: "sofa", label: "소파 틈", x: 49, y: 69 },
        { id: "gramophone", label: "축음기", x: 83, y: 58 },
        { id: "window", label: "창문", x: 69, y: 37 },
        { id: "toFoyer", label: "현관 홀", x: 10, y: 78, door: true },
        { id: "toKitchen", label: "주방", x: 89, y: 79, door: true },
        { id: "toStudyFromLounge", label: "서재", x: 17, y: 42, door: true }
      ]
    },
    study: {
      name: "서재", kicker: "1층 · 북쪽", description: "오래된 책에서 먼지와 희미한 장미 향이 난다. 벽 안쪽에서 시계가 움직인다.",
      hint: "금고의 번호는 현관 홀에서 본 것과 관련이 있어 보인다.",
      art: '<div class="prop prop-books"></div><div class="prop prop-desk"></div><div class="prop prop-safe"></div>',
      spots: [
        { id: "safe", label: "벽 금고", x: 78, y: 51 },
        { id: "desk", label: "책상 서랍", x: 52, y: 68 },
        { id: "bookcase", label: "책장", x: 18, y: 43 },
        { id: "toFoyerFromStudy", label: "현관 홀", x: 88, y: 81, door: true },
        { id: "toLoungeFromStudy", label: "거실", x: 7, y: 81, door: true }
      ]
    },
    kitchen: {
      name: "주방", kicker: "1층 · 남쪽", description: "식탁 위에 식사가 차려져 있지만 그릇에는 검은 물이 고여 있다.",
      hint: "찬장 안의 작은 물건을 찾아보세요.",
      art: '<div class="prop prop-cabinet"></div><div class="prop prop-kitchen-table"></div><div class="prop prop-hatch"></div>',
      spots: [
        { id: "drawer", label: "찬장 서랍", x: 27, y: 51 },
        { id: "tableware", label: "식탁", x: 59, y: 62 },
        { id: "hatch", label: "지하실 문", x: 77, y: 79, door: true },
        { id: "toLoungeFromKitchen", label: "거실", x: 10, y: 80, door: true }
      ]
    },
    basement: {
      name: "보일러실", kicker: "지하 · 서쪽", description: "금속 배관이 낮게 울린다. 차단기함에는 퓨즈 하나가 비어 있다.",
      hint: "퓨즈를 찾아 차단기에 끼워 넣으세요.",
      art: '<div class="prop prop-pipe one"></div><div class="prop prop-pipe two"></div><div class="prop prop-breaker"></div><div class="prop prop-boiler"></div><div class="prop prop-crate"></div>',
      spots: [
        { id: "breaker", label: "차단기함", x: 76, y: 42 },
        { id: "boiler", label: "보일러", x: 49, y: 56 },
        { id: "crate", label: "나무 상자", x: 87, y: 72 },
        { id: "stairs", label: "주방으로", x: 11, y: 80, door: true }
      ]
    }
  };

  var state = freshState();
  var codeMode = null;
  var codeValue = "";
  var toastTimer = 0;
  var audioContext = null;
  var $ = function (selector) { return document.querySelector(selector); };

  function freshState() {
    return {
      started: false, room: "foyer", visited: ["foyer"], inventory: [], notes: [],
      flags: { portraits: false, studyOpened: false, cellarUnlocked: false, fuseInstalled: false, powerOn: false, exitOpened: false },
      sound: false, lastText: "저택 안은 숨을 죽인 듯 고요하다."
    };
  }
  function loadState() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved || !saved.flags || !ROOM_DATA[saved.room]) return null;
      var defaults = freshState();
      return Object.assign(defaults, saved, { flags: Object.assign(defaults.flags, saved.flags) });
    } catch (error) { return null; }
  }
  function saveState() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (error) {}
  }
  function addNote(id, title, text) {
    if (state.notes.some(function (item) { return item.id === id; })) return false;
    state.notes.push({ id: id, title: title, text: text });
    return true;
  }
  function hasItem(id) { return state.inventory.indexOf(id) >= 0; }
  function acquire(id) {
    if (hasItem(id)) return false;
    state.inventory.push(id);
    playTone(520, .09);
    return true;
  }
  function setMessage(text) {
    state.lastText = text;
    $("#narration").textContent = text;
    var toast = $("#room-toast");
    toast.textContent = text;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 2700);
    saveState();
    updatePanels();
  }
  function roomAccessible(room) {
    if (!ROOM_DATA[room]) return false;
    if (room === "study") return hasItem("studyKey") || state.flags.studyOpened;
    if (room === "basement") return state.flags.cellarUnlocked || hasItem("cellarKey");
    return true;
  }
  function goToRoom(room) {
    if (!roomAccessible(room)) {
      if (room === "study") setMessage("서재 문은 잠겨 있다. 거실 어딘가에 열쇠가 있을지 모른다.");
      else if (room === "basement") setMessage("지하실 문에는 철제 자물쇠가 걸려 있다.");
      return;
    }
    if (room === state.room) return;
    state.room = room;
    if (state.visited.indexOf(room) < 0) state.visited.push(room);
    playTone(190, .11);
    renderRoom();
    updatePanels();
    saveState();
    if (room === "basement" && !state.flags.powerOn) setMessage("보일러실에는 전기가 들어오지 않는다. 차단기함의 빈자리가 눈에 띈다.");
    else setMessage(ROOM_DATA[room].description);
  }
  function renderRoom() {
    var data = ROOM_DATA[state.room];
    $("#scene").className = "scene scene--" + state.room;
    $("#scene-art").innerHTML = data.art;
    $("#room-name").textContent = data.name;
    $("#room-kicker").textContent = data.kicker;
    $("#room-description").textContent = data.description;
    $("#scene-hint").textContent = data.hint;
    $("#hotspots").innerHTML = "";
    data.spots.forEach(function (spot, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "hotspot" + (spot.door ? " is-door" : "");
      button.style.left = spot.x + "%";
      button.style.top = spot.y + "%";
      button.setAttribute("data-spot", spot.id);
      button.setAttribute("aria-label", spot.label + " 조사");
      button.innerHTML = '<span class="hotspot-mark">' + String(index + 1).padStart(2, "0") + '</span><span>' + spot.label + '</span>';
      $("#hotspots").appendChild(button);
    });
    $("#narration").textContent = state.lastText || data.description;
  }
  function updatePanels() {
    var itemList = $("#inventory-list");
    itemList.innerHTML = "";
    state.inventory.forEach(function (id) {
      var item = ITEM_DATA[id];
      if (!item) return;
      var li = document.createElement("li");
      li.className = "inventory-item";
      li.innerHTML = '<span class="item-seal">' + item.seal + '</span><span class="item-copy"><strong>' + item.name + '</strong><small>' + item.detail + '</small></span>';
      itemList.appendChild(li);
    });
    if (!state.inventory.length) itemList.innerHTML = '<li class="empty-copy">아직 주운 물건이 없습니다.</li>';
    $("#item-count").textContent = state.inventory.length;

    var noteList = $("#notes-list");
    noteList.innerHTML = "";
    state.notes.slice().reverse().forEach(function (note) {
      var article = document.createElement("article");
      article.className = "note-entry";
      article.innerHTML = '<strong>' + note.title + '</strong><p>' + note.text + '</p>';
      noteList.appendChild(article);
    });
    if (!state.notes.length) noteList.innerHTML = '<p class="empty-copy">아직 기록된 단서가 없습니다.</p>';
    $("#note-count").textContent = state.notes.length;

    var map = $("#map-list");
    map.innerHTML = "";
    Object.keys(ROOM_DATA).forEach(function (id) {
      if (state.visited.indexOf(id) < 0 && id !== "foyer" && id !== state.room) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "map-room" + (state.room === id ? " is-current" : "");
      button.textContent = ROOM_DATA[id].name;
      button.disabled = id === state.room || !roomAccessible(id);
      button.setAttribute("data-map-room", id);
      map.appendChild(button);
    });

    var checks = [state.flags.portraits, hasItem("studyKey"), state.flags.studyOpened, state.flags.cellarUnlocked, hasItem("fuse"), state.flags.powerOn, state.flags.exitOpened];
    var percent = Math.round(checks.filter(Boolean).length / checks.length * 100);
    $("#progress-label").textContent = percent + "%";
    $("#progress-bar").style.width = percent + "%";

    if (!state.flags.portraits) {
      $("#objective-title").textContent = "현관의 단서를 찾으세요";
      $("#objective-copy").textContent = "초상화와 주변 물건을 살펴 숫자 자물쇠에 관한 단서를 찾아보세요.";
    } else if (!hasItem("studyKey")) {
      $("#objective-title").textContent = "서재 열쇠를 찾으세요";
      $("#objective-copy").textContent = "거실의 소파 틈을 조사해 서재 문을 열 열쇠를 찾아보세요.";
    } else if (!state.flags.studyOpened) {
      $("#objective-title").textContent = "벽 금고를 여세요";
      $("#objective-copy").textContent = "초상화에서 발견한 숫자를 순서대로 입력해 보세요.";
    } else if (!hasItem("fuse") && !state.flags.powerOn) {
      $("#objective-title").textContent = "전력을 복구하세요";
      $("#objective-copy").textContent = "주방 찬장에서 퓨즈를 찾아 지하 보일러실로 가져가세요.";
    } else if (!state.flags.powerOn) {
      $("#objective-title").textContent = "차단기를 올리세요";
      $("#objective-copy").textContent = "퓨즈를 차단기함에 설치한 뒤 전원을 켜세요.";
    } else if (!state.flags.exitOpened) {
      $("#objective-title").textContent = "현관 암호를 입력하세요";
      $("#objective-copy").textContent = "쪽지에 적힌 날짜를 현관문의 자물쇠에 입력하세요.";
    } else {
      $("#objective-title").textContent = "문이 열렸습니다";
      $("#objective-copy").textContent = "현관으로 돌아가 이 저택을 빠져나가세요.";
    }
    $("#status-label").textContent = state.started ? "조사 진행 중" : "기록 대기 중";
    $("#sound-toggle").setAttribute("aria-label", state.sound ? "효과음 끄기" : "효과음 켜기");
    $("#sound-toggle").title = state.sound ? "효과음 끄기" : "효과음 켜기";
    $("#sound-symbol").textContent = state.sound ? "♫" : "♪";
    $("#continue-button").hidden = !state.started;
    $("#start-button").querySelector("span").textContent = state.started ? "새로 조사 시작" : "조사 시작";
    $("#ending-rooms").textContent = state.visited.length;
    $("#ending-notes").textContent = state.notes.length;
  }
  function beginGame(continueGame) {
    if (!continueGame) {
      state = freshState();
      state.started = true;
      state.lastText = "눈을 뜨자 낡은 현관 홀이다. 문은 잠겨 있고, 집 안에는 당신 말고 다른 숨소리가 들린다.";
    } else {
      state.started = true;
      state.lastText = "조사는 계속된다. 저택은 여전히 조용하다.";
    }
    $("#intro-screen").hidden = true;
    $("#game-layout").hidden = false;
    renderRoom();
    updatePanels();
    setMessage(state.lastText);
    saveState();
  }
  function doRoute(route) {
    if (route === "study" && !roomAccessible("study")) {
      setMessage("서재 문은 잠겨 있다. 거실의 소파 틈을 살펴보자.");
      return;
    }
    if (route === "basement" && !roomAccessible("basement")) {
      setMessage("철제 자물쇠가 걸려 있다. 서재 금고 안에 열쇠가 있을 것 같다.");
      return;
    }
    goToRoom(route);
  }
  function handleSpot(id) {
    switch (id) {
      case "frontDoor":
        if (state.flags.exitOpened) finishGame();
        else if (state.flags.powerOn) openCodeModal("exit");
        else setMessage("문은 잠겨 있다. 옆의 숫자 자물쇠도 꺼져 있다. 먼저 저택의 전원을 복구해야 할 것 같다.");
        break;
      case "portraits":
        state.flags.portraits = true;
        addNote("portrait-code", "세 장의 초상화", "왼쪽 그림의 새는 셋, 가운데 아이는 하나의 촛불을 들고, 오른쪽 그림에는 인형이 넷 있다. 순서대로 3 · 1 · 4.");
        playTone(390, .07);
        setMessage("초상화 속 숫자를 왼쪽부터 세어 본다. 새 셋, 촛불 하나, 인형 넷. 3 · 1 · 4.");
        break;
      case "entryTable":
        addNote("entry-note", "탁자 위의 쪽지", "전기가 끊긴 뒤로 현관 잠금장치가 작동하지 않는다. 보일러실 차단기를 먼저 확인해야 한다.");
        setMessage("먼지 쌓인 탁자 아래에 접힌 쪽지가 떨어져 있다. 누군가 급히 쓴 글씨다.");
        break;
      case "sofa":
        if (acquire("studyKey")) {
          addNote("sofa-scrap", "찢어진 메모", "서재 벽에 금고가 있다. 세 장의 그림을 순서대로 보면 열 수 있다는 메모가 남아 있다.");
          setMessage("소파 틈에서 작은 황동 열쇠와 찢어진 메모를 찾았다. 서재 문을 열 수 있을 것 같다.");
        } else setMessage("소파 틈은 비어 있다. 축음기에서 짧은 긁는 소리가 난다.");
        break;
      case "gramophone":
        setMessage("축음기 바늘이 홈을 긁는다. 끊어진 음성 사이로 누군가 숫자를 세는 소리가 들린다.");
        break;
      case "window":
        setMessage("창문은 안쪽에서 잠겨 있다. 유리 너머로 정원 대신 짙은 안개만 보인다.");
        break;
      case "safe":
        if (!state.flags.studyOpened) openCodeModal("safe");
        else setMessage("금고는 열려 있다. 안쪽에는 지하실 열쇠와 오래된 쪽지만 남아 있다.");
        break;
      case "desk":
        if (!state.flags.studyOpened) setMessage("책상 위에는 먼지 자국만 남아 있다. 금고를 열어야 서랍을 확인할 수 있을 것 같다.");
        else {
          addNote("date-note", "금고 속 쪽지", "차단기가 살아나면 현관 잠금장치가 풀릴 거야. 비밀번호는 내가 이 집에 온 날, 10월 31일.");
          setMessage("서랍 깊숙이 숨겨진 쪽지에 날짜가 적혀 있다. 10월 31일, 현관 암호일지도 모른다.");
        }
        break;
      case "bookcase":
        addNote("book-note", "책장 안의 기록", "저택 주인의 일기: '세 그림이 지키는 금고. 눈에 보이는 순서대로 번호를 맞춰라.'");
        setMessage("일기 한 장을 발견했다. 현관 홀의 초상화 세 점을 순서대로 살펴야 한다.");
        break;
      case "drawer":
        if (acquire("fuse")) {
          addNote("fuse-note", "찬장 속 메모", "보일러실 차단기함은 퓨즈가 하나 빠져 있다. 예비 퓨즈를 끼우고 레버를 올려야 한다.");
          setMessage("찬장 서랍에서 포장된 퓨즈를 찾았다. 지하 보일러실에 필요해 보인다.");
        } else setMessage("찬장 서랍은 비어 있다. 찾을 만한 것은 이미 챙겼다.");
        break;
      case "tableware":
        setMessage("그릇에는 검은 물이 말라붙어 있다. 식탁 아래를 긁는 소리가 들리지만, 아무것도 보이지 않는다.");
        break;
      case "hatch":
        if (!state.flags.cellarUnlocked && !hasItem("cellarKey")) setMessage("지하실 문은 자물쇠로 잠겨 있다. 철제 열쇠가 필요하다.");
        else doRoute("basement");
        break;
      case "breaker":
        if (!hasItem("fuse") && !state.flags.powerOn) setMessage("퓨즈가 하나 빠져 있다. 주방 찬장에서 예비품을 찾아야 한다.");
        else if (!state.flags.powerOn) {
          state.inventory = state.inventory.filter(function (item) { return item !== "fuse"; });
          state.flags.fuseInstalled = true;
          state.flags.powerOn = true;
          addNote("power-note", "차단기함", "퓨즈를 끼우자 불이 들어왔다. 이제 현관 자물쇠를 확인할 수 있다.");
          playTone(630, .16);
          setMessage("퓨즈를 끼우고 레버를 올렸다. 저택 전체의 불이 깜빡이며 켜진다. 위층에서 발소리가 한 번 들렸다.");
        } else setMessage("차단기는 정상이다. 불빛이 약하게 떨리지만 전원은 유지되고 있다.");
        break;
      case "boiler": setMessage("보일러 안에서 무언가 세 번 두드린다. 손을 대자 금속이 따뜻하다."); break;
      case "crate": setMessage("나무 상자는 안쪽에서 잠겨 있다. 안에 든 것이 가볍게 굴러간다."); break;
      case "stairs": doRoute("kitchen"); break;
      case "toLounge": case "toLoungeFromStudy": case "toLoungeFromKitchen": doRoute("lounge"); break;
      case "toFoyer": case "toFoyerFromStudy": doRoute("foyer"); break;
      case "toStudy": case "toStudyFromLounge": doRoute("study"); break;
      case "toKitchen": doRoute("kitchen"); break;
      default: setMessage("가까이 다가가 살펴본다. 특별한 것은 보이지 않는다.");
    }
  }
  function openCodeModal(mode) {
    codeMode = mode;
    codeValue = "";
    $("#modal-title").textContent = mode === "safe" ? "벽 금고" : "현관 잠금장치";
    $("#modal-kicker").textContent = mode === "safe" ? "잠금 장치 · 3자리" : "현관문 · 4자리";
    $("#modal-copy").textContent = mode === "safe" ? "현관 홀의 초상화에 숨겨진 세 숫자를 순서대로 입력하세요." : "금고 속 쪽지에서 발견한 날짜를 입력하세요.";
    $("#code-error").textContent = "";
    $("#modal-backdrop").hidden = false;
    drawCode();
    var first = $("#keypad button");
    if (first) first.focus();
  }
  function drawCode() {
    var count = codeMode === "safe" ? 3 : 4;
    var display = $("#code-display");
    display.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var cell = document.createElement("span");
      cell.className = "code-cell";
      cell.textContent = codeValue[i] || "·";
      display.appendChild(cell);
    }
  }
  function closeCodeModal() {
    $("#modal-backdrop").hidden = true;
    codeMode = null;
    codeValue = "";
  }
  function enterDigit(value) {
    if (!codeMode) return;
    if (value === "clear") { codeValue = ""; $("#code-error").textContent = ""; drawCode(); return; }
    if (value === "enter") { submitCode(); return; }
    if (!/^\d$/.test(value)) return;
    var max = codeMode === "safe" ? 3 : 4;
    if (codeValue.length < max) {
      codeValue += value;
      $("#code-error").textContent = "";
      drawCode();
      if (codeValue.length === max) window.setTimeout(submitCode, 240);
    }
  }
  function submitCode() {
    if (!codeMode) return;
    var mode = codeMode;
    var expected = mode === "safe" ? "314" : "1031";
    if (codeValue !== expected) {
      $("#code-error").textContent = mode === "safe" ? "잠금 장치가 움직이지 않는다. 초상화의 순서를 다시 생각해 보세요." : "숫자가 맞지 않는다. 쪽지에 적힌 날짜를 확인해 보세요.";
      playTone(115, .12);
      codeValue = "";
      drawCode();
      return;
    }
    closeCodeModal();
    if (mode === "safe") {
      state.flags.studyOpened = true;
      state.flags.cellarUnlocked = true;
      acquire("cellarKey");
      addNote("safe-note", "금고 속 편지", "차단기가 살아나면 현관 잠금장치가 풀릴 거야. 비밀번호는 내가 이 집에 온 날, 10월 31일.");
      setMessage("금고가 열렸다. 지하실 열쇠와 낡은 편지를 챙겼다. 편지에는 10월 31일이 적혀 있다.");
      playTone(740, .13);
    } else {
      state.flags.exitOpened = true;
      setMessage("숫자 자물쇠가 풀렸다. 문 너머로 차가운 밤공기가 들어온다.");
      playTone(740, .19);
      window.setTimeout(finishGame, 700);
    }
    updatePanels();
    saveState();
  }
  function finishGame() {
    $("#ending-rooms").textContent = state.visited.length;
    $("#ending-notes").textContent = state.notes.length;
    $("#ending-screen").hidden = false;
    saveState();
  }
  function hint() {
    var text;
    if (!state.flags.portraits) text = "현관 홀 벽에 걸린 초상화를 순서대로 살펴봐. 그림마다 숫자로 셀 수 있는 것이 있어.";
    else if (!hasItem("studyKey")) text = "거실 소파의 틈을 조사해 봐. 작은 열쇠가 끼어 있을 수 있어.";
    else if (!state.flags.studyOpened) text = "서재 금고의 세 숫자는 현관 홀 초상화에 있어. 왼쪽부터 읽으면 돼.";
    else if (!hasItem("fuse") && !state.flags.powerOn) text = "주방 찬장 서랍에 퓨즈가 있어. 챙겨서 지하실로 내려가.";
    else if (!state.flags.powerOn) text = "보일러실 차단기함에 퓨즈를 끼우고 레버를 조사해 봐.";
    else if (!state.flags.exitOpened) text = "서재에서 찾은 쪽지의 날짜는 10월 31일이야. 현관에서 1031을 입력해.";
    else text = "현관문은 이제 열려 있어. 현관 홀로 돌아가 문을 조사해.";
    setMessage("힌트: " + text);
  }
  function playTone(frequency, duration) {
    if (!state.sound) return;
    try {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      if (!audioContext) audioContext = new AudioCtor();
      if (audioContext.state === "suspended") audioContext.resume();
      var oscillator = audioContext.createOscillator();
      var gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.025, audioContext.currentTime + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration + .02);
    } catch (error) {}
  }
  function toggleSound() {
    state.sound = !state.sound;
    saveState();
    updatePanels();
    if (state.sound) playTone(450, .08);
  }
  function resetGame() {
    state = freshState();
    state.started = true;
    state.lastText = "눈을 뜨자 낡은 현관 홀이다. 문은 잠겨 있고, 집 안에는 당신 말고 다른 숨소리가 들린다.";
    $("#ending-screen").hidden = true;
    $("#intro-screen").hidden = true;
    $("#game-layout").hidden = false;
    renderRoom();
    updatePanels();
    setMessage(state.lastText);
    saveState();
  }

  $("#start-button").addEventListener("click", function () {
    if (state.started && !window.confirm("저장된 진행 상황을 지우고 새로 시작할까요?")) return;
    beginGame(false);
  });
  $("#continue-button").addEventListener("click", function () { beginGame(true); });
  $("#restart-button").addEventListener("click", function () {
    if (state.started && window.confirm("저장된 진행 상황을 지우고 처음부터 다시 조사할까요?")) resetGame();
  });
  $("#play-again-button").addEventListener("click", resetGame);
  $("#sound-toggle").addEventListener("click", toggleSound);
  $("#hint-button").addEventListener("click", hint);
  $("#modal-close").addEventListener("click", closeCodeModal);
  $("#modal-backdrop").addEventListener("click", function (event) {
    if (event.target === $("#modal-backdrop")) closeCodeModal();
  });
  $("#keypad").addEventListener("click", function (event) {
    var button = event.target.closest("[data-key]");
    if (button) enterDigit(button.getAttribute("data-key"));
  });
  $("#hotspots").addEventListener("click", function (event) {
    var button = event.target.closest("[data-spot]");
    if (button) handleSpot(button.getAttribute("data-spot"));
  });
  $("#map-list").addEventListener("click", function (event) {
    var button = event.target.closest("[data-map-room]");
    if (button) goToRoom(button.getAttribute("data-map-room"));
  });
  window.addEventListener("keydown", function (event) {
    if ($("#modal-backdrop").hidden) return;
    if (event.key === "Escape") closeCodeModal();
    else if (event.key === "Backspace") { codeValue = codeValue.slice(0, -1); $("#code-error").textContent = ""; drawCode(); }
    else if (/^\d$/.test(event.key)) enterDigit(event.key);
    else if (event.key === "Enter") submitCode();
  });

  var saved = loadState();
  if (saved && saved.started) {
    state = saved;
    $("#continue-button").hidden = false;
    $("#start-button").querySelector("span").textContent = "새로 조사 시작";
  }
  updatePanels();
})();
