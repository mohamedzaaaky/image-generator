const promptForm = document.querySelector(".prompt-form");
const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input");
const generateBtn = document.querySelector(".generate-btn");
const galleryGrid = document.querySelector(".gallery-grid");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");


// Example prompts
const examplePrompts = [
  "A young adult Black man, positioned slightly to the right of the image's center, sits at a desk, engrossed in work. He is seen from the mid-chest up, in profile view, facing to his left. He is wearing a light gray t-shirt with a subtle, patterned design. He wears blue headphones, and his short dark hair is styled in a slightly textured cut. His expression is focused and attentive. He appears to be typing on a computer keyboard in front of a computer monitor displaying code. The room is decorated with various potted plants and a simple lamp, suggesting a home office or study environment. The backdrop features a teal-toned wall with subtle visual patterns.  The lighting is soft and warm, illuminating the workspace well. The composition is straightforward, emphasizing the person's focus and the work environment. The overall atmosphere is one of concentration and productivity.  The colors are predominantly neutral and blue-toned.  The perspective is from a slightly elevated, close-up view of the person, focusing on his work.",
  "A light-skinned, middle-aged man is centrally positioned against a gray wall.  He is dressed in a formal black suit, including a jacket, trousers, and a white collared shirt with a dark tie.  His arms are crossed over his chest.  His hair is short, and he has a short trimmed beard and mustache.  His facial expression is neutral and serious, almost stoic.  He appears to be of a slender build. His legs are positioned with one foot slightly in front of the other. The man's gaze is directly forward, at the viewer.  The setting is a neutral indoor environment, likely a studio. The gray wall and the light-colored wooden floor are the primary environmental elements.  The lighting is even and bright, casting no significant shadows. The overall tone is professional and serious, with a neutral and somewhat formal atmosphere.  The image is in a classic, portrait-style composition, with the man filling a large portion of the frame.  The perspective is a full shot, from slightly above the waist.",
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
  "A beautiful young baby with chubby cheeks, bright green eyes, and soft brown hair. The child is sitting and smiling gently, wearing cozy and elegant clothes in warm tones of pink and beige. The skin is perfectly retouched with a smooth, glowing appearance, featuring a wheatish complexion. The atmosphere is soft and warm, capturing a tender and joyful moment with high attention to detail and harmony in the scene",
];
// Set theme based on saved preference or system default
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();
// Switch between light and dark themes
const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};
// Calculate width/height based on chosen ratio
const getImageDimensions = (aspectRatio, baseSize = 720) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);
  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);
  // Ensure dimensions are multiples of 16 (AI model requirements)
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
  return { width: calculatedWidth, height: calculatedHeight };
};
// Replace loading spinner with the actual image
const updateImageCard = (index, imageUrl) => {
  const imgCard = document.getElementById(`img-card-${index}`);
  if (!imgCard) return;
  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img class="result-img" src="${imageUrl}" />
                <div class="img-overlay">
                  <a href="${imageUrl}" class="img-download-btn" title="Download Image" download>
                    <i class="fa-solid fa-download"></i>
                  </a>
                </div>`;
};
// Send requests to Hugging Face API to create images
// const generateImages = async (
//   selectedModel,
//   imageCount,
//   aspectRatio,
//   promptText
// ) => {
//   const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
//   const { width, height } = getImageDimensions(aspectRatio);
//   generateBtn.setAttribute("disabled", "true");
//   // Create an array of image generation promises
//   const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
//     try {
//       // Send request to the AI model API
//       const response = await fetch(MODEL_URL, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${API_KEY}`,
//           "Content-Type": "application/json",
//           "x-use-cache": "false",
//         },
//         body: JSON.stringify({
//           inputs: promptText,
//           parameters: { width, height },
//         }),
//       });
//       if (!response.ok) throw new Error((await response.json())?.error);
//       // Convert response to an image URL and update the image card
//       const blob = await response.blob();
//       updateImageCard(i, URL.createObjectURL(blob));
//     } catch (error) {
//       console.error(error);
//       const imgCard = document.getElementById(`img-card-${i}`);
//       imgCard.classList.replace("loading", "error");
//       imgCard.querySelector(".status-text").textContent =
//         "Generation failed! Check console for more details.";
//     }
//   });
//   await Promise.allSettled(imagePromises);
//   generateBtn.removeAttribute("disabled");
// };

const generateImages = async (
  selectedModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", "true");

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: promptText,
          width,
          height,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const blob = await response.blob();
      updateImageCard(i, URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent =
        "Generation failed! Check console for more details.";
    }
  });

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};



// Create placeholder cards with loading spinners
const createImageCards = (
  selectedModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  galleryGrid.innerHTML = "";
  for (let i = 0; i < imageCount; i++) {
    galleryGrid.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
          <div class="spinner"></div>
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p class="status-text">Generating...</p>
        </div>
      </div>`;
  }
  // Stagger animation
  document.querySelectorAll(".img-card").forEach((card, i) => {
    setTimeout(() => card.classList.add("animate-in"), 100 * i);
  });
  generateImages(selectedModel, imageCount, aspectRatio, promptText); // Generate Images
};
// Handle form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  // Get form values
  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();
  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};
// Fill prompt input with random example (typing effect)
promptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  let i = 0;
  promptInput.focus();
  promptInput.value = "";
  // Disable the button during typing animation
  promptBtn.disabled = true;
  promptBtn.style.opacity = "0.5";
  // Typing effect
  const typeInterval = setInterval(() => {
    if (i < prompt.length) {
      promptInput.value += prompt.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
      promptBtn.disabled = false;
      promptBtn.style.opacity = "0.8";
    }
  }, 10); // Speed of typing
});
themeToggle.addEventListener("click", toggleTheme);
promptForm.addEventListener("submit", handleFormSubmit);
