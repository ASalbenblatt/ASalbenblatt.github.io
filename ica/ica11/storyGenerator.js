// Complete variable definitions and random functions

const customName = document.getElementById("custom-name");
const generateBtn = document.querySelector(".generate");
const story = document.querySelector(".story");

function randomValueFromArray(array) {
    const random = Math.floor(Math.random() * array.length);
    return array[random];
}

// Raw text strings
const characters = ["Big Boi", "Bob Number 2", "G-ma"];
const places = ["the soup kitchen", "Disneyland", "the White House"];
const events = [
    "the jet spontaneously combusted",
    "the pilot died",
    "a mountain came out of nowhere",
];

// Partial return random string function

function returnRandomStoryString() {
    const randomCharacter = randomValueFromArray(characters)
    const randomPlace = randomValueFromArray(places)
    const randomEvent = randomValueFromArray(events)

    const storyText = `It was 94 Fahrenheit outside, so ${randomCharacter} got in their private jet and flew to ${randomPlace}, sadly, they crashed because ${randomEvent}. Bob saw the whole thing, but was not surprised — ${randomCharacter} weighs 300 pounds, and it was a hot day.`

    return storyText;
}

// Event listener and partial generate function definition

generateBtn.addEventListener("click", generateStory);

function generateStory() {
    
    let newStory = returnRandomStoryString()
    
    if (customName.value !== "") {
        const name = customName.value;
        newStory = newStory.replaceAll("Bob", name)
    }

    if (document.getElementById("uk").checked) {
        const weight = Math.round(300*0.0714286) + " stone";
        const temperature = Math.round((94-32)*5/9) + " Celsius";
        newStory = newStory.replaceAll("300 pounds", weight)
        newStory = newStory.replaceAll("94 Fahrenheit", temperature)
    }
    story.textContent = newStory;
    story.style.visibility = "visible";
}
