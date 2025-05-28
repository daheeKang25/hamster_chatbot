const hamster = document.getElementById("hamster");
const msgBox = document.getElementById("messageBox");
const inputArea = document.getElementById("inputArea");
const bulb = document.getElementById("bulb");

const messages = [
  "안녕!",
  "내가 지금부터 너의 마음을 읽어볼게!",
  "네가 아까 알려준 문장들로 내가 방금 공부를 했어!",
  "문장을 쓰면,\n네가 햄버거가 먹고싶은지,\n먹고싶지 않은지 맞춰볼게~"
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
  let chars = [...text];
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

        if (data.result === 1) {
          hamster.src = "/static/smile.png";
          typeMessage("알았다!\n너 지금 햄버거가 먹고싶구나!");
        } else {
          hamster.src = "/static/sad.png";
          typeMessage("알았다!\n너 지금 햄버거가 먹고싶지 않구나 😢");
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
