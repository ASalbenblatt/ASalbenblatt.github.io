const newBTN = document.querySelector("#js-new-quote")
const ansBTN = document.querySelector("#js-tweet")
let current = {
    question: "",
    answer: ""
}

newBTN.addEventListener("click", getQuote)
ansBTN.addEventListener("click", displayAnswer)

const APIEndpoint = "https://trivia.cyberwisp.com/getrandomchristmasquestion"
async function getQuote () {
    // console.log("Pressed")
    try {
        const response = await fetch(APIEndpoint)
        if (!response.ok) {
            throw Error(response.statusText)
        }
        const json = await response.json()
        // console.log(json)
        current.question = json.question
        current.answer = json.answer
        displayQuote()
    } catch (error) {
        console.log(error)
        alert("Failed to fetch a quote")
    }
}

function displayQuote () {
    const quoteDiv = document.querySelector("#js-quote-text")
    quoteDiv.textContent = current.question
    document.querySelector("#js-answer-text").textContent = ""
}

function displayAnswer () {
    const ansDiv = document.querySelector("#js-answer-text")
    ansDiv.textContent = current.answer
}

getQuote()