async function sendMsg() {
  const input = document.getElementById("userInput");
  const message = input.value;
  if (!message) return;

  addMessage("You", message);
  input.value = "";

  // Add loading indicator
  addMessage("AI", "Thinking...");
  const box = document.getElementById("chatBox");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    // Remove loading indicator and add actual response
    box.lastElementChild.remove();
    addMessage("AI", data.reply);
  } catch (error) {
    // Remove loading and show error
    box.lastElementChild.remove();
    addMessage("AI", "Sorry, I couldn't process your request. Please try again.");
  }
}

function addMessage(sender, text) {
  const box = document.getElementById("chatBox");
  box.innerHTML += `<p><b>${sender}:</b> ${text}</p>`;
  box.scrollTop = box.scrollHeight;
}

// Allow Enter key to send message
document.getElementById("userInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    sendMsg();
  }
});
