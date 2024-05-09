export const ShowToolTip = (text: string, x: number, y: number) => {
  const tooltip = document.getElementById("tooltip");
  const tooltiptext = document.getElementById("tooltiptext");
  if (tooltiptext && tooltip) {
    tooltiptext.innerText = text;

    if (x < 0) {
      tooltip.style.right = -x + "px";
      tooltip.style.left = "";
    } else {
      tooltip.style.left = x + "px";
      tooltip.style.right = "";
    }

    if (y < 0) {
      tooltip.style.bottom = -y + "px";
      tooltip.style.top = "";
    } else {
      tooltip.style.top = y + "px";
      tooltip.style.bottom = "";
    }

    tooltip.style.top = y + "px";

    tooltip.classList.add("show");

    setTimeout(function () {
      tooltip.classList.remove("show");
    }, 3000);
  }
};
