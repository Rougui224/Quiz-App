import { quizSessions } from "./data.js";
// Générer un nombre aléatoire entre 0 et 4
let randomVariable,
  lastRandomVariable = "",
  index = 0,
  score = 0,
  timeoutId,
  currentSection,
  UserCorrectAnswers = [],
  wrongAnswers = [],
  prevRandomVariables =
    JSON.parse(localStorage.getItem("prevRandomVariables")) || [];
function updatePRVtoLogalStorage() {
  localStorage.setItem(
    "prevRandomVariables",
    JSON.stringify(prevRandomVariables)
  );
} // Affiche un nombre aléatoire entre 0 et 4

function CheckRamdomVarable() {
  if (prevRandomVariables.length === quizSessions.length) {
    lastRandomVariable = prevRandomVariables[prevRandomVariables.length - 1];
    prevRandomVariables = [];
    updatePRVtoLogalStorage();
  }
  do {
    randomVariable = Math.floor(Math.random() * quizSessions.length);
  } while (
    prevRandomVariables.includes(randomVariable) ||
    randomVariable === lastRandomVariable
  );
  prevRandomVariables.push(randomVariable);
  updatePRVtoLogalStorage();
  lastRandomVariable = "";
}
function calculateScore(correctAnswers) {
  if (
    UserCorrectAnswers.length === correctAnswers.length &&
    wrongAnswers.length === 0
  ) {
    score = score + 1;
  }
}
function showCheck() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(function () {
    checkQuiz();
  }, 30000);
}
function startQuiz() {
  currentSection = quizSessions[randomVariable].questions;

  if (index === currentSection.length) {
    $(".app_quiz").removeClass("starting").addClass("exiting");
    $(".modal").show();
    $(".overlay").show();
    $(".progress").hide();
    if (score >= 5) {
      $(".modal p").text(
        `Congratulations! You scored ${score}/${currentSection.length}! Keep it up!`
      );
    } else {
      $(".modal p").text(
        `Good try! Your score is ${score}/${currentSection.length}. You can do even better next time!`
      );
    }

    $(".modal button").text("Continue");
    $(".app_questionNumber").text("");

    score = 0;
    index = 0;
    clearTimeout(timeoutId);
    return;
  }
  const areaQuestionElement = $(".app_quiz_question");
  const optionsListElements = $(".app_quiz_options p");
  optionsListElements
    .removeClass("active")
    .removeClass("error")
    .removeClass("done");
  $(".progress").show();
  $(".validateButton").show();
  $(".nextButton").hide();
  $(".app_questionNumber").text(`${index + 1}`);
  const question = currentSection[index].question,
    options = currentSection[index].options,
    correctAnswers = currentSection[index].correctAnswers;
  areaQuestionElement.text(question);
  optionsListElements.each(function (index, element) {
    $(element).text(options[index]);
    $(element)
      .off("click")
      .on("click", function () {
        $(this).addClass("active");
        if (correctAnswers.includes(index)) {
          UserCorrectAnswers.push(index);
        } else {
          wrongAnswers.push(index);
        }
      });
  });
}
function startTimingElement() {
  const progressElement = $(".progress");

  // Supprimer la classe "timing"
  progressElement.removeClass("timing");
  progressElement.show();
  // Forcer un reflow : Accéder à une propriété telle que offsetWidth ou offsetHeight force le navigateur à recalculer le style et re-rendre l'élément, ce qui permet de "réinitialiser" l'animation.
  void progressElement[0].offsetWidth;

  // Réappliquer la classe "timing" pour redémarrer l'animation
  progressElement.addClass("timing");
}
function checkQuiz() {
  $(".progress").hide();
  $(".validateButton").hide();
  $(".nextButton").show();
  const correctAnswers = currentSection[index].correctAnswers;

  $(".app_quiz_options p").each(function (index, element) {
    if (correctAnswers.includes(index)) {
      $(element).addClass("done");
    } else {
      if (wrongAnswers.length > 0) {
        $(element).addClass("error");
      }
    }
  });
  calculateScore(correctAnswers);
  clearTimeout(timeoutId);
  UserCorrectAnswers = [];
  wrongAnswers = [];
  index++;
}
$(".validateButton").click(function () {
  checkQuiz();
});
$(".nextButton").click(function () {
  startQuiz();
  startTimingElement();
  showCheck();
});
$(".modal").click(function () {
  CheckRamdomVarable();
  startQuiz();
  startTimingElement();
  showCheck();

  $(this).hide();
  $(".overlay").hide();
  $(".app_quiz").removeClass("exiting").addClass("starting");
});
