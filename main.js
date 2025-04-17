const slides = [
  {
    title: "Why Join Vought International?",
    bullets: [
      "Elite alliance with experienced leadership",
      "Risen from the ashes of The Wei",
      "Inviting the best of the best only"
    ]
  },
  {
    title: "What We Offer",
    bullets: [
      "⚠️ Optional Taxes",
      "🥷 Ex-alliance leaders, dept heads, and more",
      "⚔️ Active community and protection"
    ]
  },
  {
    title: "Even More Perks",
    bullets: [
      "⛔️ Looking for Elite Nations",
      "👶 Noob friendly with expert guides",
      "🏴‍☠️ Non-strict raiding, 🏳️ Peaceful environment"
    ]
  },
  {
    title: "Join Us Now",
    bullets: [
      "💸 Fast Growth Grants",
      "Join the journey to greatness",
      "<a href='https://discord.gg/5zkUhpFUBt' target='_blank'>Discord Server</a>",
      "<a href='https://politicsandwar.com/alliance/id=13410' target='_blank'>Alliance Page</a>",
      "<a href='https://blackdragonpw.github.io/VoughtInternational/' target='_blank'>Official Website</a>"
    ]
  },
  {
    title: "Get Started",
    bullets: [
      "<button onclick='window.location="signup.html"'>Login or Sign Up</button>"
    ]
  }
];

let current = 0;
const container = document.getElementById('slide-container');

function renderSlide(index) {
  const slide = slides[index];
  container.innerHTML = `
    <h2>${slide.title}</h2>
    <ul>
      ${slide.bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  `;
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (current > 0) {
    current--;
    renderSlide(current);
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (current < slides.length - 1) {
    current++;
    renderSlide(current);
  }
});

renderSlide(current);