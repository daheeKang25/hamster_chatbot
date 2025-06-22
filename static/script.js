const hamster = document.getElementById("hamster");
const msgBox = document.getElementById("messageBox");
const inputArea = document.getElementById("inputArea");
const bulb = document.getElementById("bulb");

const messages = [
  "안녕!",
  "내가 지금부터 너의 마음을 읽어볼게! (و ˃̵ᴗ˂̵)و ",
  "네가 아까 알려준 문장들로 내가 방금 공부를 했어!",
  "문장을 쓰면,\n네가 햄버거가 먹고 싶은지,\n먹고 싶지 않은지 맞혀볼게~\nᐠ( ᐢ ᵕ ᐢ )ᐟ"
];

function blink(times = 2, callback) {
  let count = 0;
  const interval = setInterval(() => {
    hamster.src = "/static/closed.png";
    setTimeout(() => {
      hamster.src = "/static/default.png";
    }, 200);
    count++;
    if (count >= times) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 600);
}

function typeMessage(text, callback) {
  msgBox.innerHTML = "";
  let chars = Array.from(text); //한글지원수정
  let i = 0;
  const interval = setInterval(() => {
    if (chars[i] === "\n") {
  msgBox.innerHTML += "<br>";
} else if (chars[i] === " ") {
  msgBox.innerHTML += "&nbsp;";
} else {
  msgBox.innerHTML += chars[i];
}
    i++;
    if (i >= chars.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 60);
}

function showMessage(index = 0) {
  if (index >= messages.length) {
    inputArea.style.display = "block";
    return;
  }
  blink(1, () => {
    typeMessage(messages[index], () => {
      setTimeout(() => showMessage(index + 1), 1000);
    });
  });
}

function getConfidenceInfo(confidence) {
  let emoji = "⭐️";
  let level = "거의 몰라...";

  if (confidence >= 0.9) {
    emoji = "⭐⭐️⭐️⭐️⭐️️";
    level = "엄청 확신해!";
  } else if (confidence >= 0.7) {
    emoji = "⭐️⭐️⭐️⭐️";
    level = "꽤 확신해!";
  } else if (confidence >= 0.5) {
    emoji = "⭐️⭐️⭐️";
    level = "조금 헷갈려~";
  } else if (confidence >= 0.3) {
    emoji = "⭐️⭐️";
    level = "별로 확신은 없어...";
  } else {
    emoji = "⭐️";
    level = "거의 몰라...";
  }

  return { emoji, level };
}
function sendMessage() {
  const message = document.getElementById("userInput").value;
  msgBox.innerText = "생각 중...";
  hamster.src = "/static/closed.png";
  bulb.style.display = "none";

  fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: message })
  })
  .then(response => response.json())
  .then(data => {
    setTimeout(() => {
      const oldBubble = document.querySelector(".confidence-bubble");
      if (oldBubble) oldBubble.remove();

      if (data.confidence < 0.4) {
        hamster.src = "/static/question.png";
        typeMessage("잘 이해가 안돼...\n다른 문장을 다시 써줄래?");
      } else {
        bulb.style.display = "block";
        bulb.classList.add("blinking");
        setTimeout(() => {
          bulb.style.display = "none";
          bulb.classList.remove("blinking");
        }, 1800);

        const { emoji, level} = getConfidenceInfo(data.confidence);
        const explanation = `<br><small>( 별이 많을수록 햄스터가 더 자신있어해요!)<br> 햄스터의 말 : <strong>${level}</strong></small>`;

        const bar = document.createElement("div");
        bar.className = "confidence-bubble";
        bar.innerHTML = `자신감: ${emoji} ${explanation}`;
        msgBox.after(bar);

        if (data.result === 1) {
          hamster.src = "/static/smile.png";
          typeMessage("알았다!\n너 지금 햄버거가 먹고 싶구나! «٩(*´∀`*)۶» ");
        } else {
          hamster.src = "/static/sad.png";
          typeMessage("알았어...\n너 지금 햄버거가 먹고 싶지 않구나 (T⌓T) ");
        }
      }
    }, 500);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("userInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
  showMessage();
});
