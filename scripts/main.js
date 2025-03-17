document.querySelectorAll(".circle").forEach((circle) => {
  circle.addEventListener("click", () => {
    const level = circle.getAttribute("data-level");
    window.location.href = `level.html?unit=${level}`;
  });
});
