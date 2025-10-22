const questions = document.querySelectorAll(".faq-question");
    questions.forEach(q => {
      q.addEventListener("click", () => {
        q.classList.toggle("active");
        const answer = q.nextElementSibling;
        answer.style.display = answer.style.display === "block" ? "none" : "block";
      });
    });