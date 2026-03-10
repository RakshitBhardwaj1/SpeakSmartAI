import React from "react";
import { Lightbulb, Volume2 } from "lucide-react";
function QuestionsSection({ interviewQuestions, activeQuestionIndex, setActiveQuestionIndex }) {
    const currentQuestion = interviewQuestions?.[activeQuestionIndex];
    const currentQuestionText =
      typeof currentQuestion === "string"
        ? currentQuestion
        : currentQuestion?.question ||
          currentQuestion?.text ||
          currentQuestion?.prompt ||
          currentQuestion?.content ||
          "No question available";

    const textToSpeech = (text) => {
      if (!window.speechSynthesis) {
        alert("Sorry, your browser does not support text-to-speech.");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    };

  return interviewQuestions &&(
    <div className="p-5 border rounded-lg bg-white dark:bg-black">
      <div className='grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3'>
        {interviewQuestions?.map((question, index) => (
          <h2
            key={index}
            onClick={() => setActiveQuestionIndex(index)}
            className={`p-2 bg-primary rounded-full
          text-x5 md:text-sm text-center cursor-pointer ${activeQuestionIndex==index ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'}`}>
            Question #{index + 1}
          </h2>
        ))}
       
      </div>
       <h2 className='my-5 text-sm md:text-lg'>
         {currentQuestionText}
       </h2>
       <Volume2 onClick={() => textToSpeech(currentQuestionText)} />
       <div className="border rounded-lg p-5 bg-blue-100 my-0">
        <Lightbulb/>
         <h2 className="flex gap-2 items-center text-primary my-2">
         
            <strong className="text-sm">Note: Click on Record Answer when you want to answer the question. At the end of the interview we will give you the feedback along with correct answer for each question on the basis of your performance and your body language and speech tone</strong> 

         </h2>
       </div>
    </div>
  );
}

export default QuestionsSection;
